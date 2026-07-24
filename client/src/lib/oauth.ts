/**
 * Google OAuth 2.0 Service
 * Handles authentication flow with PKCE, token management, and session security
 */

import type { GoogleOAuthConfig } from "@/types"

const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
const GOOGLE_USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v2/userinfo"

const STORAGE_KEYS = {
  STATE: "oauth_state",
  CODE_VERIFIER: "oauth_code_verifier",
  REDIRECT_URI: "oauth_redirect_uri",
}

/**
 * Generate random string for PKCE code verifier
 */
function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => String.fromCharCode(byte))
    .join("")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
}

/**
 * Generate code challenge from verifier (SHA256)
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hash))
    .map((byte) => String.fromCharCode(byte))
    .join("")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
}

/**
 * Generate random state for CSRF protection
 */
function generateState(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (x) => x.toString(16).padStart(2, "0")).join("")
}

/**
 * Build Google OAuth authorization URL
 */
export async function buildGoogleAuthUrl(config: GoogleOAuthConfig): Promise<string> {
  const state = generateState()
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = await generateCodeChallenge(codeVerifier)

  // Store for verification after redirect
  sessionStorage.setItem(STORAGE_KEYS.STATE, state)
  sessionStorage.setItem(STORAGE_KEYS.CODE_VERIFIER, codeVerifier)
  sessionStorage.setItem(STORAGE_KEYS.REDIRECT_URI, config.redirectUri)

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: config.scope.join(" "),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    access_type: "offline",
    prompt: "consent",
  })

  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`
}

/**
 * Handle OAuth callback and exchange code for tokens
 */
export async function handleGoogleCallback(
  code: string,
  state: string,
  clientId: string,
  clientSecret: string,
): Promise<{ accessToken: string; idToken: string; refreshToken?: string }> {
  // Verify state for CSRF protection
  const storedState = sessionStorage.getItem(STORAGE_KEYS.STATE)
  if (state !== storedState) {
    throw new Error("Invalid state parameter - possible CSRF attack")
  }

  const codeVerifier = sessionStorage.getItem(STORAGE_KEYS.CODE_VERIFIER)
  const redirectUri = sessionStorage.getItem(STORAGE_KEYS.REDIRECT_URI)

  if (!codeVerifier || !redirectUri) {
    throw new Error("Missing OAuth session data")
  }

  // Exchange code for tokens
  const tokenResponse = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      code_verifier: codeVerifier,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }).toString(),
  })

  if (!tokenResponse.ok) {
    const error = await tokenResponse.json()
    throw new Error(`Token exchange failed: ${error.error_description || error.error}`)
  }

  const tokens = await tokenResponse.json()

  // Clear session storage
  sessionStorage.removeItem(STORAGE_KEYS.STATE)
  sessionStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER)
  sessionStorage.removeItem(STORAGE_KEYS.REDIRECT_URI)

  return {
    accessToken: tokens.access_token,
    idToken: tokens.id_token,
    refreshToken: tokens.refresh_token,
  }
}

/**
 * Get user info from Google using access token
 */
export async function getGoogleUserInfo(accessToken: string): Promise<{
  id: string
  email: string
  name: string
  picture?: string
  email_verified: boolean
}> {
  const response = await fetch(GOOGLE_USERINFO_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch user info from Google")
  }

  return response.json()
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string,
): Promise<{ accessToken: string; expiresIn: number }> {
  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }).toString(),
  })

  if (!response.ok) {
    throw new Error("Failed to refresh access token")
  }

  const data = await response.json()
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  }
}

/**
 * Revoke Google OAuth token
 */
export async function revokeGoogleToken(token: string): Promise<void> {
  const response = await fetch("https://oauth2.googleapis.com/revoke", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ token }).toString(),
  })

  if (!response.ok) {
    console.warn("Failed to revoke Google token")
  }
}

/**
 * Decode JWT token (without verification - for client-side use only)
 * For production, verify on backend
 */
export function decodeJWT(token: string): Record<string, unknown> {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) throw new Error("Invalid JWT format")

    const decoded = atob(parts[1])
    return JSON.parse(decoded)
  } catch {
    throw new Error("Failed to decode JWT")
  }
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeJWT(token)
    const exp = (decoded.exp as number) * 1000 // Convert to milliseconds
    return Date.now() >= exp
  } catch {
    return true
  }
}

/**
 * Get token expiration time in seconds
 */
export function getTokenExpiresIn(token: string): number {
  try {
    const decoded = decodeJWT(token)
    const exp = (decoded.exp as number) * 1000
    return Math.max(0, Math.floor((exp - Date.now()) / 1000))
  } catch {
    return 0
  }
}
