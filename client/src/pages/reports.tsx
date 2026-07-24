import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Download, FileJson, FileText, Loader2 } from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { GradientCard } from "@/components/ui/card"
import { ScoreRing } from "@/components/ui/score-ring"
import { api } from "@/lib/api"
import { downloadPdf, downloadJson } from "@/lib/report"
import { LANGUAGE_MAP } from "@/data/languages"
import { timeAgo } from "@/lib/utils"

export default function ReportsPage() {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews"],
    queryFn: api.getReviews,
  })

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Download PDF or JSON reports for any review."
      />

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : reviews.length === 0 ? (
        <GradientCard className="py-16 text-center">
          <FileText className="mx-auto h-10 w-10 text-subtle" />
          <p className="mt-3 font-medium text-foreground">No reports yet</p>
          <p className="mt-1 text-sm text-muted">Complete a code review to generate your first report.</p>
          <Button variant="gradient" size="sm" className="mt-4" onClick={() => (window.location.href = "/app/review")}>
            Start a review
          </Button>
        </GradientCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r, i) => {
            const meta = LANGUAGE_MAP[r.language]
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GradientCard className="flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-mono text-[10px] font-semibold"
                      style={{ background: `${meta.color}22`, color: meta.color }}
                    >
                      {meta.glyph}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {r.fileName ?? `${meta.label} snippet`}
                      </p>
                      <p className="text-xs text-subtle">{timeAgo(r.createdAt)} · {r.linesOfCode} LOC</p>
                    </div>
                    <ScoreRing value={r.scores.overall} size={56} stroke={5} showLabel={false} />
                  </div>

                  <p className="line-clamp-2 text-xs leading-relaxed text-muted">{r.summary}</p>

                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="subtle"
                      size="sm"
                      className="flex-1"
                      onClick={() => downloadJson(r)}
                    >
                      <FileJson className="h-4 w-4" /> JSON
                    </Button>
                    <Button
                      variant="gradient"
                      size="sm"
                      className="flex-1"
                      onClick={() => downloadPdf(r)}
                    >
                      <Download className="h-4 w-4" /> PDF
                    </Button>
                  </div>
                </GradientCard>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
