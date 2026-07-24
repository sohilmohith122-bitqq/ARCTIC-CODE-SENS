import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ShieldCheck, CheckCircle2 } from "lucide-react"
import type { ReactNode } from "react"

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="app-backdrop grid min-h-svh lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col px-6 py-8 sm:px-10 lg:px-16">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-[0_4px_16px_-4px_rgba(139,92,246,0.6)]">
            <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.2} />
          </div>
          <div className="leading-none">
            <span className="block text-sm font-semibold tracking-tight text-foreground">ARCTIC CODE</span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-subtle">SENS</span>
          </div>
        </Link>

        <div className="flex flex-1 items-center justify-center py-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="w-full max-w-sm"
          >
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
            <div className="mt-7">{children}</div>
            <div className="mt-6 text-center text-sm text-muted">{footer}</div>
          </motion.div>
        </div>
      </div>

      {/* Brand side */}
      <div className="relative hidden overflow-hidden border-l border-border bg-surface/40 lg:block">
        <div className="absolute -inset-40 bg-[radial-gradient(40rem_40rem_at_70%_20%,rgba(139,92,246,0.18),transparent_60%),radial-gradient(30rem_30rem_at_20%_80%,rgba(59,130,246,0.16),transparent_55%)]" />
        <div className="relative flex h-full flex-col justify-center px-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <span className="inline-block rounded-full border border-border-strong bg-surface/60 px-3 py-1 text-xs text-muted">
              Analyze · Secure · Optimize · Learn
            </span>
            <h2 className="mt-6 max-w-md text-3xl font-bold leading-tight tracking-tight text-foreground">
              The AI code review assistant that <span className="text-gradient">teaches</span> better programming.
            </h2>
            <ul className="mt-8 space-y-3.5">
              {[
                "Severity-ranked explanations, not just errors",
                "Security, performance & maintainability scoring",
                "Optimized code with best-practice references",
                "Downloadable PDF & JSON reports",
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-muted">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>
          <div className="mt-12 flex items-center gap-3 text-xs text-subtle">
            <div className="flex -space-x-2">
              {["S", "A", "R", "K"].map((c) => (
                <span key={c} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-surface-2 text-[10px] font-semibold text-foreground">
                  {c}
                </span>
              ))}
            </div>
            Trusted by 12,000+ developers worldwide
          </div>
        </div>
      </div>
    </div>
  )
}

export function GoogleButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-border-strong bg-surface/60 text-sm font-medium text-foreground transition-all hover:bg-surface-2"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
      </svg>
      Continue with Google
    </button>
  )
}
