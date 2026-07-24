# ARCTIC CODE SENS - Quick Reference

## 🚀 Start Everything (One Command)

### Windows
```bash
run.bat
```

### macOS / Linux
```bash
chmod +x run.sh && ./run.sh
```

---

## 🔧 Manual Start (Two Terminals)

### Terminal 1 - Backend
```bash
cd server
npm install  # First time only
npm run dev
```

### Terminal 2 - Frontend
```bash
cd client
npm install  # First time only
npm run dev
```

---

## 🌐 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | Web app |
| Backend API | http://localhost:5000 | API server |
| Health Check | http://localhost:5000/health | Server status |

---

## 🔐 Test Login

- **Email**: `test@example.com`
- **Password**: `Test@123`

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `server/src/index.ts` | Backend server |
| `client/src/App.tsx` | Frontend router |
| `client/src/lib/api.ts` | API client |
| `server/.env` | Backend config |
| `client/.env.local` | Frontend config |

---

## 🛠️ Common Commands

```bash
# Backend
cd server
npm run dev      # Start dev server
npm run build    # Compile TypeScript
npm start        # Run compiled version

# Frontend
cd client
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview build
npm run lint     # Check code quality
```

---

## ⚙️ Configuration

### Backend (.env)
```env
PORT=5000
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000
VITE_USE_MOCK=false
```

---

## 🐛 Quick Fixes

**Port in use?**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000 | grep LISTEN
kill -9 <PID>
```

**Dependencies broken?**
```bash
npm cache clean --force
npm install --legacy-peer-deps
```

**TypeScript errors?**
```bash
npm run build
```

---

## 📊 Features

✅ AI-powered code review
✅ 12 language support
✅ Security scanning
✅ Performance analysis
✅ PDF/JSON reports
✅ Analytics dashboard
✅ Review history
✅ User authentication
✅ Google OAuth ready

---

## 🎯 Next Steps

1. Run `run.bat` (Windows) or `./run.sh` (macOS/Linux)
2. Open http://localhost:5173
3. Sign up or login with test credentials
4. Submit code for review
5. Explore features!

---

**Questions?** Check `SETUP_AND_RUN.md` for detailed guide.
