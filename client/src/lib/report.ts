import { jsPDF } from "jspdf"
import type { Review, Suggestion } from "@/types"
import { LANGUAGE_MAP } from "@/data/languages"

const severityColor: Record<string, [number, number, number]> = {
  critical: [239, 68, 68],
  high: [245, 158, 11],
  medium: [59, 130, 246],
  low: [139, 92, 246],
  info: [113, 113, 122],
}

const categoryLabel: Record<string, string> = {
  bug: "Bug",
  security: "Security",
  performance: "Performance",
  complexity: "Complexity",
  readability: "Readability",
  maintainability: "Maintainability",
  "dead-code": "Dead Code",
  duplication: "Duplication",
  convention: "Convention",
  documentation: "Documentation",
}

function scoreColor(score: number): [number, number, number] {
  if (score >= 90) return [34, 197, 94]
  if (score >= 75) return [59, 130, 246]
  if (score >= 60) return [245, 158, 11]
  return [239, 68, 68]
}

export function downloadJson(review: Review) {
  const payload = {
    reportId: review.id,
    generatedAt: new Date().toISOString(),
    language: LANGUAGE_MAP[review.language].label,
    fileName: review.fileName,
    linesOfCode: review.linesOfCode,
    scores: review.scores,
    summary: review.summary,
    suggestions: review.suggestions.map((s) => ({
      id: s.id,
      category: s.category,
      categoryLabel: categoryLabel[s.category],
      severity: s.severity,
      title: s.title,
      explanation: s.explanation,
      whyItOccurs: s.whyItOccurs,
      realWorldImpact: s.realWorldImpact,
      suggestedFix: s.suggestedFix,
      optimizedCode: s.optimizedCode,
      line: s.line,
      rule: s.rule,
    })),
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
  triggerDownload(blob, `arctic-review-${review.id}.json`)
}

export function downloadPdf(review: Review) {
  const doc = new jsPDF({ unit: "pt", format: "a4" })
  const W = doc.internal.pageSize.getWidth()
  const M = 40
  let y = 0

  // Header band
  doc.setFillColor(15, 15, 18)
  doc.rect(0, 0, W, 110, "F")
  doc.setFillColor(59, 130, 246)
  doc.rect(0, 108, W, 2, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(20)
  doc.text("ARCTIC CODE SENS", M, 44)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(161, 161, 170)
  doc.text("Analyze · Secure · Optimize · Learn", M, 60)
  doc.setFontSize(9)
  doc.text(`Generated ${new Date().toLocaleString()}`, W - M, 44, { align: "right" })
  doc.text(`${LANGUAGE_MAP[review.language].label} · ${review.linesOfCode} LOC`, W - M, 60, { align: "right" })

  y = 140
  doc.setTextColor(24, 24, 27)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.text("Code Review Report", M, y)
  y += 22

  // Overall score ring (simulated with text)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(113, 113, 122)
  doc.text("Overall Score", M, y + 6)
  const [r, g, b] = scoreColor(review.scores.overall)
  doc.setFillColor(r, g, b)
  doc.roundedRect(M, y + 12, 70, 28, 4, 4, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.text(String(Math.round(review.scores.overall)), M + 12, y + 31)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.text("/ 100", M + 50, y + 31)

  // Score grid
  const scores = [
    ["Security", review.scores.security],
    ["Performance", review.scores.performance],
    ["Maintainability", review.scores.maintainability],
    ["Readability", review.scores.readability],
    ["Documentation", review.scores.documentation],
  ] as const
  let x = M + 100
  scores.forEach(([label, val]) => {
    const [sr, sg, sb] = scoreColor(val)
    doc.setTextColor(113, 113, 122)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.text(label, x, y + 6)
    doc.setFillColor(240, 240, 244)
    doc.roundedRect(x, y + 12, 70, 14, 3, 3, "F")
    doc.setFillColor(sr, sg, sb)
    doc.roundedRect(x, y + 12, (val / 100) * 70, 14, 3, 3, "F")
    doc.setTextColor(24, 24, 27)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.text(String(Math.round(val)), x + 60, y + 22, { align: "right" })
    x += 84
    if (x > W - M - 80) { x = M + 100 }
  })

  y += 60
  doc.setDrawColor(228, 228, 231)
  doc.line(M, y, W - M, y)
  y += 18

  // Summary
  doc.setTextColor(24, 24, 27)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("Summary", M, y)
  y += 14
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(82, 82, 91)
  const summaryLines = doc.splitTextToSize(review.summary, W - M * 2)
  doc.text(summaryLines, M, y)
  y += summaryLines.length * 12 + 14

  // Suggestions
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.setTextColor(24, 24, 27)
  doc.text(`Suggestions (${review.suggestions.length})`, M, y)
  y += 16

  review.suggestions.forEach((s, i) => {
    if (y > doc.internal.pageSize.getHeight() - 80) {
      doc.addPage()
      y = M
    }
    const [sr, sg, sb] = severityColor[s.severity]
    doc.setFillColor(sr, sg, sb)
    doc.circle(M + 4, y - 3, 3, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(24, 24, 27)
    doc.text(`${i + 1}. ${s.title}`, M + 14, y)
    const tag = `${categoryLabel[s.category]} · ${s.severity}${s.line ? ` · L${s.line}` : ""}${s.rule ? ` · ${s.rule}` : ""}`
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(113, 113, 122)
    doc.text(tag, M + 14, y + 12)
    y += 22

    const body = `${s.explanation} WHY: ${s.whyItOccurs} IMPACT: ${s.realWorldImpact} FIX: ${s.suggestedFix}`
    const lines = doc.splitTextToSize(body, W - M * 2)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(63, 63, 70)
    doc.text(lines, M, y)
    y += lines.length * 11 + 8
    if (s.optimizedCode) {
      doc.setFillColor(244, 244, 245)
      doc.roundedRect(M, y, W - M * 2, 30, 4, 4, "F")
      doc.setFont("courier", "normal")
      doc.setFontSize(8)
      doc.setTextColor(24, 24, 27)
      const codeLines = doc.splitTextToSize(s.optimizedCode, W - M * 2 - 16)
      doc.text(codeLines.slice(0, 2), M + 8, y + 18)
      y += 38
    }
    doc.setDrawColor(240, 240, 244)
    doc.line(M, y, W - M, y)
    y += 14
  })

  // Footer
  doc.addPage()
  doc.setFillColor(15, 15, 18)
  doc.rect(0, 0, W, 70, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.text("ARCTIC CODE SENS", M, 44)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(161, 161, 170)
  doc.text("Analyze · Secure · Optimize · Learn", M, 60)
  doc.setTextColor(113, 113, 122)
  doc.text("This report was generated by the ARCTIC CODE SENS AI review engine.", M, 100)

  doc.save(`arctic-review-${review.id}.pdf`)
}

function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function categoryMeta(category: Suggestion["category"]) {
  return categoryLabel[category] ?? category
}
