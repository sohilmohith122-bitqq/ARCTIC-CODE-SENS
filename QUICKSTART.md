# ARCTIC CODE SENS - QUICK START GUIDE

## 🚀 Get Running in 2 Minutes

### Step 1: Install Dependencies
```bash
cd client
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

The app opens at **http://localhost:5173**

---

## 🎯 Demo Credentials

### Test Account
- **Email**: demo@arcticcode.dev
- **Password**: demo123456

Or create a new account on the registration page.

---

## 📖 Quick Navigation

### Landing Page
- Visit `http://localhost:5173`
- See features, pricing, and how it works
- Click "Get Started" to register

### Authentication
- **Sign Up**: `/register`
- **Sign In**: `/login`
- **Forgot Password**: `/forgot-password`

### Main App (after login)
- **Dashboard**: `/app/dashboard` - Overview and stats
- **Review Code**: `/app/review` - Paste or upload code
- **History**: `/app/history` - View past reviews
- **Analytics**: `/app/analytics` - Advanced insights
- **Reports**: `/app/reports` - Download PDF/JSON
- **Profile**: `/app/profile` - Account settings
- **Settings**: `/app/settings` - Preferences

---

## 🧪 Try the Code Review

1. Go to `/app/review`
2. Select a language (Python, JavaScript, etc.)
3. Paste code or click "Sample" to load example
4. Click "Analyze Code"
5. View results with suggestions
6. Download PDF or JSON report

### Sample Code (Auto-loaded)
The app includes vulnerable code samples for each language:
- Hardcoded secrets
- Unsafe eval()
- SQL injection risks
- Performance issues
- Code smells

---

## 🎨 Theme Toggle

Click the moon/sun icon in the top nav to switch between dark and light modes.

---

## 📊 Explore Features

### Dashboard
- View 7-day activity trend
- See language distribution
- Check severity breakdown
- Review recent submissions

### Analytics
- Advanced charts and visualizations
- Score radar chart
- Language statistics
- Severity analysis

### Reports
- Download PDF reports with full analysis
- Export JSON for programmatic access
- View summaries and scores

---

## 🔧 Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npx tsc --noEmit

# Lint code
npm run lint
```

---

## 📁 Project Structure

```
client/
├── src/
│   ├── pages/          # 11 pages
│   ├── components/     # 30+ components
│   ├── context/        # Auth & Theme
│   ├── lib/            # API, utils, storage
│   ├── data/           # Mock data, languages
│   ├── types/          # TypeScript interfaces
│   ├── App.tsx         # Router
│   ├── main.tsx        # Entry point
│   └── index.css       # Tailwind + theme
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 🌐 Environment Variables

Create `.env.local` (optional):

```env
# Use real backend (default: mock)
VITE_API_URL=http://localhost:5000
VITE_USE_MOCK=false
```

---

## 🎯 Key Features to Try

### 1. Code Review
- Upload a file or paste code
- Get AI-powered analysis
- See severity-ranked suggestions
- Download reports

### 2. Dashboard
- View activity trends
- Check language distribution
- See severity breakdown
- Access recent reviews

### 3. Analytics
- Advanced visualizations
- Score radar chart
- Language statistics
- Trend analysis

### 4. Reports
- Download PDF reports
- Export JSON data
- View summaries

### 5. Settings
- Toggle dark/light mode
- Manage notifications
- Configure AI preferences
- Add OpenAI API key

---

## 🔐 Authentication

### Mock Mode (Default)
- No backend required
- Instant login/register
- Data stored in localStorage
- Perfect for demo/testing

### Real Backend (When Ready)
Set `VITE_USE_MOCK=false` and provide `VITE_API_URL`

---

## 📱 Responsive Design

The app works perfectly on:
- ✅ Desktop (1920px+)
- ✅ Laptop (1024px+)
- ✅ Tablet (768px+)
- ✅ Mobile (320px+)

Try resizing your browser or opening on mobile!

---

## 🎨 Customization

### Change Theme Colors
Edit `src/index.css` theme variables:
```css
--color-primary: #3b82f6;
--color-accent: #8b5cf6;
--color-success: #22c55e;
```

### Add New Language
Edit `src/data/languages.ts`:
```typescript
{
  id: "rust",
  label: "Rust",
  monacoId: "rust",
  extension: "rs",
  color: "#F59E0B",
  glyph: "Rs"
}
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Use different port
npm run dev -- --port 3000
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### TypeScript Errors
```bash
# Type check
npx tsc --noEmit
```

---

## 📚 Learn More

- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org
- **Tailwind CSS**: https://tailwindcss.com
- **Vite**: https://vitejs.dev
- **React Router**: https://reactrouter.com

---

## 🚀 Next Steps

1. ✅ Explore the UI and features
2. ✅ Try the code review functionality
3. ✅ Download a PDF report
4. ✅ Check the analytics dashboard
5. ✅ Customize settings and theme
6. ✅ Review the code structure
7. ✅ Plan backend integration

---

## 💡 Tips

- Use the sample code to test quickly
- Try different languages
- Download reports to see PDF generation
- Check localStorage to see data persistence
- Use browser DevTools to inspect components
- Read the code comments for implementation details

---

## 🎉 You're All Set!

The app is fully functional and ready to explore. Enjoy reviewing code with ARCTIC CODE SENS!

**Questions?** Check the README.md or BUILD_SUMMARY.md for more details.

---

**Happy coding! 🚀**
