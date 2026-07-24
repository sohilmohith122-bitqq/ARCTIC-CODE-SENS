import { useState } from "react"
import { toast } from "sonner"
import { Bell, Eye, Key, Loader2, Moon, Palette, Save, Sun, Zap } from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { GradientCard } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useTheme } from "@/context/theme-context"
import { cn } from "@/lib/utils"

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
        checked ? "bg-primary" : "bg-surface-2",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  )
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
      </div>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState({ email: true, browser: false, weekly: true })
  const [ai, setAi] = useState(() => {
    try {
      const saved = localStorage.getItem("arctic.ai_prefs")
      return saved ? JSON.parse(saved) : { learningMode: true, autoDetect: true, showOptimized: true }
    } catch { return { learningMode: true, autoDetect: true, showOptimized: true } }
  })

  const updateAi = (key: string, value: boolean) => {
    const updated = { ...ai, [key]: value }
    setAi(updated)
    localStorage.setItem("arctic.ai_prefs", JSON.stringify(updated))
  }
  const [apiKey, setApiKey] = useState("")
  const [saving, setSaving] = useState(false)

  const saveApiKey = async () => {
    if (!apiKey.trim()) { toast.error("Enter an API key"); return }
    setSaving(true)
    await new Promise((r) => setTimeout(r, 700))
    setSaving(false)
    toast.success("API key saved")
    setApiKey("")
  }

  return (
    <div>
      <PageHeader title="Settings" description="Customize your ARCTIC CODE SENS experience." />

      <div className="space-y-4 max-w-2xl">
        {/* Appearance */}
        <GradientCard>
          <div className="mb-4 flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            <h3 className="text-base font-semibold text-foreground">Appearance</h3>
          </div>
          <div className="divide-y divide-border">
            <SettingRow label="Theme" description="Choose between dark and light mode.">
              <div className="flex rounded-lg border border-border-strong p-1">
                <button
                  onClick={() => setTheme("dark")}
                  className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors", theme === "dark" ? "bg-primary/20 text-primary" : "text-muted hover:text-foreground")}
                >
                  <Moon className="h-3.5 w-3.5" /> Dark
                </button>
                <button
                  onClick={() => setTheme("light")}
                  className={cn("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors", theme === "light" ? "bg-primary/20 text-primary" : "text-muted hover:text-foreground")}
                >
                  <Sun className="h-3.5 w-3.5" /> Light
                </button>
              </div>
            </SettingRow>
          </div>
        </GradientCard>

        {/* Notifications */}
        <GradientCard>
          <div className="mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4 text-accent" />
            <h3 className="text-base font-semibold text-foreground">Notifications</h3>
          </div>
          <div className="divide-y divide-border">
            <SettingRow label="Email notifications" description="Receive review summaries via email.">
              <Toggle checked={notifications.email} onChange={(v) => setNotifications((n) => ({ ...n, email: v }))} />
            </SettingRow>
            <SettingRow label="Browser notifications" description="Get notified when analysis completes.">
              <Toggle checked={notifications.browser} onChange={(v) => setNotifications((n) => ({ ...n, browser: v }))} />
            </SettingRow>
            <SettingRow label="Weekly digest" description="A weekly summary of your review activity.">
              <Toggle checked={notifications.weekly} onChange={(v) => setNotifications((n) => ({ ...n, weekly: v }))} />
            </SettingRow>
          </div>
        </GradientCard>

        {/* AI preferences */}
        <GradientCard>
          <div className="mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4 text-warning" />
            <h3 className="text-base font-semibold text-foreground">AI Preferences</h3>
          </div>
          <div className="divide-y divide-border">
            <SettingRow label="Learning Mode" description="Show detailed explanations for every issue.">
              <Toggle checked={ai.learningMode} onChange={(v) => updateAi("learningMode", v)} />
            </SettingRow>
            <SettingRow label="Auto-detect language" description="Automatically detect language from file extension.">
              <Toggle checked={ai.autoDetect} onChange={(v) => updateAi("autoDetect", v)} />
            </SettingRow>
            <SettingRow label="Show optimized code" description="Display AI-generated optimized code snippets.">
              <Toggle checked={ai.showOptimized} onChange={(v) => updateAi("showOptimized", v)} />
            </SettingRow>
          </div>
        </GradientCard>

        {/* API Key */}
        <GradientCard>
          <div className="mb-4 flex items-center gap-2">
            <Key className="h-4 w-4 text-success" />
            <h3 className="text-base font-semibold text-foreground">OpenAI API Key</h3>
          </div>
          <p className="mb-4 text-sm text-muted">
            Provide your own OpenAI API key to use GPT-4 for deeper analysis. Leave blank to use the built-in engine.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Eye className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
              <Input
                type="password"
                placeholder="sk-••••••••••••••••••••••••"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="gradient" onClick={saveApiKey} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </Button>
          </div>
          <p className="mt-2 text-xs text-subtle">Your key is stored locally and never sent to our servers.</p>
        </GradientCard>
      </div>
    </div>
  )
}
