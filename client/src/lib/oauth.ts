/**
 * Google OAuth 2.0 Service
 * Initiates the OAuth flow by redirecting to Google via the backend.
 * Token exchange happens server-side — the client secret is never exposed.
 */

import type { GoogleOAuthConfig } from "@/types"

const STORAGE_KEYS = {
  STATE: "oauth_state",
  REDIRECT_URI: "oauth_redirect_uri",
}

/**
 * Build Google OAuth authorization URL via the backend
 * (backend generates the state and keeps the client secret)
 */
export async function buildGoogleAuthUrl(config: GoogleOAuthConfig): Promise<string> {
  const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:5001"
  const res = await fetch(`${apiBase}/auth/google`)
  if (!res.ok) throw new Error("Failed to get OAuth URL from backend")
  const { url, state } = await res.json() as { url: string; state: string }

  // Store state so the callback page can forward it to the backend for CSRF validation
  sessionStorage.setItem(STORAGE_KEYS.STATE, state)
  sessionStorage.setItem(STORAGE_KEYS.REDIRECT_URI, config.redirectUri)

  return url
}

/**
 * Retrieve and clear the stored OAuth state
 */
export function consumeOAuthState(): string | null {
  const state = sessionStorage.getItem(STORAGE_KEYS.STATE)
  sessionStorage.removeItem(STORAGE_KEYS.STATE)
  sessionStorage.removeItem(STORAGE_KEYS.REDIRECT_URI)
  return state
}

/**
 * Decode JWT token (without verification — for client-side display only)
 */
export function decodeJWT(token: string): Record<string, unknown> {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) throw new Error("Invalid JWT format")
    return JSON.parse(atob(parts[1]))
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
    return Date.now() >= (decoded.exp as number) * 1000
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
    return Math.max(0, Math.floor(((decoded.exp as number) * 1000 - Date.now()) / 1000))
  } catch {
    return 0
  }
}
