# ARCTIC CODE SENS - Full Stack Setup & Run Guide

## 🚀 Quick Start (Automated)

### Windows
```bash
run.bat
```

### macOS / Linux
```bash
chmod +x run.sh
./run.sh
```

This will:
1. Install backend dependencies
2. Install frontend dependencies
3. Start backend server on `http://localhost:5000`
4. Start frontend server on `http://localhost:5173`

---

## 📋 Manual Setup

### Prerequisites
- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)

### Step 1: Install Backend Dependencies
```bash
cd server
npm install
```

### Step 2: Install Frontend Dependencies
```bash
cd client
npm install
```

### Step 3: Configure Environment Variables

#### Backend (.env)
```bash
cd server
# Edit .env file with your settings
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env.local)
```bash
cd client
# Create .env.local file
VITE_API_URL=http://localhost:5000
VITE_USE_MOCK=false
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

### Step 4: Start Backend Server
```bash
cd server
npm run dev
```

Output:
```
🚀 Server running on http://localhost:5000
📝 CORS enabled for http://localhost:5173
```

### Step 5: Start Frontend Server (in a new terminal)
```bash
cd client
npm run dev
```

Output:
```
  VITE v8.1.1  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## 🔐 Authentication

### Test Credentials (Email/Password)
- **Email**: `test@example.com`
- **Password**: `Test@123`

### Google OAuth (Optional)
1. Set up Google Cloud Console project
2. Add OAuth 2.0 credentials
3. Update `VITE_GOOGLE_CLIENT_ID` in frontend `.env.local`
4. Update `GOOGLE_CLIENT_SECRET` in backend `.env`

---

## 📊 API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /login` - Login with email/password
- `POST /auth/google/callback` - Google OAuth callback
- `POST /refresh-token` - Refresh access token
- `GET /validate-session` - Validate current session

### User Profile
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile

### Code Reviews
- `POST /review` - Submit code for review
- `GET /reviews` - List all user reviews
- `GET /review/:id` - Get review details
- `DELETE /review/:id` - Delete review

### Analytics
- `GET /analytics` - Get user analytics

### Health
- `GET /health` - Server health check

---

## 🛠️ Development

### Backend Development
```bash
cd server
npm run dev          # Start with auto-reload
npm run build        # Build TypeScript
npm start            # Run compiled version
```

### Frontend Development
```bash
cd client
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linter
```

---

## 🐛 Troubleshooting

### Port Already in Use

**Backend (5000)**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

**Frontend (5173)**
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5173
kill -9 <PID>
```

Or use different ports:
```bash
# Backend
PORT=5001 npm run dev

# Frontend
npm run dev -- --port 3000
```

### Dependencies Installation Issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall with legacy peer deps
npm install --legacy-peer-deps
```

### CORS Errors
Ensure `VITE_API_URL` matches backend URL and `FRONTEND_URL` in backend `.env` matches frontend URL.

### TypeScript Errors
```bash
# Backend
cd server && npm run build

# Frontend
cd client && npm run build
```

---

## 📦 Production Build

### Backend
```bash
cd server
npm run build
npm start
```

### Frontend
```bash
cd client
npm run build
# Deploy dist/ folder to Vercel, Netlify, or your hosting
```

---

## 🔄 Switching Between Mock and Real Backend

### Use Mock Backend (Development)
```bash
# client/.env.local
VITE_USE_MOCK=true
```

### Use Real Backend
```bash
# client/.env.local
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:5000
```

---

## 📚 Project Structure

```
arctic-code-sens/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities & API
│   │   ├── context/       # Auth & Theme
│   │   └── types/         # TypeScript types
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Express backend
│   ├── src/
│   │   └── index.ts       # Main server file
│   ├── package.json
│   └── tsconfig.json
├── run.bat                 # Windows startup script
├── run.sh                  # Unix startup script
└── README.md
```

---

## 🚀 Next Steps

1. **Explore the App**
   - Sign up or login
   - Submit code for review
   - View analytics and reports

2. **Customize**
   - Update theme colors in `client/src/index.css`
   - Modify code analyzer in `client/src/data/mock.ts`
   - Add new API endpoints in `server/src/index.ts`

3. **Deploy**
   - Frontend: Vercel, Netlify, GitHub Pages
   - Backend: Render, Railway, Heroku, AWS

---

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Review error messages in browser console and terminal
- Check backend logs for API errors

---

**Happy coding! 🎉**
