import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2, Mail } from "lucide-react"
import { AuthLayout, GoogleButton } from "@/components/layout/auth-layout"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})
type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, googleLogin } = useAuth()
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    try {
      await login(values)
      toast.success("Welcome back!")
      navigate("/app/dashboard")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Login failed")
    } finally {
      setSubmitting(false)
    }
  }

  const onGoogle = async () => {
    setSubmitting(true)
    try {
      await googleLogin()
      toast.success("Signed in with Google")
      navigate("/app/dashboard")
    } catch {
      toast.error("Google sign-in failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue reviewing code."
      footer={
        <>Don't have an account?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">Create one</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <Input id="email" type="email" autoComplete="email" placeholder="you@company.com" className="pl-10" {...register("email")} />
          </div>
          {errors.email && <p className="mt-1.5 text-xs text-danger">{errors.email.message}</p>}
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link>
          </div>
          <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" {...register("password")} />
          {errors.password && <p className="mt-1.5 text-xs text-danger">{errors.password.message}</p>}
        </div>
        <Button type="submit" variant="gradient" className="w-full" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
        </Button>
      </form>

      <div className="relative my-5 text-center text-xs text-subtle">
        <span className="relative z-10 bg-background px-3">or</span>
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
      </div>

      <GoogleButton onClick={onGoogle} />
    </AuthLayout>
  )
}
