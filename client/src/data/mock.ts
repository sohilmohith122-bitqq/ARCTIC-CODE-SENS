import type { Analytics, Language, Review, Suggestion, User } from "@/types"
import { LANGUAGES } from "./languages"

export const MOCK_USER: User = {
  id: "u_001",
  name: "Sohil Engineer",
  email: "sohil@arcticcode.dev",
  avatar: "",
  role: "user",
  createdAt: "2026-04-12T09:00:00.000Z",
  totalReviews: 0,
  avgScore: 0,
  favoriteLanguage: "typescript",
}

const SAMPLE_CODE = `import os

def fetch_users(db):
    users = []
    for u in db.query("SELECT * FROM users"):
        users.append(u)
    password = "admin123"
    if u["name"] == "admin" and u["pass"] == password:
        return users
    return users

def handle(req):
    data = req.body
    eval(data["expr"])
    return "ok"
`

export const SAMPLE_REVIEW: Review = {
  id: "r_seed_1",
  userId: MOCK_USER.id,
  language: "python",
  fileName: "auth_service.py",
  originalCode: SAMPLE_CODE,
  reviewedCode: SAMPLE_CODE,
  scores: {
    overall: 42,
    security: 20,
    performance: 61,
    maintainability: 48,
    readability: 70,
    documentation: 10,
  },
  linesOfCode: 18,
  status: "completed",
  createdAt: "2026-07-22T14:32:00.000Z",
  summary:
    "The module contains several critical security vulnerabilities and unsafe patterns. A hardcoded credential, use of eval, and a string-built SQL query expose the application to injection and credential leakage. Refactor to parameterized queries, remove eval, and externalize secrets.",
  suggestions: [
    {
      id: "s1",
      category: "security",
      severity: "critical",
      title: "Hardcoded admin credential",
      explanation:
        "The password \"admin123\" is embedded directly in source code. Anyone with repository access can read it, and it cannot be rotated without a code change.",
      whyItOccurs:
        "Secrets are frequently inlined during prototyping for convenience, then forgotten before shipping.",
      realWorldImpact:
        "Full account takeover, credential reuse across other services, and non-repudiation loss in audits.",
      suggestedFix:
        "Load secrets from environment variables or a secrets manager and never compare plaintext passwords directly.",
      optimizedCode: `password = os.environ["ADMIN_PASSWORD"]\nif verify_hash(u["pass_hash"], password):`,
      line: 7,
      rule: "bandit/B105",
    },
    {
      id: "s2",
      category: "security",
      severity: "critical",
      title: "Use of eval on untrusted input",
      explanation:
        "eval(data[\"expr\"]) executes arbitrary code supplied by the request. This is a remote code execution vector.",
      whyItOccurs: "eval is convenient for dynamic expression evaluation but never safe on user input.",
      realWorldImpact: "Complete server compromise, data exfiltration, and lateral movement.",
      suggestedFix: "Replace eval with a safe parser/interpreter or an allowlisted dispatch table.",
      optimizedCode: `handler = DISPATCH.get(data["action"])\nif handler:\n    handler(data)`,
      line: 16,
      rule: "bandit/B307",
    },
    {
      id: "s3",
      category: "security",
      severity: "high",
      title: "Non-parameterized SQL query",
      explanation:
        "db.query(\"SELECT * FROM users\") is acceptable here, but the pattern invites string concatenation and SQL injection once filters are added.",
      whyItOccurs: "Direct string queries are the path of least resistance for quick ORM-less access.",
      realWorldImpact: "SQL injection, data leaks, and database integrity loss.",
      suggestedFix: "Use parameterized queries / prepared statements and an ORM query builder.",
      optimizedCode: `db.query("SELECT id, name FROM users WHERE tenant_id = %s", (tenant_id,))`,
      line: 4,
      rule: "pylint/W0612",
    },
    {
      id: "s4",
      category: "performance",
      severity: "medium",
      title: "Iterating rows instead of streaming",
      explanation: "Loading all users into a list can exhaust memory on large tables.",
      whyItOccurs: "Building an in-memory list feels simpler than yielding a generator.",
      realWorldImpact: "OOM crashes and slow responses on growing datasets.",
      suggestedFix: "Yield rows as a generator and paginate at the database layer.",
      optimizedCode: `def fetch_users(db):\n    yield from db.stream("SELECT * FROM users")`,
      line: 3,
      rule: "radon/complexity",
    },
    {
      id: "s5",
      category: "complexity",
      severity: "low",
      title: "Function mixes auth and fetch concerns",
      explanation: "fetch_users also performs an admin password check, violating single responsibility.",
      whyItOccurs: "Logic accretes into existing functions during fast iteration.",
      realWorldImpact: "Harder to test, reuse, and reason about; brittle to change.",
      suggestedFix: "Split into fetch_users and authenticate so each does one thing.",
      line: 2,
      rule: "radon/CC",
    },
    {
      id: "s6",
      category: "readability",
      severity: "info",
      title: "Opaque variable name `u`",
      explanation: "Single-letter names hurt comprehension in larger scopes.",
      whyItOccurs: "Brevity is favored during quick scripting.",
      realWorldImpact: "Slower onboarding and more review back-and-forth.",
      suggestedFix: "Rename to a descriptive noun such as `user`.",
      optimizedCode: `for user in db.query("SELECT * FROM users"):\n    users.append(user)`,
      line: 3,
      rule: "pep8/naming",
    },
    {
      id: "s7",
      category: "documentation",
      severity: "low",
      title: "Missing docstrings and type hints",
      explanation: "Public functions have no docstring or type annotations.",
      whyItOccurs: "Docs are deferred when behavior is still changing.",
      realWorldImpact: "Poor IDE support and weaker static analysis.",
      suggestedFix: "Add docstrings and type hints to public functions.",
      optimizedCode: `def fetch_users(db: Database) -> list[User]:\n    """Return all users from the database."""`,
      line: 2,
      rule: "pydocstyle",
    },
  ],
}

export const MOCK_REVIEWS: Review[] = [
  SAMPLE_REVIEW,
  {
    id: "r_seed_2",
    userId: MOCK_USER.id,
    language: "typescript",
    fileName: "cart.service.ts",
    originalCode: "export class Cart { add(i){ this.items.push(i) } }",
    scores: { overall: 88, security: 90, performance: 84, maintainability: 86, readability: 92, documentation: 80 },
    summary: "Clean cart service with minor immutability and typing gaps.",
    suggestions: [],
    linesOfCode: 4,
    status: "completed",
    createdAt: "2026-07-21T10:14:00.000Z",
  },
  {
    id: "r_seed_3",
    userId: MOCK_USER.id,
    language: "javascript",
    fileName: "utils.js",
    originalCode: "module.exports = { x: () => 1 }",
    scores: { overall: 71, security: 75, performance: 70, maintainability: 68, readability: 74, documentation: 40 },
    summary: "Working utilities module; lacks tests and docs.",
    suggestions: [],
    linesOfCode: 12,
    status: "completed",
    createdAt: "2026-07-18T16:45:00.000Z",
  },
  {
    id: "r_seed_4",
    userId: MOCK_USER.id,
    language: "go",
    fileName: "server.go",
    originalCode: "package main",
    scores: { overall: 94, security: 95, performance: 96, maintainability: 92, readability: 93, documentation: 85 },
    summary: "Idiomatic Go server with excellent error handling.",
    suggestions: [],
    linesOfCode: 220,
    status: "completed",
    createdAt: "2026-07-15T08:20:00.000Z",
  },
  {
    id: "r_seed_5",
    userId: MOCK_USER.id,
    language: "python",
    fileName: "ml_pipeline.py",
    originalCode: "import pandas as pd",
    scores: { overall: 66, security: 80, performance: 50, maintainability: 60, readability: 78, documentation: 55 },
    summary: "ML pipeline works but loads full dataset in memory.",
    suggestions: [],
    linesOfCode: 340,
    status: "completed",
    createdAt: "2026-07-10T12:00:00.000Z",
  },
]

export const MOCK_ANALYTICS: Analytics = {
  totalReviews: 128,
  avgScore: 82,
  favoriteLanguage: "typescript",
  streak: 12,
  reviewsTrend: [
    { date: "Mon", count: 4, avgScore: 78 },
    { date: "Tue", count: 7, avgScore: 81 },
    { date: "Wed", count: 5, avgScore: 84 },
    { date: "Thu", count: 9, avgScore: 80 },
    { date: "Fri", count: 12, avgScore: 85 },
    { date: "Sat", count: 6, avgScore: 83 },
    { date: "Sun", count: 3, avgScore: 88 },
  ],
  languageDistribution: [
    { language: "typescript", count: 52 },
    { language: "python", count: 38 },
    { language: "javascript", count: 21 },
    { language: "go", count: 10 },
    { language: "rust", count: 7 },
  ],
  scoreDistribution: [
    { label: "Security", value: 84 },
    { label: "Performance", value: 76 },
    { label: "Maintainability", value: 82 },
    { label: "Readability", value: 88 },
    { label: "Documentation", value: 64 },
  ],
  severityBreakdown: [
    { severity: "critical", count: 6 },
    { severity: "high", count: 14 },
    { severity: "medium", count: 31 },
    { severity: "low", count: 42 },
    { severity: "info", count: 23 },
  ],
}

/** Lightweight heuristic analyzer that mimics the AI review engine. */
export function analyzeCode(code: string, language: Language, userId?: string): Review {
  const lines = code.split("\n")
  const loc = lines.filter((l) => l.trim().length > 0).length
  const suggestions: Suggestion[] = []

  const add = (s: Omit<Suggestion, "id">) => suggestions.push({ id: `s${suggestions.length + 1}`, ...s })

  const text = code.toLowerCase()

  if (/(password|secret|api[_-]?key|token)\s*[:=]\s*["'][^"']+["']/i.test(code)) {
    add({
      category: "security",
      severity: "critical",
      title: "Hardcoded secret detected",
      explanation: "A credential-like literal is assigned in source. Secrets must never live in code.",
      whyItOccurs: "Inlining secrets is convenient during local development.",
      realWorldImpact: "Credential leaks via version control and logs enable full system compromise.",
      suggestedFix: "Read from environment variables or a secrets manager.",
      optimizedCode: `const secret = process.env.SECRET_KEY`,
      line: code.split("\n").findIndex((l) => /password|secret|api/i.test(l)) + 1,
      rule: "gitleaks",
    })
  }

  if (/\beval\s*\(/.test(code)) {
    add({
      category: "security",
      severity: "critical",
      title: "Unsafe eval() usage",
      explanation: "eval executes arbitrary code and is a remote code execution vector.",
      whyItOccurs: "eval is used for dynamic expressions or deserialization shortcuts.",
      realWorldImpact: "Full server compromise and data exfiltration.",
      suggestedFix: "Replace with a safe parser or allowlisted dispatch.",
      optimizedCode: `const handler = dispatch[action]; if (handler) handler(data);`,
      line: code.split("\n").findIndex((l) => /\beval\s*\(/.test(l)) + 1,
      rule: "eslint/no-eval",
    })
  }

  if (/(SELECT|INSERT|UPDATE|DELETE)\s.+from\s.+\$\{|SELECT.+%s|"\s*\+\s*\w+/.test(text) && /query|execute|sql/.test(text)) {
    add({
      category: "security",
      severity: "high",
      title: "Potential SQL injection",
      explanation: "A query appears to be built via interpolation or concatenation.",
      whyItOccurs: "String-built queries are quick but unsafe.",
      realWorldImpact: "SQL injection leads to data leaks and integrity loss.",
      suggestedFix: "Use parameterized queries / prepared statements.",
      optimizedCode: `db.query("SELECT * FROM users WHERE id = ?", [id])`,
      rule: "bandit/B608",
    })
  }

  if (/\bvar\b/.test(code) && (language === "javascript" || language === "typescript")) {
    add({
      category: "convention",
      severity: "low",
      title: "Prefer let/const over var",
      explanation: "var is function-scoped and hoisted, leading to subtle bugs.",
      whyItOccurs: "Legacy code or habit from pre-ES6 style.",
      realWorldImpact: "Unexpected hoisting and scope leaks.",
      suggestedFix: "Use const by default and let only when reassignment is needed.",
      optimizedCode: `const count = 0;`,
      rule: "eslint/no-var",
    })
  }

  if (/\b(any|void|object)\b/.test(code) && language === "typescript") {
    add({
      category: "maintainability",
      severity: "medium",
      title: "Weakly typed usage of any/void",
      explanation: "Using any disables type safety and erodes the value of TypeScript.",
      whyItOccurs: "Quick prototyping or migrating from JS.",
      realWorldImpact: "Runtime errors the compiler can no longer catch.",
      suggestedFix: "Replace with precise types or generics.",
      optimizedCode: `type User = { id: string; name: string }`,
      rule: "@typescript-eslint/no-explicit-any",
    })
  }

  if (/\b(==|!=)\b/.test(code) && language !== "python") {
    add({
      category: "bug",
      severity: "medium",
      title: "Loose equality comparison",
      explanation: "== performs type coercion and can produce surprising results.",
      whyItOccurs: "Habit carried over from loosely typed languages.",
      realWorldImpact: "Hidden bugs such as 0 == \"\" returning true.",
      suggestedFix: "Use strict equality === and !==.",
      optimizedCode: `if (a === b) { ... }`,
      rule: "eslint/eqeqeq",
    })
  }

  if (/\b(console\.log|print|fmt\.Println)\b/.test(code)) {
    add({
      category: "dead-code",
      severity: "info",
      title: "Debug print statement left in",
      explanation: "Logging statements may leak data in production.",
      whyItOccurs: "Debugging output that was not removed before commit.",
      realWorldImpact: "Noisy logs and potential sensitive data exposure.",
      suggestedFix: "Remove or gate behind a debug logger.",
      optimizedCode: `if (import.meta.env.DEV) console.log(value);`,
      rule: "no-console",
    })
  }

  // Detect undefined variable usage (NameError)
  const printMatches = code.match(/print\s*\(([^)]+)\)/g) || []
  const consoleMatches = code.match(/console\.(log|error|warn)\s*\(([^)]+)\)/g) || []
  const allMatches = [...printMatches, ...consoleMatches]
  
  allMatches.forEach((match) => {
    const varMatch = match.match(/\(([^)]+)\)/)
    if (varMatch) {
      const varName = varMatch[1].trim()
      // Check if variable is defined
      const varPattern = new RegExp(`\\b${varName}\\s*=|def\\s+${varName}|${varName}\\s*=`)
      if (!varPattern.test(code) && !/['"]/.test(varName)) {
        const lineNum = code.split('\n').findIndex(l => l.includes(match)) + 1
        add({
          category: "bug",
          severity: "critical",
          title: `NameError: name '${varName}' is not defined`,
          explanation: `The variable '${varName}' is used but never defined or assigned in this code.`,
          whyItOccurs: "Variable is referenced before being declared or assigned a value.",
          realWorldImpact: "Runtime error that will crash the program when this line executes.",
          suggestedFix: `Define '${varName}' before using it. Example: ${varName} = "value"`,
          optimizedCode: `${varName} = "value"  # Define before use\nprint(${varName})`,
          line: lineNum,
          rule: "python/undefined-variable",
        })
      }
    }
  })

  if (loc > 0 && (code.match(/^\s*#/gm) || []).length + (code.match(/\/\//g) || []).length < Math.ceil(loc / 8)) {
    add({
      category: "documentation",
      severity: "low",
      title: "Low comment density",
      explanation: "Few comments make intent hard to recover later.",
      whyItOccurs: "Docs are deferred until behavior stabilizes.",
      realWorldImpact: "Slower maintenance and onboarding.",
      suggestedFix: "Document public functions and non-obvious logic.",
      rule: "comment-ratio",
    })
  }

  if (loc > 200) {
    add({
      category: "complexity",
      severity: "medium",
      title: "Large file — consider splitting",
      explanation: `This file has ${loc} non-blank lines, which is hard to navigate and test.`,
      whyItOccurs: "Features accrete into a single file over time.",
      realWorldImpact: "Slower reviews, merge conflicts, and testing gaps.",
      suggestedFix: "Split by responsibility into focused modules.",
      rule: "file-length",
    })
  }

  if (/\bfor\s*\([^)]*;[^)]*;[^)]*\)\s*\{[\s\S]{300,}?\}/.test(code)) {
    add({
      category: "performance",
      severity: "medium",
      title: "Potential O(n²) nested loop",
      explanation: "Nested iteration over collections can scale poorly.",
      whyItOccurs: "Straightforward nested loops are written first.",
      realWorldImpact: "Quadratic slowdowns on growing inputs.",
      suggestedFix: "Use a Map/Set for O(1) lookups.",
      optimizedCode: `const seen = new Set();`,
      rule: "perf/nested-loop",
    })
  }

  if (suggestions.length === 0) {
    add({
      category: "readability",
      severity: "info",
      title: "No major issues detected",
      explanation: "The analyzer found no high-confidence issues in this snippet.",
      whyItOccurs: "Code follows common conventions.",
      realWorldImpact: "Low risk for this submission.",
      suggestedFix: "Keep it up — consider adding tests and docs.",
      rule: "clean",
    })
  }

  const weights = { critical: 25, high: 14, medium: 7, low: 3, info: 1 } as const
  const penalty = suggestions.reduce((sum, s) => sum + weights[s.severity], 0)
  const base = 100
  const overall = Math.max(10, base - penalty)
  const security = Math.max(10, 100 - suggestions.filter((s) => s.category === "security").reduce((n, s) => n + weights[s.severity] * 2, 0))
  const performance = Math.max(10, 100 - suggestions.filter((s) => s.category === "performance").reduce((n, s) => n + weights[s.severity], 0) - 8)
  const maintainability = Math.max(10, 100 - suggestions.filter((s) => ["complexity", "maintainability", "duplication", "dead-code"].includes(s.category)).reduce((n, s) => n + weights[s.severity], 0))
  const readability = Math.max(10, 100 - suggestions.filter((s) => s.category === "readability").reduce((n, s) => n + weights[s.severity], 0) - 5)
  const documentation = Math.max(10, 100 - suggestions.filter((s) => s.category === "documentation").reduce((n, s) => n + weights[s.severity] * 1.5, 0) - 12)

  const langs = LANGUAGES.find((l) => l.id === language)
  void langs

  return {
    id: `r_${Math.random().toString(36).slice(2, 10)}`,
    userId: userId ?? MOCK_USER.id,
    language,
    originalCode: code,
    reviewedCode: code,
    scores: {
      overall,
      security,
      performance,
      maintainability,
      readability,
      documentation,
    },
    suggestions,
    summary:
      suggestions.length === 0 || (suggestions.length === 1 && suggestions[0].rule === "clean")
        ? "Code looks clean. No high-confidence issues were detected. Consider adding tests and documentation."
        : `Analysis found ${suggestions.length} issue${suggestions.length === 1 ? "" : "s"} across security, performance, and maintainability. Address critical items first.`,
    linesOfCode: loc,
    status: "completed",
    createdAt: new Date().toISOString(),
  }
}
