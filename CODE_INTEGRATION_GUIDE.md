# 🔧 Code Integration Guide

## Step 1: Update Backend Server (server/src/index.ts)

### Add These Imports (at the top)
```typescript
import { connectDatabase } from './db';
import paymentRouter from './payment';
```

### Add Payment Routes (after app.use(express.json()))
```typescript
// Payment routes
app.use('/payment', paymentRouter);
```

### Connect Database (before app.listen())
```typescript
// Connect to MongoDB
const dbConnected = await connectDatabase();
if (!dbConnected) {
  console.warn('⚠️  Running without database - using in-memory storage');
}
```

### Complete Updated Section
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import { connectDatabase } from './db';
import paymentRouter from './payment';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Payment routes
app.use('/payment', paymentRouter);

// ... rest of your routes ...

// Connect to database
const dbConnected = await connectDatabase();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 CORS enabled for ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  if (dbConnected) {
    console.log(`✅ Database connected`);
  }
});
```

---

## Step 2: Update Frontend Router (client/src/App.tsx)

### Add Import
```typescript
import SubscriptionPlans from '@/pages/subscription';
```

### Add Route
```typescript
// In your routes array, add:
{
  path: '/subscription',
  element: <SubscriptionPlans />
}
```

### Example Routes Array
```typescript
const routes = [
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/subscription', element: <SubscriptionPlans /> },  // NEW
  { path: '/dashboard', element: <Dashboard /> },
  // ... other routes
];
```

---

## Step 3: Add Razorpay Script (client/index.html)

### Find the `<head>` section and add before `</head>`:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### Complete Head Section Example
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ARCTIC CODE SENS</title>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## Step 4: Update Environment Variables

### server/.env
```env
# Server
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/arctic-code-sens

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
UPI_ID=9659593334@axl

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

### client/.env.local
```env
VITE_API_URL=http://localhost:5000
VITE_USE_MOCK=false
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

---

## Step 5: Install Dependencies

```bash
# Backend
cd server
npm install mongoose razorpay

# Frontend (if needed)
cd client
npm install
```

---

## Step 6: Verify Files Exist

Check that these files are created:

```
server/src/
├── index.ts          ✅ (updated)
├── payment.ts        ✅ (new)
├── models.ts         ✅ (new)
└── db.ts             ✅ (new)

client/src/pages/
└── subscription.tsx  ✅ (new)

client/
├── index.html        ✅ (updated)
└── src/App.tsx       ✅ (updated)
```

---

## Step 7: Test the Integration

### Terminal 1 - Backend
```bash
cd server
npm run dev
```

Expected output:
```
🚀 Server running on http://localhost:5000
📝 CORS enabled for http://localhost:5173
✅ Database connected
```

### Terminal 2 - Frontend
```bash
cd client
npm run dev
```

Expected output:
```
VITE v8.1.1  ready in 234 ms
➜  Local:   http://localhost:5173/
```

### Test Payment Flow
1. Open http://localhost:5173/subscription
2. Click "Subscribe Now" on any plan
3. Use test card: `4111 1111 1111 1111`
4. Complete payment
5. Check MongoDB for records

---

## Step 8: Verify Database

```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017

# Use the database
use arctic-code-sens

# Check collections
show collections

# View subscriptions
db.subscriptions.find()

# View payments
db.payments.find()

# View users
db.users.find()
```

---

## 🎯 Summary of Changes

| File | Change | Type |
|------|--------|------|
| `server/src/index.ts` | Add imports & routes | Update |
| `server/src/payment.ts` | New payment module | Create |
| `server/src/models.ts` | New database models | Create |
| `server/src/db.ts` | New database connection | Create |
| `server/.env` | Add DB & payment config | Update |
| `server/package.json` | Add mongoose & razorpay | Update |
| `client/src/App.tsx` | Add subscription route | Update |
| `client/src/pages/subscription.tsx` | New subscription page | Create |
| `client/index.html` | Add Razorpay script | Update |
| `client/.env.local` | Add API URL config | Update |

---

## ✅ Checklist

- [ ] Updated `server/src/index.ts` with imports and routes
- [ ] Updated `client/src/App.tsx` with subscription route
- [ ] Updated `client/index.html` with Razorpay script
- [ ] Updated `server/.env` with database and payment config
- [ ] Updated `client/.env.local` with API URL
- [ ] Installed `mongoose` and `razorpay` packages
- [ ] MongoDB is running locally or configured with Atlas
- [ ] Razorpay account created and API keys obtained
- [ ] Tested payment flow
- [ ] Verified database records

---

## 🆘 Common Issues

### "Cannot find module 'mongoose'"
```bash
cd server
npm install mongoose
```

### "MongoDB connection failed"
```bash
# Start MongoDB
sudo systemctl start mongodb

# Or verify it's running
mongosh mongodb://localhost:27017
```

### "Razorpay payment failed"
- Check API keys in `.env`
- Verify UPI is enabled in Razorpay dashboard
- Use test credentials

### "CORS error"
- Update `FRONTEND_URL` in `server/.env`
- Ensure it matches your frontend URL exactly

---

**You're all set! Follow these steps in order. 🚀**
