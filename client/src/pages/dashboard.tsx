import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  Activity,
  FileCode2,
  Flame,
  Gauge,
  TrendingUp,
  ArrowRight,
} from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { StatCard } from "@/components/common/stat-card"
import { Button } from "@/components/ui/button"
import { GradientCard } from "@/components/ui/card"
import { ScoreRing } from "@/components/ui/score-ring"
import { api } from "@/lib/api"
import { LANGUAGES, LANGUAGE_MAP } from "@/data/languages"
import { cn, timeAgo } from "@/lib/utils"

const chartTooltip = {
  contentStyle: {
    background: "rgba(15,15,18,0.95)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    fontSize: "12px",
    color: "#f4f4f5",
    boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
  },
  labelStyle: { color: "#a1a1aa" },
  itemStyle: { color: "#f4f4f5" },
}

export default function DashboardPage() {
  const { data: analytics, isLoading: aLoading } = useQuery({ queryKey: ["analytics"], queryFn: api.getAnalytics })
  const { data: reviews, isLoading: rLoading } = useQuery({ queryKey: ["reviews"], queryFn: api.getReviews })

  const recent = reviews?.slice(0, 5) ?? []
  const langColors = LANGUAGES.reduce((acc, l) => ({ ...acc, [l.id]: l.color }), {} as Record<string, string>)

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your code review activity at a glance."
        action={
          <Button variant="gradient" onClick={() => (window.location.href = "/app/review")}>
            <FileCode2 className="h-4 w-4" /> New Review
          </Button>
        }
      />

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileCode2} label="Total Reviews" value={analytics?.totalReviews ?? "—"} delta={12} accent="primary" index={0} />
        <StatCard icon={Gauge} label="Average Score" value={analytics?.avgScore ?? "—"} delta={5} accent="success" index={1} />
        <StatCard icon={Flame} label="Day Streak" value={analytics?.streak ?? "—"} delta={8} accent="warning" index={2} />
        <StatCard
          icon={Activity}
          label="Favorite Language"
          value={analytics ? LANGUAGE_MAP[analytics.favoriteLanguage].label : "—"}
          accent="accent"
          index={3}
        />
      </div>

      {/* Charts row */}
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {/* Reviews trend */}
        <GradientCard className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">Review activity</h3>
              <p className="text-sm text-muted">Reviews and average score over the week</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-success">
              <TrendingUp className="h-3.5 w-3.5" /> trending up
            </span>
          </div>
          <div className="h-[260px]">
            {aLoading ? (
              <div className="h-full w-full animate-pulse rounded-lg bg-surface-2/60" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.reviewsTrend ?? []} margin={{ left: -16, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="reviewFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip {...chartTooltip} />
                  <Area type="monotone" dataKey="count" name="Reviews" stroke="#3b82f6" strokeWidth={2} fill="url(#reviewFill)" />
                  <Area type="monotone" dataKey="avgScore" name="Avg Score" stroke="#8b5cf6" strokeWidth={2} fill="url(#scoreFill)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </GradientCard>

        {/* Score ring + breakdown */}
        <GradientCard>
          <h3 className="text-base font-semibold text-foreground">Overall health</h3>
          <p className="text-sm text-muted">Average across all reviews</p>
          <div className="mt-4 flex justify-center">
            <ScoreRing value={analytics?.avgScore ?? 0} size={160} label="Avg score" />
          </div>
          <div className="mt-5 space-y-2.5">
            {(analytics?.scoreDistribution ?? []).map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-xs text-muted">{s.label}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.value}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                  />
                </div>
                <span className="w-8 text-right text-xs font-medium text-foreground tabular-nums">{s.value}</span>
              </div>
            ))}
          </div>
        </GradientCard>
      </div>

      {/* Languages + Recent */}
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {/* Language distribution */}
        <GradientCard>
          <h3 className="text-base font-semibold text-foreground">Languages</h3>
          <p className="text-sm text-muted">Distribution by reviews</p>
          <div className="mt-2 h-[200px]">
            {aLoading ? (
              <div className="h-full w-full animate-pulse rounded-lg bg-surface-2/60" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics?.languageDistribution ?? []}
                    dataKey="count"
                    nameKey="language"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {(analytics?.languageDistribution ?? []).map((entry) => (
                      <Cell key={entry.language} fill={langColors[entry.language]} />
                    ))}
                  </Pie>
                  <Tooltip {...chartTooltip} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(analytics?.languageDistribution ?? []).map((l) => (
              <span key={l.language} className="inline-flex items-center gap-1.5 text-xs text-muted">
                <span className="h-2 w-2 rounded-full" style={{ background: langColors[l.language] }} />
                {LANGUAGE_MAP[l.language].label}
              </span>
            ))}
          </div>
        </GradientCard>

        {/* Severity bar */}
        <GradientCard>
          <h3 className="text-base font-semibold text-foreground">Issues by severity</h3>
          <p className="text-sm text-muted">Aggregated across reviews</p>
          <div className="mt-4 h-[200px]">
            {aLoading ? (
              <div className="h-full w-full animate-pulse rounded-lg bg-surface-2/60" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.severityBreakdown ?? []} margin={{ left: -20, right: 8, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="severity" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip {...chartTooltip} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#3b82f6" barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </GradientCard>

        {/* Recent reviews */}
        <GradientCard className="lg:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Recent reviews</h3>
            <Link to="/app/history" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <div className="space-y-1">
            {rLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 w-full animate-pulse rounded-lg bg-surface-2/60" />
                ))
              : recent.map((r) => {
                  const meta = LANGUAGE_MAP[r.language]
                  return (
                    <Link
                      key={r.id}
                      to={`/app/review/${r.id}`}
                      className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-surface-2"
                    >
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-[10px] font-semibold"
                        style={{ background: `${meta.color}22`, color: meta.color }}
                      >
                        {meta.glyph}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {r.fileName ?? `${meta.label} snippet`}
                        </p>
                        <p className="text-xs text-subtle">{timeAgo(r.createdAt)}</p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                          r.scores.overall >= 75
                            ? "bg-success/10 text-success"
                            : r.scores.overall >= 60
                              ? "bg-warning/10 text-warning"
                              : "bg-danger/10 text-danger",
                        )}
                      >
                        {r.scores.overall}
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-subtle opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  )
                })}
            {rLoading && (
              <div className="flex items-center justify-center pt-2 text-xs text-subtle">Loading recent activity…</div>
            )}
          </div>
        </GradientCard>
      </div>
    </div>
  )
}
