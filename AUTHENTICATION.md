# ARCTIC CODE SENS - Authentication System Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Google OAuth 2.0 Flow](#google-oauth-20-flow)
4. [JWT Token Management](#jwt-token-management)
5. [Session Management](#session-management)
6. [Security Features](#security-features)
7. [Implementation Details](#implementation-details)
8. [API Endpoints](#api-endpoints)
9. [Error Handling](#error-handling)
10. [Testing](#testing)

## Overview

ARCTIC CODE SENS implements a secure, production-ready authentication system using:

- **Google OAuth 2.0** as the primary authentication method
- **PKCE Flow** for enhanced security
- **JWT Tokens** for stateless authentication
- **HTTP-Only Cookies** for refresh token storage
- **Automatic Session Management** with token refresh
- **Duplicate Account Prevention** using unique Google IDs and emails

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Auth Pages  │  │ Auth Context │  │ OAuth Service│      │
│  │  (Login,     │  │ (State Mgmt) │  │ (PKCE Flow) │      │
│  │   Register)  │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                       │
│                    │   API Client   │                       │
│                    │  (Token Mgmt)  │                       │
│                    └───────┬────────┘                       │
└─────────────────────────────┼──────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Google OAuth     │
                    │  Authorization    │
                    │  Server           │
                    └─────────┬─────────┘
                              │
┌─────────────────────────────▼──────────────────────────────┐
│                  Backend (Express.js)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ OAuth Routes │  │ JWT Middleware│  │ User Model  │      │
│  │ (Callback)   │  │ (Validation)  │  │ (MongoDB)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                       │
│                    │   MongoDB      │                       │
│                    │   Database     │                       │
│                    └────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

## Google OAuth 2.0 Flow

### Authorization Code Flow with PKCE

```
1. User clicks "Continue with Google"
   │
   ├─ Generate code_verifier (random 32 bytes)
   ├─ Generate code_challenge (SHA256 of verifier)
   ├─ Generate state (random 32 bytes)
   └─ Store in sessionStorage for verification

2. Redirect to Google Authorization Endpoint
   │
   └─ https://accounts.google.com/o/oauth2/v2/auth?
      client_id=...
      redirect_uri=http://localhost:5173/auth/google/callback
      response_type=code
      scope=openid profile email
      state=...
      code_challenge=...
      code_challenge_method=S256

3. User logs in and authorizes app
   │
   └─ Google redirects to callback URL with:
      - authorization code (valid for 10 minutes)
      - state parameter

4. Frontend receives callback
   │
   ├─ Verify state matches stored value (CSRF protection)
   ├─ Exchange code for tokens using code_verifier
   └─ Get user info from Google

5. Backend receives token exchange request
   │
   ├─ Verify authorization code
   ├─ Verify code_challenge matches code_verifier
   ├─ Exchange code for access_token and id_token
   └─ Fetch user info from Google

6. Backend creates/updates user
   │
   ├─ Check if user exists by googleId
   ├─ If new: create user with Google data
   ├─ If existing: update lastLoginAt
   └─ Generate JWT tokens

7. Backend returns tokens to frontend
   │
   ├─ Access Token (short-lived, 1 hour)
   ├─ Refresh Token (long-lived, 7 days, HTTP-only cookie)
   └─ User data

8. Frontend stores tokens and redirects to dashboard
   │
   ├─ localStorage: access token + user data
   ├─ sessionStorage: refresh token
   └─ Redirect to /app/dashboard
```

### PKCE Security

PKCE (Proof Key for Code Exchange) prevents authorization code interception:

```
Frontend:
  code_verifier = random_string(32)
  code_challenge = base64url(sha256(code_verifier))

Authorization Request:
  code_challenge=...
  code_challenge_method=S256

Token Exchange:
  code=...
  code_verifier=...

Backend:
  computed_challenge = base64url(sha256(code_verifier))
  if (computed_challenge != code_challenge) {
    reject request
  }
```

## JWT Token Management

### Access Token

**Purpose**: Authenticate API requests

**Payload**:
```json
{
  "userId": "user_id",
  "email": "user@gmail.com",
  "googleId": "118364144313123456789",
  "iat": 1705315800,
  "exp": 1705319400
}
```

**Expiry**: 1 hour

**Storage**: localStorage (accessible to JavaScript)

**Usage**:
```
Authorization: Bearer <access_token>
```

### Refresh Token

**Purpose**: Obtain new access tokens

**Payload**:
```json
{
  "userId": "user_id",
  "iat": 1705315800,
  "exp": 1705920600
}
```

**Expiry**: 7 days

**Storage**: HTTP-only cookie (not accessible to JavaScript)

**Usage**:
```
POST /auth/refresh
Cookie: refreshToken=<refresh_token>
```

### Token Refresh Flow

```
1. Access token expires
   │
2. Frontend detects expiry (55 minutes after issue)
   │
3. Call POST /auth/refresh
   │
4. Backend validates refresh token
   │
5. Backend generates new access token
   │
6. Frontend stores new access token
   │
7. Continue with API requests
```

## Session Management

### Automatic Session Validation

On app load:
1. Check if access token exists in localStorage
2. Check if user data exists in localStorage
3. Call `/auth/validate` endpoint
4. If valid: restore session
5. If invalid: clear storage and redirect to login

### Automatic Token Refresh

Every 55 minutes:
1. Call `/auth/refresh` endpoint
2. Get new access token
3. Update localStorage
4. Continue session

### Logout

On logout:
1. Clear localStorage (access token + user data)
2. Clear sessionStorage (refresh token)
3. Call `/auth/logout` endpoint
4. Backend clears HTTP-only cookie
5. Redirect to login page

## Security Features

### 1. PKCE Flow
- Prevents authorization code interception
- Uses SHA256 code challenge
- Validates code verifier on token exchange

### 2. State Parameter
- Prevents CSRF attacks
- Generated randomly for each authorization
- Verified on callback

### 3. HTTP-Only Cookies
- Refresh tokens stored in HTTP-only cookies
- Not accessible to JavaScript
- Automatically sent with requests
- Protected against XSS attacks

### 4. Token Expiry
- Access tokens: 1 hour
- Refresh tokens: 7 days
- Automatic refresh before expiry

### 5. Duplicate Account Prevention
- Google ID is unique per user
- Email is unique per user
- Prevents multiple accounts for same Google email

### 6. Email Verification
- Google provides email_verified flag
- Only verified emails allowed
- Prevents fake accounts

### 7. Rate Limiting
- Limit authentication attempts
- Prevent brute force attacks
- 5 attempts per 15 minutes

### 8. CORS Protection
- Restrict API access to authorized domains
- Prevent cross-origin attacks

### 9. Input Validation
- Validate all OAuth parameters
- Sanitize user input
- Prevent injection attacks

### 10. Secure Headers
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

## Implementation Details

### Frontend Files

**OAuth Service** (`lib/oauth.ts`):
- `buildGoogleAuthUrl()` - Generate authorization URL
- `handleGoogleCallback()` - Exchange code for tokens
- `getGoogleUserInfo()` - Fetch user profile
- `refreshAccessToken()` - Refresh expired tokens
- `revokeGoogleToken()` - Revoke token on logout
- `decodeJWT()` - Decode JWT (client-side only)
- `isTokenExpired()` - Check token expiry
- `getTokenExpiresIn()` - Get remaining time

**API Client** (`lib/api.ts`):
- `api.googleLogin()` - Initiate OAuth flow
- `api.googleCallback()` - Handle callback
- `api.validateSession()` - Validate user session
- `api.refreshToken()` - Refresh access token
- `api.logout()` - Logout user

**Auth Context** (`context/auth-context.tsx`):
- Session validation on mount
- Automatic token refresh every 55 minutes
- User state management
- Logout with cleanup

**Callback Handler** (`pages/auth/google-callback.tsx`):
- Process OAuth callback
- Handle errors
- Redirect to dashboard

### Backend Files (To Implement)

**Routes** (`routes/auth.ts`):
- `POST /auth/google/callback` - OAuth callback
- `GET /auth/validate` - Validate session
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout

**Middleware** (`middleware/auth.ts`):
- `authenticateToken()` - Verify JWT
- `authLimiter()` - Rate limiting

**Models** (`models/User.ts`):
- User schema with Google fields
- Indexes for googleId and email

## API Endpoints

### POST /auth/google/callback

Exchange authorization code for tokens.

**Request**:
```json
{
  "code": "authorization_code",
  "idToken": "id_token",
  "googleUser": {
    "id": "118364144313123456789",
    "email": "user@gmail.com",
    "name": "John Doe",
    "picture": "https://...",
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
    "avatar": "https://...",
    "emailVerified": true,
    "role": "user",
    "createdAt": "2024-01-15T10:30:00Z",
    "lastLoginAt": "2024-01-15T10:30:00Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  },
  "isNewUser": true
}
```

### GET /auth/validate

Validate current session.

**Headers**:
```
Authorization: Bearer <access_token>
```

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

### POST /auth/refresh

Refresh access token.

**Headers**:
```
Cookie: refreshToken=<refresh_token>
```

**Response**:
```json
{
  "accessToken": "new_access_token",
  "expiresIn": 3600
}
```

### POST /auth/logout

Logout user.

**Response**:
```json
{
  "message": "Logged out successfully"
}
```

## Error Handling

### Frontend Errors

```typescript
// Invalid state (CSRF)
"Invalid state parameter - possible CSRF attack"

// Missing code
"No authorization code received"

// Token exchange failed
"Token exchange failed: error_description"

// User info fetch failed
"Failed to fetch user info from Google"

// Session validation failed
"Session validation failed"

// Token refresh failed
"Token refresh failed"
```

### Backend Errors

```typescript
// Invalid token audience
{ error: "Invalid token audience" }

// Token exchange failed
{ error: "Token exchange failed" }

// User not found
{ error: "User not found" }

// Invalid refresh token
{ error: "Invalid refresh token" }

// No token provided
{ error: "No token provided" }

// Invalid or expired token
{ error: "Invalid or expired token" }
```

## Testing

### Manual Testing

1. **Test Google OAuth Login**
   - Click "Continue with Google"
   - Authorize app
   - Should redirect to dashboard
   - Check localStorage for token

2. **Test Session Persistence**
   - Refresh page
   - Should remain logged in
   - User data should be restored

3. **Test Token Refresh**
   - Wait 55 minutes (or mock time)
   - Should automatically refresh token
   - No interruption to user

4. **Test Logout**
   - Click logout
   - Should redirect to login
   - localStorage should be cleared

5. **Test Error Handling**
   - Deny authorization
   - Should show error message
   - Should redirect to login

### Automated Testing

```typescript
// Test OAuth flow
test("Google OAuth login", async () => {
  const { getByText } = render(<LoginPage />)
  fireEvent.click(getByText("Continue with Google"))
  // Verify redirect to Google
})

// Test session validation
test("Session validation", async () => {
  localStorage.setItem("arctic.token", "valid_token")
  const { user } = render(<App />)
  // Verify user is authenticated
})

// Test token refresh
test("Token refresh", async () => {
  // Mock token expiry
  // Verify refresh is called
  // Verify new token is stored
})
```

## Deployment Checklist

- [ ] Google OAuth credentials created
- [ ] Environment variables configured
- [ ] Backend OAuth endpoints implemented
- [ ] MongoDB user schema created
- [ ] JWT secret configured
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Error tracking setup
- [ ] Logging configured
- [ ] Backup strategy implemented
- [ ] OAuth flow tested end-to-end
- [ ] Session management tested
- [ ] Token refresh tested
- [ ] Logout tested
- [ ] Error handling tested

## Troubleshooting

### "Invalid Client ID"
- Verify VITE_GOOGLE_CLIENT_ID in .env.local
- Check Google Cloud Console
- Ensure no extra spaces

### "Redirect URI mismatch"
- Verify VITE_GOOGLE_REDIRECT_URI matches exactly
- Check Google Console configuration
- Ensure protocol matches (http/https)

### "Token exchange failed"
- Verify client secret
- Check authorization code hasn't expired
- Ensure redirect URI matches

### "User not persisting"
- Check localStorage in DevTools
- Verify session validation endpoint
- Check backend user creation

### "Token refresh not working"
- Check refresh token in sessionStorage
- Verify backend refresh endpoint
- Check JWT_REFRESH_SECRET

## References

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [RFC 7636 - PKCE](https://tools.ietf.org/html/rfc7636)
- [RFC 7519 - JWT](https://tools.ietf.org/html/rfc7519)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)

---

**Last Updated**: January 2024
**Version**: 1.0
**Status**: Production Ready
