import crypto from 'crypto';
import express, { Request, Response } from 'express';
import axios from 'axios';
import { User, LoginActivity } from './models';
import { generateTokens, refreshAccessToken } from './auth';
import { createLoginActivity, getClientIp } from './activity';

const router = express.Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/google/callback';

// In-memory state store (use Redis in production)
const pendingStates = new Map<string, number>();

// Initiate Google OAuth — returns the authorization URL
router.get('/google', (_req: Request, res: Response) => {
  const state = crypto.randomBytes(32).toString('hex');
  pendingStates.set(state, Date.now());
  // Expire states older than 10 minutes
  for (const [s, t] of pendingStates) {
    if (Date.now() - t > 10 * 60 * 1000) pendingStates.delete(s);
  }
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid profile email',
    state,
    access_type: 'offline',
    prompt: 'consent',
  });
  res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}`, state });
});

// Google OAuth callback — exchanges code for tokens on the backend
router.post('/google/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.body;

    if (!code || !state) {
      return res.status(400).json({ error: 'code and state are required' });
    }

    // Validate state (CSRF protection)
    if (!pendingStates.has(state)) {
      return res.status(400).json({ error: 'Invalid or expired state parameter' });
    }
    pendingStates.delete(state);

    // Exchange authorization code for tokens (secret stays on backend)
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }).toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

    const { access_token } = tokenRes.data;

    // Fetch user profile from Google
    const profileRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const googleUser = profileRes.data as {
      id: string; email: string; name: string; picture: string; verified_email: boolean;
    };

    // Upsert user
    let user = await User.findOne({ googleId: googleUser.id });

    if (!user) {
      // Create new user
      const userId = `user_${Date.now()}`;
      user = new User({
        id: userId,
        googleId: googleUser.id,
        email: googleUser.email,
        fullName: googleUser.name,
        profilePicture: googleUser.picture,
        emailVerified: googleUser.verified_email,
        role: 'user',
        accountStatus: 'active',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        loginCount: 1,
      });
      await user.save();
    } else {
      // Update last login
      user.lastLoginAt = new Date();
      user.loginCount = (user.loginCount || 0) + 1;
      await user.save();
    }

    // Create login activity
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = getClientIp(req);
    const activity = await createLoginActivity(
      user.id,
      user.fullName,
      user.email,
      userAgent,
      ipAddress,
      'success'
    );
    await LoginActivity.create(activity);

    // Generate tokens
    const tokens = generateTokens(user.id, user.role);

    res.json({
      user: {
        id: user.id,
        googleId: user.googleId,
        email: user.email,
        fullName: user.fullName,
        profilePicture: user.profilePicture,
        role: user.role,
        emailVerified: user.emailVerified
      },
      tokens
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Logout
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    // Update logout time for active session
    await LoginActivity.findOneAndUpdate(
      { userId, logoutTime: null },
      { logoutTime: new Date().toISOString() },
      { sort: { loginDate: -1 } }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get current user
router.get('/me', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        googleId: user.googleId,
        email: user.email,
        fullName: user.fullName,
        profilePicture: user.profilePicture,
        role: user.role,
        emailVerified: user.emailVerified,
        accountStatus: user.accountStatus,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Get user's login history
router.get('/login-history', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const activities = await LoginActivity.find({ userId })
      .sort({ loginDate: -1 })
      .limit(50);

    res.json({ activities });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch login history' });
  }
});

// Update profile
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { fullName, profilePicture } = req.body;

    const user = await User.findOneAndUpdate(
      { id: userId },
      {
        ...(fullName && { fullName }),
        ...(profilePicture && { profilePicture })
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Refresh JWT using refresh token
router.post('/refresh', (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });
  const tokens = refreshAccessToken(refreshToken);
  if (!tokens) return res.status(401).json({ error: 'Invalid or expired refresh token' });
  res.json({ accessToken: tokens.accessToken, expiresIn: tokens.expiresIn });
});

export default router;
