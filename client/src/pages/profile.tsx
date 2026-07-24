import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Camera, Loader2, Save } from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { GradientCard } from "@/components/ui/card"
import { Input, Label } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"
import { LANGUAGE_MAP } from "@/data/languages"

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
})
type FormValues = z.infer<typeof schema>

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? "", email: user?.email ?? "" },
  })

  const onSubmit = async (values: FormValues) => {
    setSaving(true)
    try {
      await updateUser(values)
      toast.success("Profile updated")
    } catch {
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const stats = [
    { label: "Total Reviews", value: user?.totalReviews ?? 0 },
    { label: "Average Score", value: user?.avgScore ?? 0 },
    { label: "Favorite Language", value: user ? LANGUAGE_MAP[user.favoriteLanguage].label : "—" },
    { label: "Member Since", value: user ? new Date(user.createdAt).toLocaleDateString("en", { month: "short", year: "numeric" }) : "—" },
  ]

  return (
    <div>
      <PageHeader title="Profile" description="Manage your account information." />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Avatar card */}
        <div className="space-y-4">
          <GradientCard className="flex flex-col items-center gap-4 py-8">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/40 to-accent/40 text-3xl font-bold text-foreground">
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-subtle transition-colors hover:text-foreground">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">{user?.name}</p>
              <p className="text-sm text-muted">{user?.email}</p>
              <span className="mt-2 inline-block rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">
                {user?.role}
              </span>
            </div>
          </GradientCard>

          {/* Stats */}
          <GradientCard>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-subtle">Stats</p>
            <div className="space-y-3">
              {stats.map((s) => (
                <div key={s.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted">{s.label}</span>
                  <span className="font-semibold text-foreground tabular-nums">{s.value}</span>
                </div>
              ))}
            </div>
          </GradientCard>
        </div>

        {/* Edit form */}
        <div className="space-y-4">
          <GradientCard>
            <h3 className="mb-5 text-base font-semibold text-foreground">Personal information</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input id="name" placeholder="Your name" {...register("name")} />
                {errors.name && <p className="mt-1.5 text-xs text-danger">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" placeholder="you@company.com" {...register("email")} />
                {errors.email && <p className="mt-1.5 text-xs text-danger">{errors.email.message}</p>}
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" variant="gradient" disabled={saving || !isDirty}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save changes
                </Button>
              </div>
            </form>
          </GradientCard>

          <GradientCard>
            <h3 className="mb-5 text-base font-semibold text-foreground">Danger zone</h3>
            <div className="flex items-center justify-between rounded-lg border border-danger/20 bg-danger/5 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Delete account</p>
                <p className="text-xs text-muted">Permanently delete your account and all data.</p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => toast.error("Account deletion is disabled in demo mode.")}
              >
                Delete
              </Button>
            </div>
          </GradientCard>
        </div>
      </div>
    </div>
  )
}
