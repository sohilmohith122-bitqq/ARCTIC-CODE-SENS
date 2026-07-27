import type { Analytics, AuthTokens, Review, User } from "@/types"
import { analyzeCode, MOCK_USER } from "@/data/mock"
import { deleteReview as deleteStored, getReview as getStored, listReviews, saveReview } from "./review-store"
import { sleep } from "./utils"
import { buildGoogleAuthUrl } from "./oauth"

/**
 * API client. In production set VITE_API_URL to your Express backend.
 * When the backend is unreachable, requests fall back to the mock engine
 * so the UI is fully explorable during development.
 */
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5001"
const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? "false") !== "false"
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ""
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI ?? `${window.location.origin}/auth/google/callback`

const TOKEN_KEY = "arctic.token"
const USER_KEY = "arctic.user"

export const storage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
  getUser: (): User | null => {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  },
  setUser: (u: User) => localStorage.setItem(USER_KEY, JSON.stringify(u)),
  clearUser: () => localStorage.removeItem(USER_KEY),
}

export interface LoginInput {
  email: string
  password: string
}
export interface RegisterInput {
  name: string
  email: string
  password: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = storage.getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) {
    const message = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error((message as { message?: string }).message ?? "Request failed")
  }
  return res.json() as Promise<T>
}

export const api = {
  async login(input: LoginInput): Promise<{ user: User; tokens: AuthTokens }> {
    if (USE_MOCK) {
      await sleep(700)
      const user: User = {
        ...MOCK_USER,
        email: input.email || MOCK_USER.email,
        emailVerified: true,
        lastLoginAt: new Date().toISOString(),
      }
      storage.setToken("mock-access-token")
      storage.setUser(user)
      return { user, tokens: { accessToken: "mock-access-token" } }
    }
    try {
      const data = await request<{ user: User; accessToken: string; refreshToken: string }>("/login", {
        method: "POST",
        body: JSON.stringify(input),
      })
      storage.setToken(data.accessToken)
      storage.setUser(data.user)
      if (data.refreshToken) sessionStorage.setItem("refresh_token", data.refreshToken)
      return { user: data.user, tokens: { accessToken: data.accessToken } }
    } catch (error) {
      console.error("Login failed, falling back to mock", error)
      await sleep(700)
      const user: User = {
        ...MOCK_USER,
        email: input.email || MOCK_USER.email,
        emailVerified: true,
        lastLoginAt: new Date().toISOString(),
      }
      storage.setToken("mock-access-token")
      storage.setUser(user)
      return { user, tokens: { accessToken: "mock-access-token" } }
    }
  },

  async register(input: RegisterInput): Promise<{ user: User; tokens: AuthTokens }> {
    if (USE_MOCK) {
      await sleep(900)
      const user: User = {
        ...MOCK_USER,
        name: input.name,
        email: input.email,
        emailVerified: false,
        createdAt: new Date().toISOString(),
        totalReviews: 0,
        avgScore: 0,
      }
      storage.setToken("mock-access-token")
      storage.setUser(user)
      return { user, tokens: { accessToken: "mock-access-token" } }
    }
    try {
      const data = await request<{ user: User; accessToken: string; refreshToken: string }>("/register", {
        method: "POST",
        body: JSON.stringify(input),
      })
      storage.setToken(data.accessToken)
      storage.setUser(data.user)
      if (data.refreshToken) sessionStorage.setItem("refresh_token", data.refreshToken)
      return { user: data.user, tokens: { accessToken: data.accessToken } }
    } catch (error) {
      console.error("Registration failed, falling back to mock", error)
      await sleep(900)
      const user: User = {
        ...MOCK_USER,
        name: input.name,
        email: input.email,
        emailVerified: false,
        createdAt: new Date().toISOString(),
        totalReviews: 0,
        avgScore: 0,
      }
      storage.setToken("mock-access-token")
      storage.setUser(user)
      return { user, tokens: { accessToken: "mock-access-token" } }
    }
  },

  async googleLogin(): Promise<{ user: User; tokens: AuthTokens }> {
    if (USE_MOCK) {
      await sleep(500)
      const mockGoogleUser: User = {
        ...MOCK_USER,
        googleId: "118364144313123456789",
        emailVerified: true,
        lastLoginAt: new Date().toISOString(),
      }
      storage.setToken("mock-google-token")
      storage.setUser(mockGoogleUser)
      return { user: mockGoogleUser, tokens: { accessToken: "mock-google-token" } }
    }
    // Fetch auth URL from backend (backend generates state, keeps client secret)
    const authUrl = await buildGoogleAuthUrl({
      clientId: GOOGLE_CLIENT_ID,
      redirectUri: GOOGLE_REDIRECT_URI,
      scope: ["openid", "profile", "email"],
    })
    window.location.href = authUrl
    return new Promise(() => {}) // Never resolves — page redirects
  },

  async googleCallback(code: string, state: string): Promise<{ user: User; tokens: AuthTokens }> {
    if (USE_MOCK) {
      await sleep(800)
      const mockGoogleUser: User = {
        ...MOCK_USER,
        googleId: "118364144313123456789",
        emailVerified: true,
        lastLoginAt: new Date().toISOString(),
      }
      storage.setToken("mock-google-token")
      storage.setUser(mockGoogleUser)
      return { user: mockGoogleUser, tokens: { accessToken: "mock-google-token" } }
    }
    // Backend handles code exchange — client secret never leaves the server
    const data = await request<{
      user: { id: string; googleId: string; email: string; fullName: string; profilePicture?: string; role: string; emailVerified: boolean };
      tokens: { accessToken: string; refreshToken: string; expiresIn: number }
    }>("/auth/google/callback", {
      method: "POST",
      body: JSON.stringify({ code, state }),
    })
    const user: User = {
      ...MOCK_USER,
      id: data.user.id,
      googleId: data.user.googleId,
      email: data.user.email,
      name: data.user.fullName,
      avatar: data.user.profilePicture,
      role: data.user.role as User["role"],
      emailVerified: data.user.emailVerified,
      lastLoginAt: new Date().toISOString(),
    }
    storage.setToken(data.tokens.accessToken)
    storage.setUser(user)
    if (data.tokens.refreshToken) sessionStorage.setItem("refresh_token", data.tokens.refreshToken)
    return { user, tokens: { accessToken: data.tokens.accessToken } }
  },

  logout() {
    storage.clearToken()
    storage.clearUser()
    sessionStorage.removeItem("refresh_token")
  },

  async validateSession(): Promise<User | null> {
    if (USE_MOCK) {
      await sleep(200)
      return storage.getUser()
    }
    try {
      return await request<User>("/auth/validate")
    } catch {
      return null
    }
  },

  async refreshToken(): Promise<{ accessToken: string; expiresIn: number }> {
    if (USE_MOCK) {
      await sleep(300)
      return { accessToken: "mock-access-token", expiresIn: 3600 }
    }
    const refreshToken = sessionStorage.getItem("refresh_token")
    return request<{ accessToken: string; expiresIn: number }>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    })
  },

  async getProfile(): Promise<User> {
    if (USE_MOCK) {
      await sleep(250)
      return storage.getUser() ?? MOCK_USER
    }
    return request<User>("/auth/profile")
  },

  async updateProfile(patch: Partial<User>): Promise<User> {
    if (USE_MOCK) {
      await sleep(500)
      const current = storage.getUser() ?? MOCK_USER
      const updated = { ...current, ...patch }
      storage.setUser(updated)
      return updated
    }
    return request<User>("/auth/profile", { method: "PUT", body: JSON.stringify(patch) })
  },

  async review(payload: { code: string; language: Review["language"]; fileName?: string }): Promise<Review> {
    if (USE_MOCK) {
      await sleep(1400)
      const result = analyzeCode(payload.code, payload.language, storage.getUser()?.id)
      if (payload.fileName) result.fileName = payload.fileName
      saveReview(result)
      // Update user stats
      const allReviews = listReviews()
      const user = storage.getUser()
      if (user) {
        const avgScore = Math.round(allReviews.reduce((s, r) => s + r.scores.overall, 0) / allReviews.length)
        storage.setUser({ ...user, totalReviews: allReviews.length, avgScore })
      }
      return result
    }
    const result = await request<Review>("/review", { method: "POST", body: JSON.stringify(payload) })
    return result
  },

  async getReviews(): Promise<Review[]> {
    if (USE_MOCK) {
      await sleep(400)
      return listReviews()
    }
    return request<Review[]>("/reviews")
  },

  async getReview(id: string): Promise<Review> {
    if (USE_MOCK) {
      await sleep(300)
      const found = getStored(id)
      if (!found) throw new Error("Review not found")
      return found
    }
    return request<Review>(`/review/${id}`)
  },


  async deleteReview(id: string): Promise<void> {
    if (USE_MOCK) {
      await sleep(300)
      deleteStored(id)
      return
    }
    await request<void>(`/review/${id}`, { method: "DELETE" })
  },

  async getAnalytics(): Promise<Analytics> {
    if (USE_MOCK) {
      await sleep(450)
      const reviews = listReviews()
      if (reviews.length === 0) {
        return {
          totalReviews: 0,
          avgScore: 0,
          favoriteLanguage: "python",
          streak: 0,
          reviewsTrend: [],
          languageDistribution: [],
          scoreDistribution: [],
          severityBreakdown: [],
        }
      }
      const avgScore = Math.round(reviews.reduce((s, r) => s + r.scores.overall, 0) / reviews.length)
      const langCount: Record<string, number> = {}
      reviews.forEach((r) => { langCount[r.language] = (langCount[r.language] ?? 0) + 1 })
      const favoriteLanguage = Object.entries(langCount).sort((a, b) => b[1] - a[1])[0][0] as Analytics["favoriteLanguage"]
      const sevCount: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 }
      reviews.forEach((r) => r.suggestions.forEach((s) => { sevCount[s.severity] = (sevCount[s.severity] ?? 0) + 1 }))
      const scoreFields = ["security", "performance", "maintainability", "readability", "documentation"] as const
      const scoreDistribution = scoreFields.map((f) => ({
        label: f.charAt(0).toUpperCase() + f.slice(1),
        value: Math.round(reviews.reduce((s, r) => s + r.scores[f], 0) / reviews.length),
      }))
      return {
        totalReviews: reviews.length,
        avgScore,
        favoriteLanguage,
        streak: reviews.length,
        reviewsTrend: reviews.slice(-7).map((r) => ({ date: new Date(r.createdAt).toLocaleDateString("en", { weekday: "short" }), count: 1, avgScore: r.scores.overall })),
        languageDistribution: Object.entries(langCount).map(([language, count]) => ({ language, count })),
        scoreDistribution,
        severityBreakdown: Object.entries(sevCount).filter(([, c]) => c > 0).map(([severity, count]) => ({ severity, count })),
      }
    }
    return request<Analytics>("/analytics")
  },

  async upload(file: File): Promise<{ fileName: string; content: string }> {
    if (USE_MOCK) {
      await sleep(500)
      const content = await file.text()
      return { fileName: file.name, content }
    }
    const form = new FormData()
    form.append("file", file)
    const res = await fetch(`${BASE_URL}/upload`, {
      method: "POST",
      headers: storage.getToken() ? { Authorization: `Bearer ${storage.getToken()}` } : {},
      body: form,
    })
    return res.json()
  },
}
