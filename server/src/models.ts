import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  googleId: { type: String, sparse: true },
  email: { type: String, unique: true, required: true },
  password: { type: String },
  fullName: { type: String, required: true },
  profilePicture: { type: String },
  emailVerified: { type: Boolean, default: false },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  accountStatus: { type: String, enum: ['active', 'blocked'], default: 'active' },
  loginCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date },
  subscription: {
    planId: { type: String, enum: ['free', 'basic', 'pro', 'enterprise'], default: 'free' },
    expiryDate: { type: Date },
    status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
    autoRenew: { type: Boolean, default: true }
  },
  preferences: {
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
    notifications: { type: Boolean, default: true },
    learningMode: { type: Boolean, default: false }
  }
});

// Review Schema
const reviewSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  userId: { type: String, required: true, index: true },
  filename: { type: String, required: true },
  language: { type: String, required: true },
  code: { type: String, required: true },
  score: {
    overall: { type: Number, min: 0, max: 100 },
    security: { type: Number, min: 0, max: 100 },
    performance: { type: Number, min: 0, max: 100 },
    maintainability: { type: Number, min: 0, max: 100 },
    readability: { type: Number, min: 0, max: 100 },
    documentation: { type: Number, min: 0, max: 100 }
  },
  issues: [{
    id: String,
    title: String,
    description: String,
    severity: { type: String, enum: ['critical', 'high', 'medium', 'low', 'info'] },
    line: Number,
    suggestion: String,
    category: String
  }],
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

// Subscription Schema
const subscriptionSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  userId: { type: String, required: true, unique: true, index: true },
  planId: { type: String, enum: ['basic', 'pro', 'enterprise'], required: true },
  paymentId: { type: String, required: true },
  orderId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['active', 'cancelled', 'expired', 'pending'], default: 'pending' },
  startDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true },
  autoRenew: { type: Boolean, default: true },
  renewalDate: { type: Date },
  cancelledAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Payment Schema
const paymentSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  userId: { type: String, required: true, index: true },
  orderId: { type: String, required: true },
  paymentId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['success', 'failed', 'pending'], default: 'pending' },
  method: { type: String, enum: ['upi', 'card', 'netbanking'], default: 'upi' },
  upiId: { type: String },
  signature: { type: String },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Login Activity Schema
const loginActivitySchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  userId: { type: String, required: true, index: true },
  userName: { type: String, required: true },
  email: { type: String, required: true },
  loginDate: { type: Date, default: Date.now, index: true },
  loginTime: { type: String, required: true },
  logoutTime: { type: String },
  sessionDuration: { type: Number }, // in seconds
  browser: { type: String },
  operatingSystem: { type: String },
  device: { type: String },
  ipAddress: { type: String },
  country: { type: String },
  city: { type: String },
  timeZone: { type: String },
  loginStatus: { type: String, enum: ['success', 'failed'], default: 'success' },
  failureReason: { type: String },
  createdAt: { type: Date, default: Date.now, index: true }
});
const analyticsSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  userId: { type: String, required: true, index: true },
  date: { type: Date, default: Date.now, index: true },
  reviewsCount: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  languageDistribution: { type: Map, of: Number },
  severityBreakdown: {
    critical: { type: Number, default: 0 },
    high: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    low: { type: Number, default: 0 },
    info: { type: Number, default: 0 }
  }
});

export const User = mongoose.model('User', userSchema);
export const Review = mongoose.model('Review', reviewSchema);
export const Subscription = mongoose.model('Subscription', subscriptionSchema);
export const Payment = mongoose.model('Payment', paymentSchema);
export const Analytics = mongoose.model('Analytics', analyticsSchema);
export const LoginActivity = mongoose.model('LoginActivity', loginActivitySchema);
