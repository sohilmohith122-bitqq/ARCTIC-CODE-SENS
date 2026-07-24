import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/** Merge Tailwind classes with conditional logic. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format an ISO date into a compact relative label. */
export function timeAgo(iso: string): string {
  const date = new Date(iso)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [3600, "minute"],
    [86400, "hour"],
    [604800, "day"],
    [2629800, "week"],
    [31557600, "month"],
    [Infinity, "year"],
  ]
  const divisions: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.345, "week"],
    [12, "month"],
    [Infinity, "year"],
  ]
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })
  let duration = seconds
  let unit: Intl.RelativeTimeFormatUnit = "second"
  for (let i = 0; i < divisions.length; i++) {
    const [limit, u] = divisions[i]
    if (duration < limit) {
      unit = u
      break
    }
    duration = Math.floor(duration / limit)
  }
  void units
  return rtf.format(-Math.max(1, Math.floor(duration)), unit)
}

/** Format a number into compact notation (e.g. 1.2k). */
export function formatCompact(n: number): string {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n)
}

/** Clamp a number between min and max. */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max)
}

/** Map a 0-100 score to a qualitative label and color token. */
export function scoreTier(score: number): { label: string; color: string } {
  if (score >= 90) return { label: "Excellent", color: "text-success" }
  if (score >= 75) return { label: "Good", color: "text-primary" }
  if (score >= 60) return { label: "Fair", color: "text-warning" }
  return { label: "Needs Work", color: "text-danger" }
}

/** Sleep helper for simulating latency. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
