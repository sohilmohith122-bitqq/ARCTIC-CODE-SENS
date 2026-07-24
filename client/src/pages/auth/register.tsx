import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { AuthLayout, GoogleButton } from "@/components/layout/auth-layout"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"

const schema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
})
type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerUser, googleLogin } = useAuth()
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  })

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    try {
      await registerUser(values)
      toast.success("Account created. Welcome to ARCTIC CODE SENS!")
      navigate("/app/dashboard")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Registration failed")
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
      title="Create your account"
      subtitle="Start reviewing code smarter in seconds."
      footer={
        <>Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" placeholder="Sohil Engineer" {...register("name")} />
          {errors.name && <p className="mt-1.5 text-xs text-danger">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@company.com" {...register("email")} />
          {errors.email && <p className="mt-1.5 text-xs text-danger">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="At least 6 characters" {...register("password")} />
          {errors.password && <p className="mt-1.5 text-xs text-danger">{errors.password.message}</p>}
        </div>
        <Button type="submit" variant="gradient" className="w-full" disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
        </Button>
      </form>

      <div className="relative my-5 text-center text-xs text-subtle">
        <span className="relative z-10 bg-background px-3">or</span>
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
      </div>

      <GoogleButton onClick={onGoogle} />

      <p className="mt-5 text-center text-[11px] leading-relaxed text-subtle">
        By continuing you agree to our Terms and acknowledge our Privacy Policy.
      </p>
    </AuthLayout>
  )
}
