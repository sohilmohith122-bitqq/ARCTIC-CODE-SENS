# Google OAuth 2.0 Backend Implementation Guide

## Overview

This guide provides complete backend implementation for Google OAuth 2.0 authentication with Express.js, MongoDB, and JWT tokens.

## Prerequisites

- Node.js 18+
- Express.js 4.x
- MongoDB 5.x
- jsonwebtoken
- axios or node-fetch
- dotenv

## Installation

```bash
npm install express mongoose jsonwebtoken axios dotenv cors helmet express-rate-limit
npm install --save-dev @types/express @types/node typescript
```

## Environment Variables

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_token_secret_min_32_chars
JWT_EXPIRY=3600
JWT_REFRESH_EXPIRY=604800

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/arctic-code-sens
NODE_ENV=development
PORT=5000
```

## Database Schema

### User Model

```typescript
interface User {
  _id: ObjectId
  googleId: string (unique)
  email: string (unique)
  name: string
  avatar?: string
  emailVerified: boolean
  role: "user" | "admin"
  createdAt: Date
  lastLoginAt: Date
  totalReviews: number
  avgScore: number
  favoriteLanguage: string
  settings: {
    theme: "dark" | "light"
    notifications: boolean
    learningMode: boolean
  }
}
```

### MongoDB Schema

```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["googleId", "email", "name", "emailVerified", "role", "createdAt"],
      properties: {
        _id: { bsonType: "objectId" },
        googleId: { bsonType: "string", description: "Google user ID" },
        email: { bsonType: "string", pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" },
        name: { bsonType: "string" },
        avatar: { bsonType: "string" },
        emailVerified: { bsonType: "bool" },
        role: { enum: ["user", "admin"] },
        createdAt: { bsonType: "date" },
        lastLoginAt: { bsonType: "date" },
        totalReviews: { bsonType: "int", minimum: 0 },
        avgScore: { bsonType: "double", minimum: 0, maximum: 100 },
        favoriteLanguage: { bsonType: "string" },
        settings: {
          bsonType: "object",
          properties: {
            theme: { enum: ["dark", "light"] },
            notifications: { bsonType: "bool" },
            learningMode: { bsonType: "bool" }
          }
        }
      }
    }
  }
})

// Create indexes
db.users.createIndex({ googleId: 1 }, { unique: true })
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ createdAt: -1 })
db.users.createIndex({ lastLoginAt: -1 })
```

## API Endpoints

### 1. Google OAuth Callback

**Endpoint**: `POST /auth/google/callback`

**Request Body**:
```json
{
  "code": "authorization_code_from_google",
  "idToken": "id_token_from_google",
  "googleUser": {
    "id": "118364144313123456789",
    "email": "user@gmail.com",
    "name": "John Doe",
    "picture": "https://lh3.googleusercontent.com/...",
    "email_verified": true
  }
}
```

**Response**:
```json
{
  "user": {
    "id": "user_id",
    "googleId": "118364144313123456789",
    "email": "user@gmail.com",
    "name": "John Doe",
    "avatar": "https://lh3.googleusercontent.com/...",
    "emailVerified": true,
    "role": "user",
    "createdAt": "2024-01-15T10:30:00Z",
    "lastLoginAt": "2024-01-15T10:30:00Z",
    "totalReviews": 0,
    "avgScore": 0,
    "favoriteLanguage": "python"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  },
  "isNewUser": true
}
```

**Implementation**:

```typescript
import express from "express"
import axios from "axios"
import jwt from "jsonwebtoken"
import User from "../models/User"

const router = express.Router()

router.post("/auth/google/callback", async (req, res) => {
  try {
    const { code, idToken, googleUser } = req.body

    // Verify ID token with Google
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?id_token=${idToken}`
    )

    if (response.data.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ error: "Invalid token audience" })
    }

    // Check if user exists
    let user = await User.findOne({ googleId: googleUser.id })

    if (!user) {
      // Create new user
      user = new User({
        googleId: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        avatar: googleUser.picture,
        emailVerified: googleUser.email_verified,
        role: "user",
        createdAt: new Date(),
        lastLoginAt: new Date(),
        totalReviews: 0,
        avgScore: 0,
        favoriteLanguage: "python",
        settings: {
          theme: "dark",
          notifications: true,
          learningMode: true,
        },
      })
      await user.save()
    } else {
      // Update last login
      user.lastLoginAt = new Date()
      await user.save()
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        googleId: user.googleId,
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRY || "1h" }
    )

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d" }
    )

    // Set HTTP-only cookie for refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.json({
      user: {
        id: user._id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        role: user.role,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        totalReviews: user.totalReviews,
        avgScore: user.avgScore,
        favoriteLanguage: user.favoriteLanguage,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: parseInt(process.env.JWT_EXPIRY || "3600"),
      },
      isNewUser: !user.lastLoginAt || user.createdAt === user.lastLoginAt,
    })
  } catch (error) {
    console.error("Google callback error:", error)
    res.status(500).json({ error: "Authentication failed" })
  }
})

export default router
```

### 2. Validate Session

**Endpoint**: `GET /auth/validate`

**Headers**: `Authorization: Bearer <accessToken>`

**Response**:
```json
{
  "id": "user_id",
  "email": "user@gmail.com",
  "name": "John Doe",
  "emailVerified": true,
  "role": "user"
}
```

**Implementation**:

```typescript
router.get("/auth/validate", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      role: user.role,
    })
  } catch (error) {
    res.status(500).json({ error: "Validation failed" })
  }
})
```

### 3. Refresh Token

**Endpoint**: `POST /auth/refresh`

**Headers**: `Cookie: refreshToken=<refreshToken>`

**Response**:
```json
{
  "accessToken": "new_access_token",
  "expiresIn": 3600
}
```

**Implementation**:

```typescript
router.post("/auth/refresh", (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token" })
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!)
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRY || "1h" }
    )

    res.json({
      accessToken,
      expiresIn: parseInt(process.env.JWT_EXPIRY || "3600"),
    })
  } catch (error) {
    res.status(401).json({ error: "Invalid refresh token" })
  }
})
```

### 4. Logout

**Endpoint**: `POST /auth/logout`

**Implementation**:

```typescript
router.post("/auth/logout", (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  })
  res.json({ message: "Logged out successfully" })
})
```

## Middleware

### Authentication Middleware

```typescript
import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; email: string; googleId: string }
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "No token provided" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)
    req.user = decoded as any
    next()
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired token" })
  }
}
```

### Rate Limiting

```typescript
import rateLimit from "express-rate-limit"

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: "Too many authentication attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
})
```

## Security Best Practices

1. **HTTPS Only**: Always use HTTPS in production
2. **HTTP-Only Cookies**: Store refresh tokens in HTTP-only cookies
3. **CSRF Protection**: Implement CSRF tokens for state parameter
4. **Rate Limiting**: Limit authentication attempts
5. **Token Expiry**: Short-lived access tokens (1 hour)
6. **Refresh Token Rotation**: Rotate refresh tokens on each use
7. **Secure Headers**: Use helmet.js for security headers
8. **CORS**: Configure CORS properly
9. **Input Validation**: Validate all inputs
10. **Logging**: Log authentication events

## Testing

### Test Google OAuth Flow

```bash
# 1. Start backend server
npm run dev

# 2. Visit frontend
http://localhost:5173

# 3. Click "Continue with Google"
# 4. Authorize the app
# 5. Should redirect to dashboard

# 6. Check localStorage for token
localStorage.getItem("arctic.token")

# 7. Check user data
localStorage.getItem("arctic.user")
```

### Test Token Refresh

```bash
# Make request with expired token
curl -H "Authorization: Bearer expired_token" http://localhost:5000/auth/validate

# Should return 403 Forbidden

# Refresh token
curl -X POST http://localhost:5000/auth/refresh

# Should return new access token
```

## Deployment Checklist

- [ ] Set environment variables in production
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set secure cookie flags
- [ ] Enable rate limiting
- [ ] Setup MongoDB Atlas
- [ ] Configure Google OAuth redirect URI
- [ ] Enable CSRF protection
- [ ] Setup logging and monitoring
- [ ] Test OAuth flow end-to-end
- [ ] Setup automated backups
- [ ] Configure error tracking (Sentry)

## Troubleshooting

### "Invalid state parameter"
- Clear browser cookies and sessionStorage
- Ensure redirect URI matches Google Console configuration

### "Token exchange failed"
- Verify client ID and secret
- Check authorization code hasn't expired (10 minutes)
- Ensure redirect URI matches exactly

### "User not found after login"
- Check MongoDB connection
- Verify user was created in database
- Check indexes are created

### "Refresh token invalid"
- Ensure HTTP-only cookie is being sent
- Check refresh token hasn't expired
- Verify JWT_REFRESH_SECRET matches

## References

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
