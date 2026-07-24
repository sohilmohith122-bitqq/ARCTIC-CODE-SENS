import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { api } from "@/lib/api"

export default function GoogleCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { googleLogin } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code")
        const state = searchParams.get("state")
        const errorParam = searchParams.get("error")

        // Handle OAuth errors
        if (errorParam) {
          const errorDescription = searchParams.get("error_description") || errorParam
          throw new Error(`OAuth error: ${errorDescription}`)
        }

        if (!code) {
          throw new Error("No authorization code received")
        }

        if (!state) {
          throw new Error("No state parameter received - possible CSRF attack")
        }

        // Exchange code for tokens and authenticate
        await api.googleCallback(code, state)

        // Trigger login through auth context
        await googleLogin()

        toast.success("Successfully signed in with Google!")
        navigate("/app/dashboard", { replace: true })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Authentication failed"
        setError(message)
        toast.error(message)
        console.error("OAuth callback error:", err)

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login", { replace: true })
        }, 3000)
      }
    }

    handleCallback()
  }, [searchParams, navigate, googleLogin])

  if (error) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <div className="mb-4 text-5xl">❌</div>
          <h1 className="text-2xl font-bold text-foreground">Authentication Failed</h1>
          <p className="mt-2 text-muted">{error}</p>
          <p className="mt-4 text-sm text-subtle">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <h1 className="mt-4 text-xl font-semibold text-foreground">Signing you in...</h1>
        <p className="mt-2 text-sm text-muted">Please wait while we authenticate your account</p>
      </div>
    </div>
  )
}
