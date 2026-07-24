# Google OAuth 2.0 Frontend Setup Guide

## Overview

This guide provides step-by-step instructions to set up Google OAuth 2.0 authentication on the frontend.

## Step 1: Create Google OAuth Application

### 1.1 Go to Google Cloud Console

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Name it "ARCTIC CODE SENS"

### 1.2 Enable Google+ API

1. Go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click "Enable"

### 1.3 Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:5173/auth/google/callback` (development)
   - `http://localhost:3000/auth/google/callback` (alternative dev)
   - `https://yourdomain.com/auth/google/callback` (production)
5. Click "Create"
6. Copy Client ID and Client Secret

## Step 2: Configure Frontend Environment

### 2.1 Create .env.local

```bash
cd client
cp .env.example .env.local
```

### 2.2 Update .env.local

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=your_client_secret_here
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback

# Backend API
VITE_API_URL=http://localhost:5000
VITE_USE_MOCK=false

# Feature Flags
VITE_ENABLE_GOOGLE_OAUTH=true
```

## Step 3: Verify Frontend Implementation

### 3.1 Check OAuth Service

File: `client/src/lib/oauth.ts`

Verify these functions exist:
- `buildGoogleAuthUrl()` - Builds authorization URL with PKCE
- `handleGoogleCallback()` - Exchanges code for tokens
- `getGoogleUserInfo()` - Fetches user profile
- `refreshAccessToken()` - Refreshes expired tokens
- `revokeGoogleToken()` - Revokes token on logout

### 3.2 Check API Client

File: `client/src/lib/api.ts`

Verify these methods exist:
- `api.googleLogin()` - Initiates OAuth flow
- `api.googleCallback()` - Handles callback
- `api.validateSession()` - Validates user session
- `api.refreshToken()` - Refreshes access token

### 3.3 Check Auth Context

File: `client/src/context/auth-context.tsx`

Verify:
- Automatic session validation on mount
- Token refresh every 55 minutes
- Logout clears all tokens
- `validateSession()` method available

### 3.4 Check Routes

File: `client/src/App.tsx`

Verify route exists:
```typescript
<Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
```

## Step 4: Test Google OAuth Flow

### 4.1 Start Development Server

```bash
cd client
npm run dev
```

Opens at `http://localhost:5173`

### 4.2 Test Login Flow

1. Click "Continue with Google" button
2. You'll be redirected to Google login
3. Sign in with your Google account
4. Authorize the application
5. Should redirect to `/auth/google/callback`
6. Should then redirect to `/app/dashboard`

### 4.3 Verify User Data

Open browser DevTools > Application > Local Storage

Should see:
```json
{
  "arctic.token": "eyJhbGciOiJIUzI1NiIs...",
  "arctic.user": {
    "id": "user_id",
    "googleId": "118364144313123456789",
    "email": "your@gmail.com",
    "name": "Your Name",
    "avatar": "https://lh3.googleusercontent.com/...",
    "emailVerified": true,
    "role": "user",
    "createdAt": "2024-01-15T10:30:00Z",
    "lastLoginAt": "2024-01-15T10:30:00Z"
  }
}
```

### 4.4 Test Session Validation

1. Refresh the page
2. Should remain logged in
3. User data should be restored from localStorage

### 4.5 Test Logout

1. Click user avatar > Logout
2. Should redirect to landing page
3. localStorage should be cleared
4. Refresh page should show login page

## Step 5: Mock Mode Testing (Without Backend)

### 5.1 Enable Mock Mode

Update `.env.local`:
```env
VITE_USE_MOCK=true
```

### 5.2 Test Mock OAuth

1. Click "Continue with Google"
2. Should immediately redirect to dashboard
3. Mock user data should be in localStorage
4. All features should work normally

## Step 6: Production Deployment

### 6.1 Update Environment Variables

```env
VITE_GOOGLE_CLIENT_ID=production_client_id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=production_client_secret
VITE_GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
VITE_API_URL=https://api.yourdomain.com
VITE_USE_MOCK=false
```

### 6.2 Update Google Console

1. Add production redirect URI to Google Console
2. Verify domain ownership
3. Enable production OAuth consent screen

### 6.3 Build and Deploy

```bash
npm run build
# Deploy dist/ to Vercel or your hosting
```

## Security Checklist

- [ ] HTTPS enabled in production
- [ ] Client secret never exposed in frontend code
- [ ] PKCE flow implemented (✓ in oauth.ts)
- [ ] State parameter validated (✓ in oauth.ts)
- [ ] CSRF protection enabled
- [ ] Tokens stored securely (localStorage for access, sessionStorage for refresh)
- [ ] HTTP-only cookies for refresh token (backend)
- [ ] Token expiry validation
- [ ] Automatic token refresh
- [ ] Logout clears all tokens
- [ ] Rate limiting on auth endpoints (backend)
- [ ] Input validation on all forms
- [ ] Error messages don't leak sensitive info

## Troubleshooting

### "Invalid Client ID"
- Verify VITE_GOOGLE_CLIENT_ID in .env.local
- Check it matches Google Console
- Ensure no extra spaces or quotes

### "Redirect URI mismatch"
- Verify VITE_GOOGLE_REDIRECT_URI matches exactly
- Check Google Console configuration
- Ensure protocol (http/https) matches

### "OAuth callback not working"
- Check browser console for errors
- Verify route exists in App.tsx
- Check network tab for API calls
- Ensure backend is running (if not in mock mode)

### "User not persisting after refresh"
- Check localStorage in DevTools
- Verify auth context is mounted
- Check session validation endpoint

### "Token refresh not working"
- Check backend refresh endpoint
- Verify refresh token in sessionStorage
- Check JWT_REFRESH_SECRET matches

## File Structure

```
client/
├── src/
│   ├── lib/
│   │   ├── oauth.ts              # Google OAuth service
│   │   ├── api.ts                # API client with OAuth support
│   │   └── utils.ts
│   ├── context/
│   │   └── auth-context.tsx       # Auth state + session management
│   ├── pages/
│   │   └── auth/
│   │       ├── login.tsx          # Login page
│   │       ├── register.tsx       # Register page
│   │       └── google-callback.tsx # OAuth callback handler
│   └── App.tsx                    # Routes including callback
├── .env.example                   # Environment template
└── .env.local                     # Your local configuration
```

## API Integration

### Frontend to Backend Flow

```
1. User clicks "Continue with Google"
   ↓
2. buildGoogleAuthUrl() generates authorization URL
   ↓
3. Redirect to Google login
   ↓
4. User authorizes app
   ↓
5. Google redirects to /auth/google/callback with code
   ↓
6. handleGoogleCallback() exchanges code for tokens
   ↓
7. getGoogleUserInfo() fetches user profile
   ↓
8. api.googleCallback() sends to backend
   ↓
9. Backend creates/updates user and returns JWT
   ↓
10. Frontend stores token and user data
    ↓
11. Redirect to dashboard
```

## Testing Checklist

- [ ] Google OAuth login works
- [ ] User data persists after refresh
- [ ] Logout clears all data
- [ ] Token refresh works automatically
- [ ] Session validation works
- [ ] Error handling works
- [ ] Mock mode works
- [ ] Production build works
- [ ] Mobile responsive
- [ ] Accessibility compliant

## Next Steps

1. Set up backend with Google OAuth endpoints
2. Configure MongoDB for user storage
3. Implement JWT token generation
4. Setup refresh token rotation
5. Add rate limiting
6. Configure CORS
7. Deploy to production
8. Monitor authentication events
9. Setup error tracking
10. Create user documentation

## Support

For issues or questions:
1. Check browser console for errors
2. Check network tab for API calls
3. Review backend logs
4. Check Google Cloud Console for OAuth settings
5. Verify environment variables
6. Test with mock mode first

## References

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [PKCE Flow](https://tools.ietf.org/html/rfc7636)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
