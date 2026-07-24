import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import Editor, { type OnMount } from "@monaco-editor/react"
import { toast } from "sonner"
import {
  CheckCircle2,
  FileCode2,
  Loader2,
  Play,
  Upload,
  Sparkles,
  Wand2,
  Trash2,
  ChevronDown,
} from "lucide-react"
import { PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { GradientCard } from "@/components/ui/card"
import { LANGUAGES, LANGUAGE_MAP, languageFromExtension } from "@/data/languages"
import { useTheme } from "@/context/theme-context"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { Language } from "@/types"

const PIPELINE = [
  "Language Detection",
  "Syntax Validation",
  "Static Analysis",
  "Security Scan",
  "Complexity Analysis",
  "Performance Analysis",
  "Readability Analysis",
  "AI Review Engine",
]

const SAMPLE: Record<Language, string> = {
  python: `import os

def fetch_users(db):
    password = "admin123"
    users = []
    for u in db.query("SELECT * FROM users"):
        users.append(u)
    if u["name"] == "admin" and u["pass"] == password:
        return users
    return users

def handle(req):
    eval(req.body["expr"])
    return "ok"
`,
  javascript: `const express = require("express");
const app = express();

app.get("/users", (req, res) => {
  const pass = "admin123";
  const id = req.query.id;
  db.query("SELECT * FROM users WHERE id = " + id, (rows) => {
    res.json(rows);
  });
});`,
  typescript: `function process(items: any[]) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    if (items[i] == null) continue;
    total += items[i].value;
  }
  return total;
}`,
  java: `public class UserService {
  String password = "admin123";
  public List<User> find(String name) {
    return db.query("SELECT * FROM users WHERE name = '" + name + "'");
  }
}`,
  c: `#include <stdio.h>
#include <string.h>

int main() {
  char buf[32];
  gets(buf);
  printf("Hello %s\\n", buf);
  return 0;
}`,
  cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
  int *arr = new int[100];
  for (int i = 0; i <= 100; i++) arr[i] = i;
  cout << arr[0] << endl;
  return 0;
}`,
  csharp: `public class Auth {
  private const string Password = "admin123";
  public User Login(string name) {
    return db.Query("SELECT * FROM users WHERE name = '" + name + "'");
  }
}`,
  go: `package main

import (
  "database/sql"
  "fmt"
)

func getUser(db *sql.DB, name string) {
  q := "SELECT * FROM users WHERE name = '" + name + "'"
  rows, _ := db.Query(q)
  fmt.Println(rows)
}`,
  rust: `use std::process::Command;

fn run(input: &str) {
  let _ = Command::new("sh")
    .arg("-c")
    .arg(input)
    .status();
}`,
  php: `<?php
$pass = "admin123";
$id = $_GET["id"];
$result = $db->query("SELECT * FROM users WHERE id = " . $id);
eval($_POST["expr"]);
?>`,
  kotlin: `fun fetchUser(name: String): User {
  val password = "admin123"
  return db.query("SELECT * FROM users WHERE name = '" + name + "'")
}`,
  swift: `func load(name: String) -> User {
  let password = "admin123"
  return db.query("SELECT * FROM users WHERE name = '" + name + "'")
}`,
}

export default function ReviewCodePage() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [language, setLanguage] = useState<Language>("python")
  const [code, setCode] = useState<string>(SAMPLE.python)
  const [fileName, setFileName] = useState<string | undefined>(undefined)
  const [analyzing, setAnalyzing] = useState(false)
  const [step, setStep] = useState(0)
  const [langOpen, setLangOpen] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleEditorMount: OnMount = (editor) => {
    editor.focus()
  }

  const selectLanguage = (l: Language) => {
    setLanguage(l)
    setLangOpen(false)
    setFileName(undefined)
    setCode(SAMPLE[l])
  }

  const handleFile = async (file: File) => {
    const detected = languageFromExtension(file.name)
    if (detected) setLanguage(detected)
    try {
      const { content } = await api.upload(file)
      setCode(content)
      setFileName(file.name)
      toast.success(`Loaded ${file.name}`)
    } catch {
      toast.error("Failed to read file")
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const runAnalysis = async () => {
    if (!code.trim()) {
      toast.error("Add some code to analyze first")
      return
    }
    setAnalyzing(true)
    setStep(0)
    const interval = setInterval(() => setStep((s) => Math.min(s + 1, PIPELINE.length - 1)), 170)
    try {
      const result = await api.review({ code, language, fileName })
      clearInterval(interval)
      setStep(PIPELINE.length)
      await new Promise((r) => setTimeout(r, 350))
      navigate(`/app/review/${result.id}`)
    } catch (e) {
      clearInterval(interval)
      toast.error(e instanceof Error ? e.message : "Analysis failed")
    } finally {
      setAnalyzing(false)
    }
  }

  const meta = LANGUAGE_MAP[language]
  const loc = code.split("\n").filter((l) => l.trim().length > 0).length

  return (
    <div>
      <PageHeader
        title="Review Code"
        description="Paste, upload, or pick a sample — then let the AI analyze it."
        action={
          <Button variant="gradient" onClick={runAnalysis} disabled={analyzing}>
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {analyzing ? "Analyzing…" : "Analyze Code"}
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        {/* Editor */}
        <GradientCard className="overflow-hidden p-0">
          {/* Editor toolbar */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-danger/80" />
              <span className="h-3 w-3 rounded-full bg-warning/80" />
              <span className="h-3 w-3 rounded-full bg-success/80" />
            </div>
            <span className="ml-2 truncate font-mono text-xs text-subtle">
              {fileName ?? `untitled.${meta.extension}`}
            </span>
            <span className="ml-auto flex items-center gap-3 text-xs text-subtle">
              <span>{loc} LOC</span>
              <button
                onClick={() => { setCode(SAMPLE[language]); setFileName(undefined) }}
                className="flex items-center gap-1 transition-colors hover:text-foreground"
                title="Load sample"
              >
                <Sparkles className="h-3.5 w-3.5" /> Sample
              </button>
              <button
                onClick={() => { setCode(""); setFileName(undefined) }}
                className="flex items-center gap-1 transition-colors hover:text-danger"
                title="Clear"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </span>
          </div>
          <div className="h-[480px]">
            <Editor
              height="100%"
              language={meta.monacoId}
              value={code}
              onMount={handleEditorMount}
              onChange={(v) => setCode(v ?? "")}
              theme={theme === "dark" ? "vs-dark" : "vs"}
              loading={<div className="flex h-full items-center justify-center text-sm text-subtle">Loading editor…</div>}
              options={{
                fontSize: 13,
                fontFamily: "JetBrains Mono, monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 14, bottom: 14 },
                smoothScrolling: true,
                cursorBlinking: "smooth",
                renderLineHighlight: "all",
                fontLigatures: true,
                tabSize: 2,
                automaticLayout: true,
              }}
            />
          </div>
        </GradientCard>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Language selector */}
          <GradientCard>
            <p className="mb-2 text-xs font-medium text-muted">Language</p>
            <div className="relative">
              <button
                onClick={() => setLangOpen((o) => !o)}
                className="flex w-full items-center gap-3 rounded-lg border border-border-strong bg-surface/60 px-3 py-2.5 text-sm transition-colors hover:border-primary/50"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md font-mono text-[10px] font-semibold" style={{ background: `${meta.color}22`, color: meta.color }}>
                  {meta.glyph}
                </span>
                <span className="font-medium text-foreground">{meta.label}</span>
                <ChevronDown className="ml-auto h-4 w-4 text-subtle" />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-lg border border-border-strong bg-surface p-1.5 shadow-xl"
                  >
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => selectLanguage(l.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-surface-2",
                          l.id === language && "bg-surface-2",
                        )}
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-md font-mono text-[10px] font-semibold" style={{ background: `${l.color}22`, color: l.color }}>
                          {l.glyph}
                        </span>
                        {l.label}
                        {l.id === language && <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </GradientCard>

          {/* Upload */}
          <GradientCard>
            <p className="mb-2 text-xs font-medium text-muted">Upload file</p>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-7 text-center transition-colors",
                dragging ? "border-primary bg-primary/10" : "border-border-strong hover:border-primary/50 hover:bg-surface-2/50",
              )}
            >
              <Upload className="h-6 w-6 text-subtle" />
              <p className="text-xs text-muted">
                <span className="font-medium text-foreground">Click to upload</span> or drag
              </p>
              <p className="text-[10px] text-subtle">.{meta.extension}, .js, .py, .ts, .go…</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".py,.js,.ts,.java,.c,.cpp,.cs,.go,.rs,.php,.kt,.swift,.txt"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = "" }}
            />
          </GradientCard>

          {/* Analysis pipeline */}
          <GradientCard>
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-accent" />
              <p className="text-xs font-medium text-muted">Analysis pipeline</p>
            </div>
            <ul className="mt-3 space-y-2">
              {PIPELINE.map((p, i) => {
                const done = !analyzing ? false : i < step
                const active = analyzing && i === step
                return (
                  <li key={p} className="flex items-center gap-2.5 text-xs">
                    <span className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                      done ? "border-success bg-success/15" : active ? "border-primary bg-primary/15" : "border-border",
                    )}>
                      {done ? (
                        <CheckCircle2 className="h-3 w-3 text-success" />
                      ) : active ? (
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      ) : (
                        <span className="h-1 w-1 rounded-full bg-subtle" />
                      )}
                    </span>
                    <span className={cn(done ? "text-foreground" : active ? "text-foreground" : "text-subtle")}>{p}</span>
                  </li>
                )
              })}
            </ul>
          </GradientCard>
        </div>
      </div>

      {/* Mobile analyze bar */}
      <div className="mt-4 flex justify-end lg:hidden">
        <Button variant="gradient" onClick={runAnalysis} disabled={analyzing} className="w-full">
          {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCode2 className="h-4 w-4" />}
          {analyzing ? "Analyzing…" : "Analyze Code"}
        </Button>
      </div>
    </div>
  )
}
