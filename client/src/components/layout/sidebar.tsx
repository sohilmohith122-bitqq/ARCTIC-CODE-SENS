import { NavLink } from "react-router-dom"
import { motion } from "framer-motion"
import { ChevronLeft, LogOut, Sparkles } from "lucide-react"
import { BRAND_ICON, NAV_ITEMS } from "./nav-config"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { cn } from "@/lib/utils"

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onCloseMobile,
}: {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onCloseMobile: () => void
}) {
  const { user, logout } = useAuth()

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-surface/80 backdrop-blur-xl transition-all duration-300",
          collapsed ? "w-[76px]" : "w-64",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-2.5 px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-[0_4px_16px_-4px_rgba(139,92,246,0.6)]">
            <BRAND_ICON className="h-5 w-5 text-white" strokeWidth={2.2} />
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight text-foreground">ARCTIC CODE</p>
              <p className="truncate text-[10px] font-medium uppercase tracking-[0.2em] text-subtle">SENS</p>
            </motion.div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-foreground"
                    : "text-muted hover:bg-surface-2 hover:text-foreground",
                  collapsed && "justify-center px-0",
                )
              }
              title={collapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary to-accent"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <item.icon
                    className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-primary" : "text-subtle group-hover:text-foreground")}
                    strokeWidth={2}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Upgrade card */}
        {!collapsed && (
          <div className="mx-3 mb-3">
            <div className="gradient-border rounded-xl p-[1px]">
              <div className="rounded-xl bg-surface-2 p-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-accent" />
                  AI Learning Mode
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  Unlock guided explanations & best practices.
                </p>
                <Button size="sm" variant="gradient" className="mt-2.5 w-full">
                  Enable
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* User + collapse */}
        <div className="border-t border-border p-3">
          <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/40 to-accent/40 text-xs font-semibold">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">{user?.name}</p>
                <p className="truncate text-[10px] text-subtle">{user?.email}</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={logout}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-danger/10 hover:text-danger"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Collapse toggle (desktop) */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border border-border-strong bg-surface text-muted transition-colors hover:text-foreground lg:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className={cn("h-3.5 w-3.5 transition-transform", collapsed && "rotate-180")} />
        </button>
      </aside>
    </>
  )
}
