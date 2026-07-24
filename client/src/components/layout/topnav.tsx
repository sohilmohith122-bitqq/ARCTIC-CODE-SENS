import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Bell, Menu, Moon, Plus, Search, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/context/theme-context"
import { cn } from "@/lib/utils"

export function TopNav({ onOpenMobile }: { onOpenMobile: () => void }) {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/70 px-4 backdrop-blur-xl lg:px-6">
      <button
        onClick={onOpenMobile}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-foreground lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
        <input
          placeholder="Search reviews, snippets, suggestions…"
          className="h-10 w-full rounded-lg border border-border-strong bg-surface/60 pl-10 pr-16 text-sm text-foreground transition-all placeholder:text-subtle focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-subtle">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="gradient"
          size="sm"
          onClick={() => navigate("/app/review")}
          className="hidden sm:inline-flex"
        >
          <Plus className="h-4 w-4" />
          New Review
        </Button>

        <button
          onClick={toggle}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          aria-label="Toggle theme"
        >
          <motion.span key={theme} initial={{ rotate: -30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.25 }}>
            {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </motion.span>
        </button>

        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className={cn("absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent ring-2 ring-surface")} />
        </button>
      </div>
    </header>
  )
}
