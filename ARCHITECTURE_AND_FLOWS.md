# 🏗️ Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ARCTIC CODE SENS                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│   FRONTEND (React)       │         │   BACKEND (Express)      │
│  http://localhost:5173   │         │  http://localhost:5000   │
├──────────────────────────┤         ├──────────────────────────┤
│ • Landing Page           │◄───────►│ • Auth Routes            │
│ • Login/Register         │  HTTP   │ • Review Routes          │
│ • Dashboard              │  JSON   │ • Payment Routes         │
│ • Code Review            │         │ • Analytics Routes       │
│ • Subscription Plans     │         │ • User Routes            │
│ • Analytics              │         │                          │
│ • Reports                │         │                          │
│ • Profile                │         │                          │
│ • Settings               │         │                          │
└──────────────────────────┘         └──────────────────────────┘
         │                                      │
         │                                      │
         └──────────────────┬───────────────────┘
                            │
                    ┌───────▼────────┐
                    │   Razorpay     │
                    │   Payment      │
                    │   Gateway      │
                    └────────────────┘
                            │
                    ┌───────▼────────┐
                    │  UPI Payment   │
                    │ 9659593334@axl │
                    └────────────────┘

         ┌──────────────────────────────────┐
         │   MongoDB Database               │
         │  mongodb://localhost:27017       │
         ├──────────────────────────────────┤
         │ Collections:                     │
         │ • users                          │
         │ • reviews                        │
         │ • subscriptions                  │
         │ • payments                       │
         │ • analytics                      │
         └──────────────────────────────────┘
```

---

## Payment Flow

```
User Clicks "Subscribe"
        │
        ▼
┌─────────────────────────┐
│ Select Subscription     │
│ Plan (Basic/Pro/Ent)    │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Frontend: Create Order              │
│ POST /payment/create-order          │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Backend: Generate Razorpay Order    │
│ • Amount: ₹99/299/999               │
│ • Currency: INR                     │
│ • UPI ID: 9659593334@axl            │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Razorpay Checkout Modal             │
│ • Card Payment                      │
│ • UPI Payment                       │
│ • Net Banking                       │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ User Completes Payment              │
│ • Enters UPI PIN / Card Details     │
│ • OTP Verification                  │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Razorpay Returns Payment Details    │
│ • Payment ID                        │
│ • Order ID                          │
│ • Signature                         │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Frontend: Verify Payment            │
│ POST /payment/verify-payment        │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Backend: Verify Signature           │
│ • Check HMAC-SHA256                 │
│ • Validate Amount                   │
│ • Validate Order ID                 │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Save to Database                    │
│ • Create Subscription Record        │
│ • Create Payment Record             │
│ • Update User Subscription          │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Success! ✅                         │
│ • Redirect to Dashboard             │
│ • Show Success Message              │
│ • Grant Premium Features            │
└─────────────────────────────────────┘
```

---

## Database Schema Relationships

```
┌──────────────────┐
│     USERS        │
├──────────────────┤
│ id (PK)          │
│ email            │
│ name             │
│ password         │
│ subscription_id  │◄─────┐
│ created_at       │      │
└──────────────────┘      │
                          │
                    ┌─────┴──────────────┐
                    │                    │
            ┌───────▼──────────┐  ┌──────▼────────────┐
            │  SUBSCRIPTIONS   │  │    PAYMENTS       │
            ├──────────────────┤  ├───────────────────┤
            │ id (PK)          │  │ id (PK)           │
            │ user_id (FK)     │  │ user_id (FK)      │
            │ plan_id          │  │ subscription_id   │
            │ payment_id       │  │ order_id          │
            │ amount           │  │ payment_id        │
            │ status           │  │ amount            │
            │ expiry_date      │  │ status            │
            │ auto_renew       │  │ method (UPI/Card) │
            │ created_at       │  │ created_at        │
            └──────────────────┘  └───────────────────┘
                    │
                    │
            ┌───────▼──────────┐
            │    REVIEWS       │
            ├──────────────────┤
            │ id (PK)          │
            │ user_id (FK)     │
            │ filename         │
            │ language         │
            │ code             │
            │ score            │
            │ issues           │
            │ created_at       │
            └──────────────────┘
                    │
                    │
            ┌───────▼──────────┐
            │   ANALYTICS      │
            ├──────────────────┤
            │ id (PK)          │
            │ user_id (FK)     │
            │ date             │
            │ reviews_count    │
            │ avg_score        │
            │ language_dist    │
            │ severity_dist    │
            └──────────────────┘
```

---

## Authentication Flow

```
User Visits App
        │
        ▼
┌─────────────────────────────┐
│ Check localStorage Token    │
└────────────┬────────────────┘
             │
        ┌────┴────┐
        │          │
    Token?      No Token
        │          │
        ▼          ▼
    ┌──────┐  ┌──────────────┐
    │Valid?│  │ Redirect to  │
    └──┬───┘  │ Login Page   │
       │      └──────────────┘
    ┌──┴──┐
    │     │
   Yes   No
    │     │
    ▼     ▼
┌──────┐ ┌──────────────┐
│Load  │ │ Refresh      │
│User  │ │ Token        │
└──┬───┘ └──────┬───────┘
   │            │
   │       ┌────┴────┐
   │       │          │
   │    Success    Failed
   │       │          │
   │       ▼          ▼
   │    ┌──────┐  ┌──────────┐
   │    │Load  │  │ Redirect │
   │    │User  │  │ to Login │
   │    └──────┘  └──────────┘
   │
   ▼
┌──────────────────────┐
│ User Authenticated   │
│ Access Dashboard     │
└──────────────────────┘
```

---

## Subscription Lifecycle

```
User Subscribes
        │
        ▼
┌──────────────────────────┐
│ Subscription Created     │
│ Status: ACTIVE           │
│ Expiry: 30 days from now │
└────────────┬─────────────┘
             │
             ▼
    ┌────────────────────┐
    │ User Has Access to │
    │ Premium Features   │
    │ • Unlimited Reviews│
    │ • Advanced Reports │
    │ • Priority Support │
    └────────────┬───────┘
                 │
        ┌────────┴────────┐
        │                 │
    Auto-Renew?        Manual
        │                 │
        ▼                 ▼
    ┌──────────┐    ┌──────────────┐
    │ 7 Days   │    │ User Cancels │
    │ Before   │    │ Subscription │
    │ Expiry   │    └──────┬───────┘
    └────┬─────┘           │
         │                 ▼
         ▼            ┌──────────────┐
    ┌──────────┐      │ Status:      │
    │ Auto     │      │ CANCELLED    │
    │ Renew    │      │ Access Ends  │
    │ Payment  │      │ Immediately  │
    └────┬─────┘      └──────────────┘
         │
    ┌────┴────┐
    │          │
Success     Failed
    │          │
    ▼          ▼
┌──────┐  ┌──────────┐
│New   │  │ Notify   │
│Sub   │  │ User &   │
│30    │  │ Downgrade│
│Days  │  │ to Free  │
└──────┘  └──────────┘
```

---

## File Structure

```
arctic-code-sens/
│
├── server/
│   ├── src/
│   │   ├── index.ts          # Main server file
│   │   ├── payment.ts        # Razorpay routes
│   │   ├── models.ts         # MongoDB schemas
│   │   └── db.ts             # Database connection
│   ├── .env                  # Environment variables
│   ├── package.json          # Dependencies
│   └── tsconfig.json         # TypeScript config
│
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── subscription.tsx  # Subscription UI
│   │   │   ├── dashboard.tsx
│   │   │   ├── review-code.tsx
│   │   │   └── ...
│   │   ├── components/
│   │   ├── lib/
│   │   ├── context/
│   │   ├── App.tsx           # Router
│   │   └── main.tsx
│   ├── index.html            # Razorpay script
│   ├── .env.local            # Environment variables
│   └── package.json
│
├── DATABASE_AND_PAYMENT_SETUP.md
├── PAYMENT_SETUP_CHECKLIST.md
├── CODE_INTEGRATION_GUIDE.md
├── COMPLETE_INTEGRATION_SUMMARY.md
└── README.md
```

---

## Technology Stack

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND                             │
├─────────────────────────────────────────────────────────┤
│ • React 19 - UI Framework                              │
│ • TypeScript - Type Safety                             │
│ • Vite - Build Tool                                    │
│ • Tailwind CSS - Styling                               │
│ • React Router - Navigation                            │
│ • React Hook Form - Form Management                    │
│ • TanStack Query - Data Fetching                        │
│ • Recharts - Analytics Charts                          │
│ • jsPDF - PDF Generation                               │
│ • Razorpay - Payment Integration                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    BACKEND                              │
├─────────────────────────────────────────────────────────┤
│ • Express.js - Web Framework                           │
│ • TypeScript - Type Safety                             │
│ • MongoDB - Database                                   │
│ • Mongoose - ODM                                       │
│ • JWT - Authentication                                 │
│ • bcryptjs - Password Hashing                          │
│ • Razorpay - Payment Gateway                           │
│ • CORS - Cross-Origin Support                          │
│ • Axios - HTTP Client                                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                      │
├─────────────────────────────────────────────────────────┤
│ • MongoDB Atlas - Cloud Database                       │
│ • Razorpay - Payment Processing                        │
│ • Google OAuth - Authentication                        │
│ • Vercel - Frontend Hosting                            │
│ • Render/Railway - Backend Hosting                     │
└─────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   PRODUCTION                             │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────┐         ┌────────────────┐          │
│  │  Vercel/       │         │  Render/       │          │
│  │  Netlify       │         │  Railway       │          │
│  │  (Frontend)    │         │  (Backend)     │          │
│  └────────┬───────┘         └────────┬───────┘          │
│           │                         │                   │
│           └────────────┬────────────┘                   │
│                        │                                │
│                        ▼                                │
│            ┌──────────────────────┐                    │
│            │  Razorpay            │                    │
│            │  Payment Gateway     │                    │
│            └──────────┬───────────┘                    │
│                       │                                │
│                       ▼                                │
│            ┌──────────────────────┐                    │
│            │  MongoDB Atlas       │                    │
│            │  Cloud Database      │                    │
│            └──────────────────────┘                    │
│                                                        │
└──────────────────────────────────────────────────────────┘
```

---

**This architecture supports:**
- ✅ Scalable payment processing
- ✅ Persistent data storage
- ✅ User authentication
- ✅ Real-time analytics
- ✅ Subscription management
- ✅ Production deployment

**Ready to deploy! 🚀**
