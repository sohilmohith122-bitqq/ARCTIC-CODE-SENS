import express, { Request, Response } from 'express';
import { User, LoginActivity } from './models';
import { verifyGoogleToken, generateTokens } from './auth';
import { createLoginActivity, getClientIp } from './activity';

const router = express.Router();

// Google OAuth callback
router.post('/google/callback', async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'ID token required' });
    }

    // Verify Google token
    const googleUser = await verifyGoogleToken(idToken);

    // Check if user exists
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
        emailVerified: googleUser.email_verified,
        role: 'user',
        accountStatus: 'active',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        loginCount: 1
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

export default router;
