import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.5)] hover:shadow-[0_6px_28px_-4px_rgba(59,130,246,0.6)]",
        accent:
          "bg-accent text-primary-foreground hover:bg-accent/90 shadow-[0_4px_20px_-4px_rgba(139,92,246,0.5)]",
        gradient:
          "text-primary-foreground bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-[0_4px_24px_-6px_rgba(139,92,246,0.7)]",
        outline: "border border-border-strong bg-transparent text-foreground hover:bg-surface-2 hover:border-primary/50",
        ghost: "text-muted hover:text-foreground hover:bg-surface-2",
        glass: "glass text-foreground hover:bg-white/5",
        danger: "bg-danger text-white hover:bg-danger/90 shadow-[0_4px_20px_-4px_rgba(239,68,68,0.5)]",
        subtle: "bg-surface-2 text-foreground hover:bg-border-strong border border-border",
      },
      size: {
        sm: "h-9 px-3 text-xs",
        default: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  },
)
Button.displayName = "Button"
