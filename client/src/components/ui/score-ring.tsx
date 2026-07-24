import { motion } from "framer-motion"
import { cn, scoreTier } from "@/lib/utils"

export function ScoreRing({
  value,
  size = 140,
  stroke = 10,
  label,
  showLabel = true,
  className,
}: {
  value: number
  size?: number
  stroke?: number
  label?: string
  showLabel?: boolean
  className?: string
}) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference
  const tier = scoreTier(value)

  const gradientId = `ring-${label ?? "score"}`
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
          {Math.round(value)}
        </span>
        {showLabel && (
          <span className={cn("text-xs font-medium", tier.color)}>{label ?? tier.label}</span>
        )}
      </div>
    </div>
  )
}
