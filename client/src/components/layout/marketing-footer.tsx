import { Link } from "react-router-dom"
import { ShieldCheck } from "lucide-react"

const cols = [
  { title: "Product", links: ["Features", "How it works", "Languages", "Pricing", "Changelog"] },
  { title: "Resources", links: ["Documentation", "API Reference", "Guides", "Status", "Blog"] },
  { title: "Company", links: ["About", "Careers", "Contact", "Privacy", "Terms"] },
]

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/60 bg-surface/30">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.2} />
              </div>
              <div className="leading-none">
                <span className="block text-sm font-semibold tracking-tight text-foreground">ARCTIC CODE</span>
                <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-subtle">SENS</span>
              </div>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted">
              Analyze. Secure. Optimize. Learn. The AI code review assistant that teaches you to ship better code.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-wider text-subtle">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-muted transition-colors hover:text-foreground">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-subtle sm:flex-row">
          <p>© {new Date().getFullYear()} ARCTIC CODE SENS. All rights reserved.</p>
          <p>Built for engineers, by engineers.</p>
        </div>
      </div>
    </footer>
  )
}
