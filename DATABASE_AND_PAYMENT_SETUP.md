# Database & Payment Setup Guide

## 🗄️ Database Setup (MongoDB)

### Option 1: Local MongoDB (Development)

#### Windows
1. Download MongoDB Community Edition: https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. MongoDB will run on `mongodb://localhost:27017` by default

#### macOS
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu)
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

### Option 2: MongoDB Atlas (Cloud - Recommended for Production)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/arctic-code-sens`
5. Update `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/arctic-code-sens
```

### Verify MongoDB Connection
```bash
# Test local connection
mongosh mongodb://localhost:27017

# Or use MongoDB Compass GUI
# Download: https://www.mongodb.com/products/compass
```

---

## 💳 Payment Setup (Razorpay + UPI)

### Step 1: Create Razorpay Account

1. Go to https://razorpay.com
2. Sign up for a business account
3. Complete KYC verification
4. Go to Settings → API Keys
5. Copy your **Key ID** and **Key Secret**

### Step 2: Update Backend .env

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
UPI_ID=9659593334@axl
```

### Step 3: Enable UPI on Razorpay

1. Log in to Razorpay Dashboard
2. Go to Settings → Payment Methods
3. Enable UPI
4. Add your UPI ID: `9659593334@axl`

### Step 4: Test Payment Flow

**Test Credentials (Sandbox Mode):**
- Card: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits
- OTP: `123456`

---

## 📦 Install Dependencies

```bash
cd server
npm install mongoose razorpay
```

---

## 🔧 Environment Variables

### Backend (.env)
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

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000
VITE_USE_MOCK=false
```

---

## 📊 Database Schema

### Collections Created Automatically

1. **users** - User accounts and profiles
2. **reviews** - Code reviews and analysis results
3. **subscriptions** - Active subscriptions
4. **payments** - Payment history
5. **analytics** - User analytics data

### Sample User Document
```json
{
  "_id": "ObjectId",
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "password": "hashed_password",
  "emailVerified": true,
  "subscription": {
    "planId": "pro",
    "expiryDate": "2024-12-31",
    "status": "active"
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "lastLoginAt": "2024-01-15T10:30:00Z"
}
```

---

## 🚀 Integration Steps

### 1. Update Backend Server (index.ts)

Add these imports at the top:
```typescript
import { connectDatabase } from './db';
import paymentRouter from './payment';
```

Add database connection:
```typescript
// Connect to MongoDB
await connectDatabase();
```

Add payment routes:
```typescript
app.use('/payment', paymentRouter);
```

### 2. Add Subscription Endpoints

The payment module includes:
- `POST /payment/create-order` - Create payment order
- `POST /payment/verify-payment` - Verify payment signature
- `GET /payment/plans` - Get subscription plans
- `GET /payment/subscription/:userId` - Get user subscription
- `POST /payment/cancel-subscription/:userId` - Cancel subscription

### 3. Frontend Integration

Add subscription page to router:
```typescript
import SubscriptionPlans from '@/pages/subscription';

// In your routes
{
  path: '/subscription',
  element: <SubscriptionPlans />
}
```

---

## 💰 Subscription Plans

| Plan | Price | Duration | Features |
|------|-------|----------|----------|
| Basic | ₹99 | 30 days | 10 reviews/month, Basic analytics |
| Pro | ₹299 | 30 days | Unlimited reviews, Advanced analytics, PDF reports |
| Enterprise | ₹999 | 30 days | Everything + Team workspace, API access |

---

## 🔐 Security Best Practices

1. **Never commit .env files** - Add to .gitignore
2. **Use HTTPS in production** - Razorpay requires HTTPS
3. **Verify payment signatures** - Always verify on backend
4. **Store sensitive data securely** - Use environment variables
5. **Implement rate limiting** - Prevent abuse
6. **Use CORS properly** - Only allow your frontend domain

---

## 🧪 Testing Payment Flow

### Local Testing
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### Test Subscription
1. Go to http://localhost:5173/subscription
2. Click "Subscribe Now" on any plan
3. Use test card: `4111 1111 1111 1111`
4. Complete payment
5. Check MongoDB for subscription record

---

## 📱 Production Deployment

### Database
- Use MongoDB Atlas (cloud)
- Enable IP whitelist
- Use strong passwords
- Enable backups

### Payment
- Switch Razorpay to Live mode
- Update API keys
- Use HTTPS only
- Implement webhook for payment updates

### Backend
- Deploy to Render, Railway, or AWS
- Set environment variables
- Enable CORS for production domain
- Use production database URI

### Frontend
- Deploy to Vercel or Netlify
- Update API URL to production backend
- Set VITE_USE_MOCK=false

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
mongosh mongodb://localhost:27017

# Or check MongoDB service
sudo systemctl status mongodb
```

### Razorpay Payment Failed
- Verify API keys are correct
- Check if UPI ID is enabled
- Ensure HTTPS in production
- Check payment logs in Razorpay dashboard

### CORS Errors
- Update FRONTEND_URL in backend .env
- Ensure frontend URL matches exactly

---

## 📚 Resources

- MongoDB Docs: https://docs.mongodb.com
- Razorpay Docs: https://razorpay.com/docs
- Mongoose Docs: https://mongoosejs.com
- UPI Integration: https://razorpay.com/docs/payments/upi

---

## ✅ Checklist

- [ ] MongoDB installed and running
- [ ] Razorpay account created
- [ ] API keys added to .env
- [ ] Dependencies installed (`npm install mongoose razorpay`)
- [ ] Backend updated with payment routes
- [ ] Frontend subscription page added
- [ ] Payment flow tested
- [ ] Database collections verified
- [ ] Production credentials configured

---

**Ready to accept payments! 🎉**
