import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connectDatabase } from './db';
import paymentRouter from './payment';
import authRoutes from './oauth';
import adminRoutes from './admin';
import { verifyToken } from './auth';
import { User, Review } from './models';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors({
  origin: (origin, callback) => callback(null, true), // allow all origins
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));

// Attach userId from token to every request
app.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      (req as any).userId = decoded.userId;
      (req as any).role = decoded.role;
    }
  }
  next();
});

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/payment', paymentRouter);

// ── Auth middleware ──────────────────────────────────────────────────────────
const auth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).userId = decoded.userId;
    next();
  } catch {
    res.status(403).json({ message: 'Invalid token' });
  }
};

const generateTokens = (userId: string, role = 'user') => {
  const accessToken = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// ── Register ─────────────────────────────────────────────────────────────────
app.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const userId = `u_${Date.now()}`;
    const user = await User.create({
      id: userId, email, password: hashed, fullName: name,
      emailVerified: false, createdAt: new Date(), lastLoginAt: new Date(),
    });

    const { accessToken, refreshToken } = generateTokens(userId);
    res.json({
      user: { id: userId, email, name, role: 'user', emailVerified: false, createdAt: user.createdAt, totalReviews: 0, avgScore: 0 },
      accessToken, refreshToken,
    });
  } catch (e: any) {
    res.status(500).json({ message: e.message || 'Registration failed' });
  }
});

// ── Login ─────────────────────────────────────────────────────────────────────
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    user.lastLoginAt = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    const reviews = await Review.find({ userId: user.id });
    const totalReviews = reviews.length;
    const avgScore = totalReviews > 0 ? Math.round(reviews.reduce((s, r) => s + (r.score?.overall || 0), 0) / totalReviews) : 0;

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    res.json({
      user: { id: user.id, email: user.email, name: user.fullName, role: user.role, emailVerified: user.emailVerified, createdAt: user.createdAt, totalReviews, avgScore },
      accessToken, refreshToken,
    });
  } catch (e: any) {
    res.status(500).json({ message: e.message || 'Login failed' });
  }
});

// ── Validate session ──────────────────────────────────────────────────────────
app.get('/auth/validate', auth, async (req, res) => {
  const user = await User.findOne({ id: (req as any).userId });
  if (!user) return res.status(404).json({ message: 'User not found' });
  const reviews = await Review.find({ userId: user.id });
  const totalReviews = reviews.length;
  const avgScore = totalReviews > 0 ? Math.round(reviews.reduce((s, r) => s + (r.score?.overall || 0), 0) / totalReviews) : 0;
  res.json({ id: user.id, email: user.email, name: user.fullName, role: user.role, emailVerified: user.emailVerified, createdAt: user.createdAt, totalReviews, avgScore });
});

// ── Profile ───────────────────────────────────────────────────────────────────
app.get('/auth/profile', auth, async (req, res) => {
  const user = await User.findOne({ id: (req as any).userId });
  if (!user) return res.status(404).json({ message: 'User not found' });
  const reviews = await Review.find({ userId: user.id });
  const totalReviews = reviews.length;
  const avgScore = totalReviews > 0 ? Math.round(reviews.reduce((s, r) => s + (r.score?.overall || 0), 0) / totalReviews) : 0;
  const langCount: Record<string, number> = {};
  reviews.forEach(r => { langCount[r.language] = (langCount[r.language] || 0) + 1; });
  const favoriteLanguage = Object.entries(langCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'python';
  res.json({ id: user.id, email: user.email, name: user.fullName, role: user.role, emailVerified: user.emailVerified, createdAt: user.createdAt, totalReviews, avgScore, favoriteLanguage });
});

app.put('/auth/profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findOne({ id: (req as any).userId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (name) user.fullName = name;
    if (email && email !== user.email) {
      if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already in use' });
      user.email = email;
    }
    await user.save();
    res.json({ id: user.id, email: user.email, name: user.fullName, role: user.role });
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
});

// ── Review ────────────────────────────────────────────────────────────────────
app.post('/review', auth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { code, language, fileName } = req.body;

    // Run the same heuristic analyzer logic (mirrors client/src/data/mock.ts analyzeCode)
    const suggestions: any[] = [];
    const add = (s: any) => suggestions.push({ id: `s${suggestions.length + 1}`, ...s });

    if (/(password|secret|api[_-]?key|token)\s*[:=]\s*["'][^"']+["']/i.test(code))
      add({ category: 'security', severity: 'critical', title: 'Hardcoded secret detected', explanation: 'A credential-like literal is assigned in source.', suggestedFix: 'Read from environment variables.', rule: 'gitleaks' });

    if (/\beval\s*\(/.test(code))
      add({ category: 'security', severity: 'critical', title: 'Unsafe eval() usage', explanation: 'eval executes arbitrary code.', suggestedFix: 'Replace with safe parser.', rule: 'no-eval' });

    if (/\bvar\b/.test(code) && ['javascript', 'typescript'].includes(language))
      add({ category: 'convention', severity: 'low', title: 'Prefer let/const over var', explanation: 'var is function-scoped and hoisted.', suggestedFix: 'Use const/let.', rule: 'no-var' });

    if (/\b(==|!=)\b/.test(code) && language !== 'python')
      add({ category: 'bug', severity: 'medium', title: 'Loose equality comparison', explanation: '== performs type coercion.', suggestedFix: 'Use === and !==.', rule: 'eqeqeq' });

    if (/\b(console\.log|print|fmt\.Println)\b/.test(code))
      add({ category: 'dead-code', severity: 'info', title: 'Debug print statement left in', explanation: 'Logging may leak data in production.', suggestedFix: 'Remove or gate behind debug flag.', rule: 'no-console' });

    const loc = code.split('\n').filter((l: string) => l.trim().length > 0).length;
    if (loc > 200)
      add({ category: 'complexity', severity: 'medium', title: 'Large file — consider splitting', explanation: `${loc} non-blank lines.`, suggestedFix: 'Split by responsibility.', rule: 'file-length' });

    if (suggestions.length === 0)
      add({ category: 'readability', severity: 'info', title: 'No major issues detected', explanation: 'No high-confidence issues found.', suggestedFix: 'Add tests and docs.', rule: 'clean' });

    const weights: Record<string, number> = { critical: 25, high: 14, medium: 7, low: 3, info: 1 };
    const penalty = suggestions.reduce((s: number, sg: any) => s + weights[sg.severity], 0);
    const overall = Math.max(10, 100 - penalty);
    const security = Math.max(10, 100 - suggestions.filter((s: any) => s.category === 'security').reduce((n: number, s: any) => n + weights[s.severity] * 2, 0));
    const performance = Math.max(10, 92 - suggestions.filter((s: any) => s.category === 'performance').reduce((n: number, s: any) => n + weights[s.severity], 0));
    const maintainability = Math.max(10, 100 - suggestions.filter((s: any) => ['complexity', 'maintainability'].includes(s.category)).reduce((n: number, s: any) => n + weights[s.severity], 0));
    const readability = Math.max(10, 95 - suggestions.filter((s: any) => s.category === 'readability').reduce((n: number, s: any) => n + weights[s.severity], 0));
    const documentation = Math.max(10, 88 - suggestions.filter((s: any) => s.category === 'documentation').reduce((n: number, s: any) => n + weights[s.severity] * 1.5, 0));

    const reviewId = `r_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const review = await Review.create({
      id: reviewId, userId, filename: fileName || 'snippet', language,
      code,
      score: { overall, security, performance, maintainability, readability, documentation },
      issues: suggestions,
      createdAt: new Date(),
    });

    res.json({
      id: review.id, userId, language, fileName: review.filename,
      originalCode: code, reviewedCode: code,
      scores: review.score,
      suggestions,
      summary: suggestions.length <= 1 && suggestions[0]?.rule === 'clean'
        ? 'Code looks clean. No high-confidence issues detected.'
        : `Analysis found ${suggestions.length} issue${suggestions.length === 1 ? '' : 's'}.`,
      linesOfCode: loc,
      status: 'completed',
      createdAt: review.createdAt,
    });
  } catch (e: any) {
    res.status(500).json({ message: e.message || 'Review failed' });
  }
});

// ── Reviews list ──────────────────────────────────────────────────────────────
app.get('/reviews', auth, async (req, res) => {
  const reviews = await Review.find({ userId: (req as any).userId }).sort({ createdAt: -1 });
  res.json(reviews.map(r => ({
    id: r.id, userId: r.userId, language: r.language, fileName: r.filename,
    originalCode: r.code, reviewedCode: r.code,
    scores: r.score, suggestions: r.issues,
    linesOfCode: r.code.split('\n').filter((l: string) => l.trim()).length,
    status: 'completed', createdAt: r.createdAt,
    summary: `${r.issues.length} issue${r.issues.length === 1 ? '' : 's'} found.`,
  })));
});

// ── Single review ─────────────────────────────────────────────────────────────
app.get('/review/:id', auth, async (req, res) => {
  const review = await Review.findOne({ id: req.params.id, userId: (req as any).userId });
  if (!review) return res.status(404).json({ message: 'Review not found' });
  res.json({
    id: review.id, userId: review.userId, language: review.language, fileName: review.filename,
    originalCode: review.code, reviewedCode: review.code,
    scores: review.score, suggestions: review.issues,
    linesOfCode: review.code.split('\n').filter((l: string) => l.trim()).length,
    status: 'completed', createdAt: review.createdAt,
    summary: `${review.issues.length} issue${review.issues.length === 1 ? '' : 's'} found.`,
  });
});

// ── Delete review ─────────────────────────────────────────────────────────────
app.delete('/review/:id', auth, async (req, res) => {
  const review = await Review.findOne({ id: req.params.id, userId: (req as any).userId });
  if (!review) return res.status(404).json({ message: 'Review not found' });
  await review.deleteOne();
  res.json({ success: true });
});

// ── Analytics ─────────────────────────────────────────────────────────────────
app.get('/analytics', auth, async (req, res) => {
  const reviews = await Review.find({ userId: (req as any).userId }).sort({ createdAt: 1 });
  if (reviews.length === 0) {
    return res.json({ totalReviews: 0, avgScore: 0, favoriteLanguage: 'python', streak: 0, reviewsTrend: [], languageDistribution: [], scoreDistribution: [], severityBreakdown: [] });
  }
  const avgScore = Math.round(reviews.reduce((s, r) => s + (r.score?.overall || 0), 0) / reviews.length);
  const langCount: Record<string, number> = {};
  reviews.forEach(r => { langCount[r.language] = (langCount[r.language] || 0) + 1; });
  const favoriteLanguage = Object.entries(langCount).sort((a, b) => b[1] - a[1])[0][0];
  const sevCount: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  reviews.forEach(r => r.issues.forEach((s: any) => { sevCount[s.severity] = (sevCount[s.severity] || 0) + 1; }));
  const scoreFields = ['security', 'performance', 'maintainability', 'readability', 'documentation'] as const;
  const scoreDistribution = scoreFields.map(f => ({
    label: f.charAt(0).toUpperCase() + f.slice(1),
    value: Math.round(reviews.reduce((s, r) => s + ((r.score as any)?.[f] || 0), 0) / reviews.length),
  }));
  const trend = reviews.slice(-7).map(r => ({
    date: new Date(r.createdAt).toLocaleDateString('en', { weekday: 'short' }),
    count: 1,
    avgScore: r.score?.overall || 0,
  }));
  res.json({
    totalReviews: reviews.length, avgScore, favoriteLanguage, streak: reviews.length,
    reviewsTrend: trend,
    languageDistribution: Object.entries(langCount).map(([language, count]) => ({ language, count })),
    scoreDistribution,
    severityBreakdown: Object.entries(sevCount).filter(([, c]) => c > 0).map(([severity, count]) => ({ severity, count })),
  });
});

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── Start ─────────────────────────────────────────────────────────────────────
(async () => {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})();
