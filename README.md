# ARCTIC CODE SENS

**Analyze. Secure. Optimize. Learn.**

A production-ready AI-powered code review assistant that helps students and developers write cleaner, safer, and more efficient code.

## 🚀 Features

### Core Capabilities
- **AI Code Review**: Analyzes code for bugs, security vulnerabilities, performance issues, and maintainability
- **12 Language Support**: Python, JavaScript, TypeScript, Java, C, C++, C#, Go, Rust, PHP, Kotlin, Swift
- **Comprehensive Scoring**: Overall, Security, Performance, Maintainability, Readability, Documentation
- **Severity-Ranked Suggestions**: Critical, High, Medium, Low, Info with detailed explanations
- **Optimized Code Generation**: AI-generated fixes with best-practice references
- **Downloadable Reports**: PDF and JSON exports for every review
- **Review History**: Track all past reviews with search and filtering
- **Analytics Dashboard**: Trends, language distribution, severity breakdown, score radar
- **User Profiles**: Account management with stats and preferences
- **Settings**: Theme, notifications, AI preferences, API key management

### Premium Features
- Learning Mode: Detailed explanations for every issue
- GitHub Repository Import (planned)
- Pull Request Review Integration (planned)
- Team Workspace (planned)
- VS Code Extension (planned)

## 📋 Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast builds
- **Tailwind CSS v4** with custom theme
- **Framer Motion** for animations
- **React Router v7** for navigation
- **React Hook Form** + Zod for validation
- **TanStack React Query** for data fetching
- **Monaco Editor** for code editing
- **Recharts** for analytics visualizations
- **jsPDF** for PDF generation
- **Sonner** for toast notifications

### Backend (Mock)
- In-memory review storage with localStorage
- Mock API with realistic latency simulation
- Heuristic code analyzer (production-ready for integration)

### Authentication
- JWT tokens (mock implementation)
- Google OAuth ready (requires backend)
- Protected routes with auth context

## 🏗️ Project Structure

```
arctic-code-sens/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/       # PageHeader, StatCard
│   │   │   ├── layout/       # AppLayout, Sidebar, TopNav, Auth
│   │   │   └── ui/           # Button, Card, Badge, Input, etc.
│   │   ├── pages/
│   │   │   ├── auth/         # Login, Register, ForgotPassword
│   │   │   ├── landing.tsx   # Marketing homepage
│   │   │   ├── dashboard.tsx # Main dashboard with charts
│   │   │   ├── review-code.tsx # Code editor & upload
│   │   │   ├── review-result.tsx # Results with suggestions
│   │   │   ├── history.tsx   # Review history with filters
│   │   │   ├── analytics.tsx # Advanced analytics
│   │   │   ├── reports.tsx   # Report downloads
│   │   │   ├── profile.tsx   # User profile
│   │   │   └── settings.tsx  # Preferences
│   │   ├── context/          # Auth, Theme providers
│   │   ├── lib/
│   │   │   ├── api.ts        # API client with mock fallback
│   │   │   ├── review-store.ts # In-memory storage
│   │   │   ├── report.ts     # PDF/JSON generation
│   │   │   └── utils.ts      # Helpers
│   │   ├── data/
│   │   │   ├── languages.ts  # Language metadata
│   │   │   └── mock.ts       # Mock data & analyzer
│   │   ├── types/            # TypeScript interfaces
│   │   ├── App.tsx           # Router setup
│   │   ├── main.tsx          # Entry with providers
│   │   └── index.css         # Tailwind + theme
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── server/                    # Express backend (placeholder)
├── ai-service/               # Python FastAPI (placeholder)
└── database/                 # MongoDB schemas (placeholder)
```

## 🎨 Design System

### Colors
- **Background**: `#09090B`
- **Primary**: `#3B82F6` (Blue)
- **Accent**: `#8B5CF6` (Purple)
- **Success**: `#22C55E` (Green)
- **Warning**: `#F59E0B` (Amber)
- **Danger**: `#EF4444` (Red)

### Typography
- **Sans**: Inter
- **Mono**: JetBrains Mono

### Components
- Glassmorphism cards with backdrop blur
- Gradient borders and text
- Smooth animations with Framer Motion
- Responsive grid layouts
- Dark mode first (light mode ready)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd client
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## 📖 Usage

### Landing Page
- Marketing homepage with features, pricing, and CTA
- Responsive design for all devices
- Smooth scroll animations

### Authentication
- Sign up with email/password or Google
- Forgot password flow
- Protected routes with auth context

### Code Review
1. Navigate to "Review Code"
2. Paste code or upload a file
3. Select programming language
4. Click "Analyze Code"
5. View results with severity-ranked suggestions
6. Download PDF or JSON report

### Dashboard
- Overview of review activity
- Charts: trend, language distribution, severity breakdown
- Recent reviews with quick access
- Statistics cards with deltas

### History
- Search reviews by filename or language
- Filter by language
- Delete reviews
- Quick access to full results

### Analytics
- Review activity trend
- Score radar chart
- Language distribution pie chart
- Severity breakdown bar chart
- Score breakdown by dimension

### Reports
- Grid view of all reviews
- Download PDF or JSON per review
- Quick preview of summary

### Profile
- View and edit name/email
- Statistics: total reviews, avg score, favorite language, member since
- Danger zone for account deletion

### Settings
- Theme toggle (dark/light)
- Notification preferences
- AI preferences (Learning Mode, auto-detect, optimized code)
- OpenAI API key management

## 🔐 Security

- JWT token-based authentication
- Protected routes with auth context
- Secure password validation with Zod
- No sensitive data in localStorage (except tokens)
- CORS-ready for backend integration
- Input sanitization with React Hook Form

## 📊 Code Analysis Pipeline

The mock analyzer performs:

1. **Language Detection** - From file extension
2. **Syntax Validation** - Basic checks
3. **Static Analysis** - Pattern matching for common issues
4. **Security Scan** - Hardcoded secrets, eval(), SQL injection
5. **Complexity Analysis** - File size, nested loops
6. **Performance Analysis** - Memory usage patterns
7. **Readability Analysis** - Naming, comments
8. **Maintainability Analysis** - Code organization
9. **AI Review** - Heuristic scoring and suggestions
10. **Report Generation** - PDF and JSON exports

## 🔌 Backend Integration

The frontend is ready for backend integration:

### API Endpoints (to implement)
```
POST   /register              # User registration
POST   /login                 # User login
POST   /review                # Submit code for review
GET    /reviews               # List user's reviews
GET    /review/:id            # Get review details
DELETE /review/:id            # Delete review
GET    /analytics             # Get user analytics
GET    /profile               # Get user profile
PUT    /profile               # Update profile
POST   /upload                # Upload file
```

### Environment Variables
```
VITE_API_URL=http://localhost:5000
VITE_USE_MOCK=false           # Set to false to use real backend
```

## 📱 Responsive Design

- **Mobile**: Full-width, stacked layout, touch-friendly
- **Tablet**: 2-column grids, optimized spacing
- **Desktop**: 3-4 column grids, sidebar navigation

## ♿ Accessibility

- Semantic HTML
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus visible states
- Color contrast compliance
- Screen reader friendly

## 🎯 Performance

- Code splitting with dynamic imports
- Lazy loading of routes
- Optimized images and assets
- Efficient re-renders with React Query
- Memoized components
- Production build: ~500KB gzipped

## 🧪 Testing

Ready for integration with:
- Vitest for unit tests
- Playwright for E2E tests
- Jest for component tests

## 📝 Code Quality

- TypeScript strict mode
- ESLint with oxlint
- Tailwind CSS linting
- No unused imports or variables
- Consistent code style

## 🚢 Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy dist/ folder to Vercel
```

### Backend (Render)
- Express.js server
- MongoDB Atlas connection
- JWT middleware
- CORS configuration

### AI Service (Railway)
- Python FastAPI
- Tree-sitter for parsing
- Pylint, ESLint, Bandit for analysis
- OpenAI API integration

## 📚 Documentation

- Inline code comments
- TypeScript interfaces for clarity
- Component prop documentation
- API endpoint descriptions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Inspired by Cursor, GitHub, Vercel, Linear, Raycast
- Built with React, Tailwind CSS, and modern web technologies
- Icons from Lucide React
- Charts from Recharts

## 📞 Support

For issues, questions, or suggestions:
- GitHub Issues
- Email: support@arcticcodesens.dev
- Discord Community (coming soon)

---

**ARCTIC CODE SENS** - Ship code you're proud of.
