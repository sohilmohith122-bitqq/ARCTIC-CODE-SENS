import type { Language } from "@/types"

export interface LanguageMeta {
  id: Language
  label: string
  monacoId: string
  extension: string
  color: string
  glyph: string
}

export const LANGUAGES: LanguageMeta[] = [
  { id: "python", label: "Python", monacoId: "python", extension: "py", color: "#3B82F6", glyph: "Py" },
  { id: "javascript", label: "JavaScript", monacoId: "javascript", extension: "js", color: "#F59E0B", glyph: "JS" },
  { id: "typescript", label: "TypeScript", monacoId: "typescript", extension: "ts", color: "#3B82F6", glyph: "TS" },
  { id: "java", label: "Java", monacoId: "java", extension: "java", color: "#EF4444", glyph: "Jv" },
  { id: "c", label: "C", monacoId: "c", extension: "c", color: "#8B5CF6", glyph: "C" },
  { id: "cpp", label: "C++", monacoId: "cpp", extension: "cpp", color: "#8B5CF6", glyph: "C+" },
  { id: "csharp", label: "C#", monacoId: "csharp", extension: "cs", color: "#22C55E", glyph: "C#" },
  { id: "go", label: "Go", monacoId: "go", extension: "go", color: "#22C55E", glyph: "Go" },
  { id: "rust", label: "Rust", monacoId: "rust", extension: "rs", color: "#F59E0B", glyph: "Rs" },
  { id: "php", label: "PHP", monacoId: "php", extension: "php", color: "#A1A1AA", glyph: "Ph" },
  { id: "kotlin", label: "Kotlin", monacoId: "kotlin", extension: "kt", color: "#A78BFA", glyph: "Kt" },
  { id: "swift", label: "Swift", monacoId: "swift", extension: "swift", color: "#F59E0B", glyph: "Sw" },
]

export const LANGUAGE_MAP: Record<Language, LanguageMeta> = LANGUAGES.reduce(
  (acc, l) => ({ ...acc, [l.id]: l }),
  {} as Record<Language, LanguageMeta>,
)

export function languageFromExtension(name: string): Language | undefined {
  const ext = name.split(".").pop()?.toLowerCase()
  return LANGUAGES.find((l) => l.extension === ext)?.id
}
