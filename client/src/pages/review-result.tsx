import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Download,
  FileCode2,
  FileJson,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { GradientCard } from "@/components/ui/card"
import { SeverityBadge, Badge } from "@/components/ui/badge"
import { ScoreRing } from "@/components/ui/score-ring"
import { Progress } from "@/components/ui/primitives"
import { api } from "@/lib/api"
import { downloadPdf, downloadJson, categoryMeta } from "@/lib/report"
import { LANGUAGE_MAP } from "@/data/languages"
import { cn, scoreTier } from "@/lib/utils"
import type { Suggestion } from "@/types"

const categoryIcon: Record<string, string> = {
  bug: "🐛", security: "🔒", performance: "⚡", complexity: "🔀",
  readability: "📖", maintainability: "🔧", "dead-code": "💀",
  duplication: "📋", convention: "📐", documentation: "📝",
}

function SuggestionCard({ s, index }: { s: Suggestion; index: number }) {
  const [open, setOpen] = useState(index === 0)
  const [codeOpen, setCodeOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="gradient-border rounded-xl p-[1px]"
    >
      <div className="rounded-xl bg-surface/80 backdrop-blur-xl">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-start gap-3 p-4 text-left"
        >
          <span className="mt-0.5 text-lg leading-none">{categoryIcon[s.category] ?? "💡"}</span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={s.severity} />
              <Badge variant="outline" className="text-[10px]">{categoryMeta(s.category)}</Badge>
              {s.line && <Badge variant="outline" className="text-[10px]">L{s.line}</Badge>}
              {s.rule && <Badge variant="outline" className="font-mono text-[10px]">{s.rule}</Badge>}
            </div>
            <p className="mt-1.5 text-sm font-semibold text-foreground">{s.title}</p>
          </div>
          <ChevronDown className={cn("mt-1 h-4 w-4 shrink-0 text-subtle transition-transform", open && "rotate-180")} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-4 border-t border-border px-4 pb-4 pt-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-subtle">Explanation</p>
                  <p className="mt-1 text-sm text-muted">{s.explanation}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-subtle">Why it occurs</p>
                    <p className="mt-1 text-sm text-muted">{s.whyItOccurs}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-subtle">Real-world impact</p>
                    <p className="mt-1 text-sm text-muted">{s.realWorldImpact}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-subtle">Suggested fix</p>
                  <p className="mt-1 text-sm text-muted">{s.suggestedFix}</p>
                </div>
                {s.optimizedCode && (
                  <div>
                    <button
                      onClick={() => setCodeOpen((o) => !o)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {codeOpen ? "Hide" : "Show"} optimized code
                      <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", codeOpen && "rotate-90")} />
                    </button>
                    <AnimatePresence>
                      {codeOpen && (
                        <motion.pre
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-2 overflow-x-auto rounded-lg bg-surface-2 p-3 font-mono text-xs text-foreground"
                        >
                          {s.optimizedCode}
                        </motion.pre>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default function ReviewResultPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: review, isLoading, isError } = useQuery({
    queryKey: ["review", id],
    queryFn: () => api.getReview(id!),
    enabled: !!id,
  })

  if (isLoading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )

  if (isError || !review) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <p className="text-muted">Review not found.</p>
      <Button variant="outline" onClick={() => navigate("/app/history")}>
        <ArrowLeft className="h-4 w-4" /> Back to history
      </Button>
    </div>
  )

  const meta = LANGUAGE_MAP[review.language]
  const tier = scoreTier(review.scores.overall)
  const scoreItems = [
    { label: "Security", value: review.scores.security },
    { label: "Performance", value: review.scores.performance },
    { label: "Maintainability", value: review.scores.maintainability },
    { label: "Readability", value: review.scores.readability },
    { label: "Documentation", value: review.scores.documentation },
  ]

  const severityCounts = review.suggestions.reduce(
    (acc, s) => { acc[s.severity] = (acc[s.severity] ?? 0) + 1; return acc },
    {} as Record<string, number>,
  )

  return (
    <div>
      <PageHeader
        title={review.fileName ?? `${meta.label} Review`}
        description={`${review.linesOfCode} lines · ${review.suggestions.length} suggestions · ${new Date(review.createdAt).toLocaleDateString()}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/app/review")}>
              <FileCode2 className="h-4 w-4" /> New Review
            </Button>
            <Button variant="subtle" size="sm" onClick={() => downloadJson(review)}>
              <FileJson className="h-4 w-4" /> JSON
            </Button>
            <Button variant="gradient" size="sm" onClick={() => downloadPdf(review)}>
              <Download className="h-4 w-4" /> PDF Report
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* Left: scores */}
        <div className="space-y-4">
          <GradientCard className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-subtle">Overall Score</p>
            <div className="mt-4 flex justify-center">
              <ScoreRing value={review.scores.overall} size={160} label={tier.label} />
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {Object.entries(severityCounts).map(([sev]) => (
                <SeverityBadge key={sev} severity={sev as Suggestion["severity"]} />
              ))}
            </div>
          </GradientCard>

          <GradientCard>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-subtle">Score Breakdown</p>
            <div className="space-y-3">
              {scoreItems.map((s) => {
                const t = scoreTier(s.value)
                return (
                  <div key={s.label}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-muted">{s.label}</span>
                      <span className={cn("font-semibold tabular-nums", t.color)}>{s.value}</span>
                    </div>
                    <Progress value={s.value} />
                  </div>
                )
              })}
            </div>
          </GradientCard>

          <GradientCard>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-subtle">Summary</p>
            <p className="text-sm leading-relaxed text-muted">{review.summary}</p>
          </GradientCard>

          <GradientCard>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-subtle">File info</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted">Language</span>
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <span className="flex h-5 w-5 items-center justify-center rounded font-mono text-[9px] font-semibold" style={{ background: `${meta.color}22`, color: meta.color }}>{meta.glyph}</span>
                  {meta.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Lines of code</span>
                <span className="font-medium text-foreground tabular-nums">{review.linesOfCode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Issues found</span>
                <span className="font-medium text-foreground tabular-nums">{review.suggestions.length}</span>
              </div>
            </div>
          </GradientCard>
        </div>

        {/* Right: suggestions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Suggestions
              <span className="ml-2 rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted">{review.suggestions.length}</span>
            </h2>
            <Link to="/app/history" className="flex items-center gap-1 text-xs text-primary hover:underline">
              <ArrowLeft className="h-3.5 w-3.5" /> History
            </Link>
          </div>
          {review.suggestions.length === 0 ? (
            <GradientCard className="py-12 text-center">
              <Sparkles className="mx-auto h-8 w-8 text-success" />
              <p className="mt-3 font-semibold text-foreground">No issues found</p>
              <p className="mt-1 text-sm text-muted">Your code looks clean. Keep it up!</p>
            </GradientCard>
          ) : (
            review.suggestions.map((s, i) => <SuggestionCard key={s.id} s={s} index={i} />)
          )}

          {/* Original code */}
          <GradientCard className="mt-2">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-subtle" />
              <p className="text-xs font-semibold uppercase tracking-wider text-subtle">Original Code</p>
            </div>
            <pre className="max-h-80 overflow-auto rounded-lg bg-surface-2 p-4 font-mono text-xs leading-relaxed text-foreground">
              {review.originalCode}
            </pre>
          </GradientCard>
        </div>
      </div>
    </div>
  )
}
