import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type { User } from "@/types"
import { api, storage, type LoginInput, type RegisterInput } from "@/lib/api"

interface AuthContextValue {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (input: LoginInput) => Promise<User>
  register: (input: RegisterInput) => Promise<User>
  googleLogin: () => Promise<User>
  logout: () => void
  updateUser: (patch: Partial<User>) => Promise<User>
  validateSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// Token refresh interval (refresh 5 minutes before expiry)
const TOKEN_REFRESH_INTERVAL = 55 * 60 * 1000 // 55 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null)

  // Validate session on mount and periodically
  useEffect(() => {
    const validateAndSetUser = async () => {
      try {
        const token = storage.getToken()
        const cached = storage.getUser()

        if (token && cached) {
          setUser(cached)
          // Validate session with backend
          const validUser = await api.validateSession()
          if (validUser) {
            setUser(validUser)
            storage.setUser(validUser)
          } else {
            // Session invalid, clear storage
            storage.clearToken()
            storage.clearUser()
            setUser(null)
          }
        }
      } catch (error) {
        console.error("Session validation failed:", error)
        storage.clearToken()
        storage.clearUser()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    validateAndSetUser()
  }, [])

  // Setup automatic token refresh
  useEffect(() => {
    if (!user) return

    const setupTokenRefresh = async () => {
      try {
        const { accessToken, expiresIn } = await api.refreshToken()
        storage.setToken(accessToken)

        // Schedule next refresh
        const nextRefreshTime = Math.min(expiresIn * 1000 - 5 * 60 * 1000, TOKEN_REFRESH_INTERVAL)
        const timer = setTimeout(setupTokenRefresh, nextRefreshTime)
        setRefreshTimer(timer)
      } catch (error) {
        console.error("Token refresh failed:", error)
        // If refresh fails, logout user
        logout()
      }
    }

    const timer = setTimeout(setupTokenRefresh, TOKEN_REFRESH_INTERVAL)
    setRefreshTimer(timer)

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [user])

  const login = useCallback(async (input: LoginInput) => {
    const { user } = await api.login(input)
    setUser(user)
    return user
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    const { user } = await api.register(input)
    setUser(user)
    return user
  }, [])

  const googleLogin = useCallback(async () => {
    const { user } = await api.googleLogin()
    setUser(user)
    return user
  }, [])

  const logout = useCallback(() => {
    api.logout()
    setUser(null)
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      setRefreshTimer(null)
    }
  }, [refreshTimer])

  const updateUser = useCallback(async (patch: Partial<User>) => {
    const updated = await api.updateProfile(patch)
    setUser(updated)
    return updated
  }, [])

  const validateSession = useCallback(async () => {
    try {
      const validUser = await api.validateSession()
      if (validUser) {
        setUser(validUser)
        storage.setUser(validUser)
      } else {
        logout()
      }
    } catch (error) {
      console.error("Session validation failed:", error)
      logout()
    }
  }, [logout])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      googleLogin,
      logout,
      updateUser,
      validateSession,
    }),
    [user, loading, login, register, googleLogin, logout, updateUser, validateSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
