import {
  LayoutDashboard,
  FileCode2,
  History,
  BarChart3,
  FileText,
  User,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  description: string
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Overview & stats" },
  { to: "/app/review", label: "Review Code", icon: FileCode2, description: "Analyze code with AI" },
  { to: "/app/history", label: "History", icon: History, description: "Past reviews" },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3, description: "Insights & trends" },
  { to: "/app/reports", label: "Reports", icon: FileText, description: "Downloadable reports" },
  { to: "/app/profile", label: "Profile", icon: User, description: "Your account" },
  { to: "/app/settings", label: "Settings", icon: Settings, description: "Preferences" },
]

export const BRAND_ICON = ShieldCheck
