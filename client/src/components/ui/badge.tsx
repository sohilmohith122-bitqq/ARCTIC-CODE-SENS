import type { HTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import type { Severity } from "@/types"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-border-strong bg-surface-2 text-foreground",
        primary: "border-primary/30 bg-primary/10 text-[#93c5fd]",
        accent: "border-accent/30 bg-accent/10 text-[#c4b5fd]",
        success: "border-success/30 bg-success/10 text-[#86efac]",
        warning: "border-warning/30 bg-warning/10 text-[#fcd34d]",
        danger: "border-danger/30 bg-danger/10 text-[#fca5a5]",
        outline: "border-border text-muted",
      },
    },
    defaultVariants: { variant: "default" },
  },
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

const severityMeta: Record<Severity, { variant: NonNullable<BadgeProps["variant"]>; label: string; dot: string }> = {
  critical: { variant: "danger", label: "Critical", dot: "bg-danger" },
  high: { variant: "warning", label: "High", dot: "bg-warning" },
  medium: { variant: "primary", label: "Medium", dot: "bg-primary" },
  low: { variant: "accent", label: "Low", dot: "bg-accent" },
  info: { variant: "outline", label: "Info", dot: "bg-subtle" },
}

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  const meta = severityMeta[severity]
  return (
    <Badge variant={meta.variant} className={className}>
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </Badge>
  )
}
