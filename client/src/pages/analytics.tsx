import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  Pie, PieChart, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts"
import { Activity, Flame, Gauge, TrendingUp } from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { StatCard } from "@/components/common/stat-card"
import { GradientCard } from "@/components/ui/card"
import { api } from "@/lib/api"
import { LANGUAGE_MAP } from "@/data/languages"

const tt = {
  contentStyle: {
    background: "rgba(15,15,18,0.95)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    fontSize: "12px",
    color: "#f4f4f5",
  },
  labelStyle: { color: "#a1a1aa" },
}

const SEV_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f59e0b",
  medium: "#3b82f6",
  low: "#8b5cf6",
  info: "#71717a",
}

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({ queryKey: ["analytics"], queryFn: api.getAnalytics })

  const radarData = analytics?.scoreDistribution.map((s) => ({ subject: s.label, score: s.value })) ?? []

  return (
    <div>
      <PageHeader title="Analytics" description="Insights and trends across all your reviews." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Activity} label="Total Reviews" value={analytics?.totalReviews ?? "—"} delta={12} accent="primary" index={0} />
        <StatCard icon={Gauge} label="Average Score" value={analytics?.avgScore ?? "—"} delta={5} accent="success" index={1} />
        <StatCard icon={Flame} label="Day Streak" value={analytics?.streak ?? "—"} delta={8} accent="warning" index={2} />
        <StatCard
          icon={TrendingUp}
          label="Top Language"
          value={analytics ? LANGUAGE_MAP[analytics.favoriteLanguage].label : "—"}
          accent="accent"
          index={3}
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {/* Review trend */}
        <GradientCard>
          <h3 className="mb-1 text-base font-semibold text-foreground">Review activity</h3>
          <p className="mb-4 text-sm text-muted">Daily reviews and average score</p>
          <div className="h-[260px]">
            {isLoading ? (
              <div className="h-full w-full animate-pulse rounded-lg bg-surface-2/60" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.reviewsTrend ?? []} margin={{ left: -16, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="aFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="bFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip {...tt} />
                  <Area type="monotone" dataKey="count" name="Reviews" stroke="#3b82f6" strokeWidth={2} fill="url(#aFill)" />
                  <Area type="monotone" dataKey="avgScore" name="Avg Score" stroke="#8b5cf6" strokeWidth={2} fill="url(#bFill)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </GradientCard>

        {/* Score radar */}
        <GradientCard>
          <h3 className="mb-1 text-base font-semibold text-foreground">Score radar</h3>
          <p className="mb-4 text-sm text-muted">Average scores across all dimensions</p>
          <div className="h-[260px]">
            {isLoading ? (
              <div className="h-full w-full animate-pulse rounded-lg bg-surface-2/60" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                  <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} strokeWidth={2} />
                  <Tooltip {...tt} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </GradientCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Language distribution */}
        <GradientCard>
          <h3 className="mb-1 text-base font-semibold text-foreground">Languages</h3>
          <p className="mb-4 text-sm text-muted">Reviews by language</p>
          <div className="h-[200px]">
            {isLoading ? (
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
                      <Cell key={entry.language} fill={LANGUAGE_MAP[entry.language].color} />
                    ))}
                  </Pie>
                  <Tooltip {...tt} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(analytics?.languageDistribution ?? []).map((l) => (
              <span key={l.language} className="inline-flex items-center gap-1.5 text-xs text-muted">
                <span className="h-2 w-2 rounded-full" style={{ background: LANGUAGE_MAP[l.language].color }} />
                {LANGUAGE_MAP[l.language].label}
                <span className="text-subtle">({l.count})</span>
              </span>
            ))}
          </div>
        </GradientCard>

        {/* Severity breakdown */}
        <GradientCard>
          <h3 className="mb-1 text-base font-semibold text-foreground">Issues by severity</h3>
          <p className="mb-4 text-sm text-muted">Aggregated across all reviews</p>
          <div className="h-[200px]">
            {isLoading ? (
              <div className="h-full w-full animate-pulse rounded-lg bg-surface-2/60" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.severityBreakdown ?? []} margin={{ left: -20, right: 8, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="severity" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip {...tt} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={28}>
                    {(analytics?.severityBreakdown ?? []).map((entry) => (
                      <Cell key={entry.severity} fill={SEV_COLORS[entry.severity] ?? "#3b82f6"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </GradientCard>

        {/* Score breakdown bars */}
        <GradientCard>
          <h3 className="mb-1 text-base font-semibold text-foreground">Score breakdown</h3>
          <p className="mb-4 text-sm text-muted">Average per dimension</p>
          <div className="space-y-3">
            {(analytics?.scoreDistribution ?? []).map((s, i) => (
              <div key={s.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted">{s.label}</span>
                  <span className="font-semibold tabular-nums text-foreground">{s.value}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.value}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                  />
                </div>
              </div>
            ))}
          </div>
        </GradientCard>
      </div>
    </div>
  )
}
