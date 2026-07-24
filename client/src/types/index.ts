export type Language =
  | "python"
  | "java"
  | "javascript"
  | "typescript"
  | "c"
  | "cpp"
  | "csharp"
  | "go"
  | "rust"
  | "php"
  | "kotlin"
  | "swift"

export type Severity = "critical" | "high" | "medium" | "low" | "info"

export type SuggestionCategory =
  | "bug"
  | "security"
  | "performance"
  | "complexity"
  | "readability"
  | "maintainability"
  | "dead-code"
  | "duplication"
  | "convention"
  | "documentation"

export interface Suggestion {
  id: string
  category: SuggestionCategory
  severity: Severity
  title: string
  explanation: string
  whyItOccurs: string
  realWorldImpact: string
  suggestedFix: string
  optimizedCode?: string
  line?: number
  rule?: string
}

export interface ReviewScores {
  overall: number
  security: number
  performance: number
  maintainability: number
  readability: number
  documentation: number
}

export interface Review {
  id: string
  userId: string
  language: Language
  fileName?: string
  originalCode: string
  reviewedCode?: string
  scores: ReviewScores
  suggestions: Suggestion[]
  summary: string
  linesOfCode: number
  status: "completed" | "processing" | "failed"
  createdAt: string
}

export interface User {
  id: string
  googleId?: string
  name: string
  email: string
  avatar?: string
  emailVerified: boolean
  role: "user" | "admin"
  createdAt: string
  lastLoginAt?: string
  totalReviews: number
  avgScore: number
  favoriteLanguage: Language
}

export interface GoogleAuthResponse {
  user: User
  tokens: AuthTokens
  isNewUser: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
  expiresIn?: number
}

export interface GoogleOAuthConfig {
  clientId: string
  redirectUri: string
  scope: string[]
}

export interface Analytics {
  totalReviews: number
  avgScore: number
  favoriteLanguage: Language
  reviewsTrend: { date: string; count: number; avgScore: number }[]
  languageDistribution: { language: Language; count: number }[]
  scoreDistribution: { label: string; value: number }[]
  severityBreakdown: { severity: Severity; count: number }[]
  streak: number
}
