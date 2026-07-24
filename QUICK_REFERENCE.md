# 🎯 QUICK REFERENCE CARD

## 📋 Setup in 5 Minutes

### 1️⃣ Install MongoDB
```bash
# Windows: Download from mongodb.com
# macOS: brew install mongodb-community
# Linux: sudo apt-get install mongodb
```

### 2️⃣ Get Razorpay Keys
- Go to https://razorpay.com
- Create account → Get API keys
- Copy Key ID and Key Secret

### 3️⃣ Update .env Files

**server/.env:**
```env
MONGODB_URI=mongodb://localhost:27017/arctic-code-sens
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
UPI_ID=9659593334@axl
```

**client/.env.local:**
```env
VITE_API_URL=http://localhost:5000
VITE_USE_MOCK=false
```

### 4️⃣ Update Code

**server/src/index.ts:**
```typescript
import { connectDatabase } from './db';
import paymentRouter from './payment';

app.use('/payment', paymentRouter);
await connectDatabase();
```

**client/src/App.tsx:**
```typescript
import SubscriptionPlans from '@/pages/subscription';

// Add route:
{ path: '/subscription', element: <SubscriptionPlans /> }
```

**client/index.html:**
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### 5️⃣ Run Servers
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

---

## 🔗 Important URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5000 |
| MongoDB | mongodb://localhost:27017 |
| Subscription | http://localhost:5173/subscription |
| Health Check | http://localhost:5000/health |

---

## 💳 Test Payment

**Card:** `4111 1111 1111 1111`
**Expiry:** Any future date
**CVV:** Any 3 digits
**OTP:** `123456`

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `server/src/payment.ts` | Payment routes |
| `server/src/models.ts` | Database schemas |
| `server/src/db.ts` | DB connection |
| `client/src/pages/subscription.tsx` | Subscription UI |

---

## 🚀 Subscription Plans

- **Basic:** ₹99/month
- **Pro:** ₹299/month ⭐
- **Enterprise:** ₹999/month

---

## 📊 Database Collections

- `users` - Accounts
- `reviews` - Code reviews
- `subscriptions` - Active plans
- `payments` - Transactions
- `analytics` - Stats

---

## 🔐 Your UPI ID

```
9659593334@axl
```

---

## ✅ Checklist

- [ ] MongoDB installed
- [ ] Razorpay account created
- [ ] .env files updated
- [ ] Backend code updated
- [ ] Frontend code updated
- [ ] Servers running
- [ ] Payment tested
- [ ] Database verified

---

## 🆘 Quick Fixes

**MongoDB not running?**
```bash
sudo systemctl start mongodb
```

**Port in use?**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Missing dependencies?**
```bash
cd server && npm install mongoose razorpay
```

---

## 📚 Full Guides

- `DATABASE_AND_PAYMENT_SETUP.md` - Detailed setup
- `CODE_INTEGRATION_GUIDE.md` - Code changes
- `ARCHITECTURE_AND_FLOWS.md` - System design
- `COMPLETE_INTEGRATION_SUMMARY.md` - Overview

---

## 🎉 You're Ready!

Follow the 5 steps above and you'll have:
✅ Payment processing
✅ Persistent database
✅ Subscription management
✅ User authentication
✅ Analytics tracking

**Start with Step 1! 🚀**
