import jwt from 'jsonwebtoken';
import axios from 'axios';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  email_verified: boolean;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SessionData {
  userId: string;
  googleId: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  loginTime: Date;
}

/**
 * Verify Google ID token and extract user information
 */
export async function verifyGoogleToken(idToken: string): Promise<GoogleUser> {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?id_token=${idToken}`
    );

    if (response.data.aud !== GOOGLE_CLIENT_ID) {
      throw new Error('Invalid token audience');
    }

    return {
      id: response.data.sub,
      email: response.data.email,
      name: response.data.name,
      picture: response.data.picture,
      email_verified: response.data.email_verified,
    };
  } catch (error) {
    throw new Error('Failed to verify Google token');
  }
}

/**
 * Generate JWT tokens for session management
 */
export function generateTokens(userId: string, role: string): AuthToken {
  const accessToken = jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: 3600,
  };
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): SessionData | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Refresh access token using refresh token
 */
export function refreshAccessToken(refreshToken: string): AuthToken | null {
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;
    return generateTokens(decoded.userId, decoded.role);
  } catch (error) {
    return null;
  }
}
