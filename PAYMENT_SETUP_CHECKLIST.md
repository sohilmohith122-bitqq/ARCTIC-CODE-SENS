# 🚀 Quick Setup Checklist - Database & Payment

## ✅ What's Been Done

- ✅ Created payment module with Razorpay integration
- ✅ Created MongoDB models and schemas
- ✅ Created database connection module
- ✅ Created subscription page component
- ✅ Updated backend .env with payment/database config
- ✅ Installed mongoose and razorpay packages
- ✅ UPI ID configured: `9659593334@axl`

---

## 📋 What You Need to Do

### Step 1: Set Up MongoDB (Choose One)

#### Option A: Local MongoDB (Easiest for Development)
```bash
# Windows: Download from https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community && brew services start mongodb-community
# Linux: sudo apt-get install mongodb && sudo systemctl start mongodb

# Verify it's running
mongosh mongodb://localhost:27017
```

#### Option B: MongoDB Atlas (Cloud - Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Update `server/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/arctic-code-sens
```

### Step 2: Set Up Razorpay Payment

1. Go to https://razorpay.com
2. Create business account
3. Complete KYC
4. Get API keys from Settings → API Keys
5. Update `server/.env`:
```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxxxx
UPI_ID=9659593334@axl
```

### Step 3: Update Backend Server

Edit `server/src/index.ts` and add:

```typescript
// At the top with other imports
import { connectDatabase } from './db';
import paymentRouter from './payment';

// After app.use(express.json()), add:
app.use('/payment', paymentRouter);

// Before app.listen(), add:
await connectDatabase();
```

### Step 4: Add Subscription Page to Frontend

Edit `client/src/App.tsx` and add route:

```typescript
import SubscriptionPlans from '@/pages/subscription';

// In your routes array, add:
{
  path: '/subscription',
  element: <SubscriptionPlans />
}
```

### Step 5: Add Razorpay Script to Frontend

Edit `client/index.html` and add before closing `</head>`:

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

---

## 🧪 Test the Integration

### 1. Start Servers
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

### 2. Test Payment Flow
1. Go to http://localhost:5173/subscription
2. Click "Subscribe Now"
3. Use test card: `4111 1111 1111 1111`
4. Any future expiry date
5. Any 3-digit CVV
6. OTP: `123456`

### 3. Verify in MongoDB
```bash
mongosh mongodb://localhost:27017
use arctic-code-sens
db.subscriptions.find()
db.payments.find()
```

---

## 📁 Files Created

| File | Purpose |
|------|---------|
| `server/src/payment.ts` | Razorpay payment routes |
| `server/src/models.ts` | MongoDB schemas |
| `server/src/db.ts` | Database connection |
| `client/src/pages/subscription.tsx` | Subscription UI |
| `DATABASE_AND_PAYMENT_SETUP.md` | Detailed guide |

---

## 🔑 Environment Variables

### server/.env
```env
PORT=5000
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/arctic-code-sens
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxxxx
UPI_ID=9659593334@axl
```

### client/.env.local
```env
VITE_API_URL=http://localhost:5000
VITE_USE_MOCK=false
```

---

## 💰 Subscription Plans

- **Basic**: ₹99/month - 10 reviews
- **Pro**: ₹299/month - Unlimited reviews (Popular)
- **Enterprise**: ₹999/month - Everything + Team

---

## 🎯 Next Steps

1. [ ] Install MongoDB locally or use Atlas
2. [ ] Create Razorpay account and get API keys
3. [ ] Update `server/.env` with credentials
4. [ ] Update `server/src/index.ts` with imports
5. [ ] Add subscription route to frontend
6. [ ] Add Razorpay script to `client/index.html`
7. [ ] Test payment flow
8. [ ] Deploy to production

---

## 🆘 Troubleshooting

**MongoDB not connecting?**
```bash
# Check if running
mongosh mongodb://localhost:27017

# Or start it
sudo systemctl start mongodb
```

**Razorpay payment failing?**
- Verify API keys in .env
- Check if UPI is enabled in Razorpay dashboard
- Use test credentials provided

**CORS errors?**
- Ensure FRONTEND_URL in server/.env matches your frontend URL
- Check browser console for exact error

---

## 📚 Resources

- MongoDB: https://docs.mongodb.com
- Razorpay: https://razorpay.com/docs
- Mongoose: https://mongoosejs.com

---

**You're all set! Start with Step 1 above. 🚀**
