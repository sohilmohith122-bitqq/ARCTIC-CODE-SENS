import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Bug,
  Gauge,
  Lock,
  Play,
  Sparkles,
  ShieldCheck,
  FileCode2,
  BarChart3,
  Zap,
  GraduationCap,
  CheckCircle2,
} from "lucide-react"
import { MarketingNav } from "@/components/layout/marketing-nav"
import { MarketingFooter } from "@/components/layout/marketing-footer"
import { Button } from "@/components/ui/button"
import { GradientCard } from "@/components/ui/card"
import { LANGUAGES } from "@/data/languages"
import { ScoreRing } from "@/components/ui/score-ring"

const features = [
  { icon: Bug, title: "Bug & Logic Detection", desc: "Catch runtime risks, logic errors, and silent failures before they reach production.", color: "text-danger" },
  { icon: Lock, title: "Security Scanning", desc: "SAST-grade vulnerability detection: injection, hardcoded secrets, and unsafe patterns.", color: "text-warning" },
  { icon: Gauge, title: "Performance Profiling", desc: "Surface complexity hotspots, memory waste, and algorithmic inefficiencies.", color: "text-success" },
  { icon: FileCode2, title: "Readability & Style", desc: "Naming, dead code, duplication, and maintainability scoring with fixes.", color: "text-primary" },
  { icon: GraduationCap, title: "AI Learning Mode", desc: "Every issue explains why it matters and how to fix it — not just what's wrong.", color: "text-accent" },
  { icon: BarChart3, title: "Score & Reports", desc: "Quantified scores plus downloadable PDF and JSON reports per review.", color: "text-[#93c5fd]" },
]

const steps = [
  { n: "01", title: "Paste or upload", desc: "Drop in a snippet, a file, or an entire folder. Pick your language." },
  { n: "02", title: "AI analyzes", desc: "Static analysis, security scan, complexity, and the AI review engine run in seconds." },
  { n: "03", title: "Learn & ship", desc: "Review severity-ranked suggestions with fixes, scores, and a downloadable report." },
]

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="app-backdrop min-h-svh">
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 lg:px-8 lg:pb-24 lg:pt-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div initial="hidden" animate="show" variants={container}>
              <motion.div variants={item} className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface/60 px-3 py-1.5 text-xs text-muted">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                AI-powered code review, now with Learning Mode
              </motion.div>
              <motion.h1 variants={item} className="mt-5 text-5xl font-bold leading-[1.05] tracking-tight text-foreground lg:text-6xl">
                Write code that's <span className="text-gradient">cleaner, safer</span>, and faster.
              </motion.h1>
              <motion.p variants={item} className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
                ARCTIC CODE SENS doesn't just find problems — it explains why they matter, how to fix
                them, and the best practices behind the fix. The code review assistant that teaches.
              </motion.p>
              <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
                <Button variant="gradient" size="lg" onClick={() => navigate("/register")}>
                  Start reviewing free
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="glass" size="lg" onClick={() => navigate("/login")}>
                  <Play className="h-4 w-4" />
                  Live demo
                </Button>
              </motion.div>
              <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-subtle">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> 12 languages</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> No credit card</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-success" /> PDF & JSON reports</span>
              </motion.div>
            </motion.div>

            {/* Animated code window */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="relative"
            >
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-primary/20 via-accent/20 to-transparent blur-2xl" />
              <GradientCard className="overflow-hidden">
                <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                  <span className="h-3 w-3 rounded-full bg-danger/80" />
                  <span className="h-3 w-3 rounded-full bg-warning/80" />
                  <span className="h-3 w-3 rounded-full bg-success/80" />
                  <span className="ml-2 font-mono text-xs text-subtle">auth_service.py</span>
                  <span className="ml-auto rounded-full border border-danger/30 bg-danger/10 px-2 py-0.5 text-[10px] font-medium text-[#fca5a5]">
                    3 critical
                  </span>
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed">
<code><span className="text-[#71717a]">1</span>  <span className="text-[#f472b6]">import</span> <span className="text-foreground">os</span>{'\n'}
<span className="text-[#71717a]">2</span>  <span className="text-[#f472b6]">def</span> <span className="text-[#93c5fd]">fetch_users</span><span className="text-foreground">(db):</span>{'\n'}
<span className="text-[#71717a]">3</span>    <span className="text-foreground">password = </span><span className="text-[#fcd34d]">"admin123"</span>{'\n'}
<span className="text-[#71717a]">4</span>    <span className="text-foreground">users = []</span>{'\n'}
<span className="text-[#71717a]">5</span>    <span className="text-[#f472b6]">for</span> <span className="text-foreground">u </span><span className="text-[#f472b6]">in</span> <span className="text-foreground">db.</span><span className="text-[#93c5fd]">query</span><span className="text-foreground">(</span><span className="text-[#fcd34d]">"SELECT * FROM users"</span><span className="text-foreground">):</span>{'\n'}
<span className="text-[#71717a]">6</span>      <span className="text-foreground">users.</span><span className="text-[#93c5fd]">append</span><span className="text-foreground">(u)</span>{'\n'}
<span className="text-[#71717a]">7</span>  <span className="text-[#f472b6]">def</span> <span className="text-[#93c5fd]">handle</span><span className="text-foreground">(req):</span>{'\n'}
<span className="text-[#71717a]">8</span>    <span className="text-foreground">data = req.body</span>{'\n'}
<span className="text-[#71717a]">9</span>    <span className="text-[#fcd34d]">eval</span><span className="text-foreground">(data[</span><span className="text-[#fcd34d]">"expr"</span><span className="text-foreground">])</span></code>
                </pre>
                <div className="grid grid-cols-2 gap-3 border-t border-border p-4">
                  <div className="flex items-center gap-3">
                    <ScoreRing value={42} size={64} stroke={6} showLabel={false} />
                    <div>
                      <p className="text-xs text-subtle">Overall</p>
                      <p className="text-sm font-semibold text-danger">Needs work</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { t: "Hardcoded secret", s: "critical" },
                      { t: "Unsafe eval()", s: "critical" },
                      { t: "SQL injection risk", s: "high" },
                    ].map((x) => (
                      <div key={x.t} className="flex items-center gap-2 text-xs">
                        <span className={x.s === "critical" ? "h-1.5 w-1.5 rounded-full bg-danger" : "h-1.5 w-1.5 rounded-full bg-warning"} />
                        <span className="text-muted">{x.t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </GradientCard>
            </motion.div>
          </div>

          {/* Logo strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-20 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-subtle"
          >
            <span className="font-medium uppercase tracking-wider">Trusted by teams at</span>
            <span className="font-semibold text-muted">Vercel</span>
            <span className="font-semibold text-muted">Linear</span>
            <span className="font-semibold text-muted">Cursor</span>
            <span className="font-semibold text-muted">Raycast</span>
            <span className="font-semibold text-muted">Supabase</span>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Features</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
            Every layer of your code, reviewed
          </h2>
          <p className="mt-4 text-muted">
            A complete review pipeline from syntax to security to maintainability — with explanations, not just verdicts.
          </p>
        </div>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={item}>
              <GradientCard className="group h-full transition-transform duration-300 hover:-translate-y-1">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-2 ring-1 ring-border">
                  <f.icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.desc}</p>
              </GradientCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">How it works</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
              From code to clarity in three steps
            </h2>
            <p className="mt-4 text-muted">
              A purpose-built analysis pipeline runs your code through static analysis, a security
              scanner, complexity and performance checks, then synthesizes it all with the AI review engine.
            </p>
            <div className="mt-8 space-y-5">
              {steps.map((s) => (
                <div key={s.n} className="flex gap-4">
                  <span className="font-mono text-sm font-semibold text-primary">{s.n}</span>
                  <div>
                    <p className="font-medium text-foreground">{s.title}</p>
                    <p className="mt-0.5 text-sm text-muted">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: Zap, t: "Static Analysis", d: "Syntax + lint via tree-sitter, ESLint, Pylint." },
              { icon: Lock, t: "Security Scan", d: "Bandit-style SAST for injection & secrets." },
              { icon: Gauge, t: "Complexity", d: "Cyclomatic & cognitive complexity with Radon." },
              { icon: Sparkles, t: "AI Review", d: "LLM synthesizes fixes & best practices." },
            ].map((c) => (
              <GradientCard key={c.t} className="p-5">
                <c.icon className="h-5 w-5 text-primary" />
                <p className="mt-3 text-sm font-semibold text-foreground">{c.t}</p>
                <p className="mt-1 text-xs text-muted">{c.d}</p>
              </GradientCard>
            ))}
          </div>
        </div>
      </section>

      {/* Languages */}
      <section id="languages" className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-success">Languages</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground lg:text-4xl">12 languages, one assistant</h2>
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {LANGUAGES.map((l, i) => (
            <motion.div
              key={l.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="glass flex items-center gap-2.5 rounded-xl px-4 py-3 transition-colors hover:border-primary/40"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg font-mono text-xs font-semibold" style={{ background: `${l.color}22`, color: l.color }}>
                {l.glyph}
              </span>
              <span className="text-sm font-medium text-foreground">{l.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Pricing</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground lg:text-4xl">Start free, scale when ready</h2>
        </div>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {[
            { name: "Student", price: "Free", desc: "For learners and personal projects", features: ["20 reviews / month", "All 12 languages", "Score & suggestions", "JSON export"], cta: "Get started", highlight: false },
            { name: "Developer", price: "$12", per: "/mo", desc: "For working engineers", features: ["Unlimited reviews", "PDF & JSON reports", "GitHub repo import", "AI Learning Mode", "History & analytics"], cta: "Start 14-day trial", highlight: true },
            { name: "Team", price: "$39", per: "/mo", desc: "For teams and bootcamps", features: ["Everything in Developer", "Team workspace", "Shared review history", "PR review integration", "Priority support"], cta: "Contact us", highlight: false },
          ].map((p) => (
            <GradientCard key={p.name} className={p.highlight ? "ring-1 ring-primary/40" : ""}>
              {p.highlight && (
                <span className="mb-3 inline-block rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                  Most popular
                </span>
              )}
              <p className="text-sm font-medium text-muted">{p.name}</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-foreground">{p.price}</span>
                {p.per && <span className="text-sm text-subtle">{p.per}</span>}
              </div>
              <p className="mt-1 text-sm text-muted">{p.desc}</p>
              <ul className="mt-5 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant={p.highlight ? "gradient" : "outline"} className="mt-6 w-full" onClick={() => navigate("/register")}>
                {p.cta}
              </Button>
            </GradientCard>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="gradient-border rounded-3xl p-[1px]">
          <div className="relative overflow-hidden rounded-3xl bg-surface px-8 py-16 text-center">
            <div className="absolute -inset-x-20 -top-24 -z-10 h-64 bg-gradient-to-b from-primary/20 to-transparent blur-3xl" />
            <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
              Ship code you're proud of
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted">
              Join developers reviewing smarter. Your first review takes less than a minute.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button variant="gradient" size="lg" onClick={() => navigate("/register")}>
                Get started free <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="glass" size="lg" onClick={() => navigate("/login")}>
                Sign in
              </Button>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
