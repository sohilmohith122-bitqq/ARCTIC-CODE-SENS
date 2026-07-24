import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { ArrowRight, FileCode2, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { GradientCard } from "@/components/ui/card"
import { SeverityBadge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/primitives"
import { api } from "@/lib/api"
import { LANGUAGES, LANGUAGE_MAP } from "@/data/languages"
import { cn, timeAgo } from "@/lib/utils"
import type { Language } from "@/types"

export default function HistoryPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const [langFilter, setLangFilter] = useState<Language | "all">("all")

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews"],
    queryFn: api.getReviews,
  })

  const deleteMutation = useMutation({
    mutationFn: api.deleteReview,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews"] })
      toast.success("Review deleted")
    },
    onError: () => toast.error("Failed to delete"),
  })

  const filtered = reviews.filter((r) => {
    const matchLang = langFilter === "all" || r.language === langFilter
    const matchSearch =
      !search ||
      r.fileName?.toLowerCase().includes(search.toLowerCase()) ||
      r.language.includes(search.toLowerCase())
    return matchLang && matchSearch
  })

  const topSeverity = (r: typeof reviews[0]) => {
    const order = ["critical", "high", "medium", "low", "info"]
    const found = order.find((sev) => r.suggestions.some((s) => s.severity === sev))
    return found as "critical" | "high" | "medium" | "low" | "info" | undefined
  }

  return (
    <div>
      <PageHeader
        title="Review History"
        description="All your past code reviews in one place."
        action={
          <Button variant="gradient" onClick={() => (window.location.href = "/app/review")}>
            <FileCode2 className="h-4 w-4" /> New Review
          </Button>
        }
      />

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by filename or language…"
            className="h-10 w-full rounded-lg border border-border-strong bg-surface/60 pl-10 pr-4 text-sm text-foreground placeholder:text-subtle focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setLangFilter("all")}
            className={cn("rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors", langFilter === "all" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted hover:border-primary/40 hover:text-foreground")}
          >
            All
          </button>
          {LANGUAGES.slice(0, 6).map((l) => (
            <button
              key={l.id}
              onClick={() => setLangFilter(l.id)}
              className={cn("rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors", langFilter === l.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted hover:border-primary/40 hover:text-foreground")}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <GradientCard className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="space-y-px p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <FileCode2 className="h-10 w-10 text-subtle" />
            <p className="font-medium text-foreground">No reviews found</p>
            <p className="text-sm text-muted">Try adjusting your filters or start a new review.</p>
            <Button variant="gradient" size="sm" onClick={() => (window.location.href = "/app/review")}>
              New Review
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((r, i) => {
              const meta = LANGUAGE_MAP[r.language]
              const sev = topSeverity(r)
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-2/50"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-mono text-[10px] font-semibold"
                    style={{ background: `${meta.color}22`, color: meta.color }}
                  >
                    {meta.glyph}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {r.fileName ?? `${meta.label} snippet`}
                    </p>
                    <p className="text-xs text-subtle">{timeAgo(r.createdAt)} · {r.linesOfCode} LOC</p>
                  </div>
                  <div className="hidden items-center gap-3 sm:flex">
                    {sev && <SeverityBadge severity={sev} />}
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
                        r.scores.overall >= 75 ? "bg-success/10 text-success" : r.scores.overall >= 60 ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger",
                      )}
                    >
                      {r.scores.overall}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => deleteMutation.mutate(r.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-danger/10 hover:text-danger"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <Link
                      to={`/app/review/${r.id}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-surface-2 hover:text-foreground"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </GradientCard>

      {!isLoading && filtered.length > 0 && (
        <p className="mt-3 text-center text-xs text-subtle">
          Showing {filtered.length} of {reviews.length} reviews
        </p>
      )}
    </div>
  )
}
