import express, { Request, Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';

const router = express.Router();

// Razorpay credentials (set in .env)
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const UPI_ID = '9659593334@axl';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: number; // in days
  features: string[];
}

const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 99,
    duration: 30,
    features: ['10 reviews/month', 'Basic analytics', 'Email support']
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 299,
    duration: 30,
    features: ['Unlimited reviews', 'Advanced analytics', 'Priority support', 'PDF reports']
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 999,
    duration: 30,
    features: ['Unlimited everything', 'Team workspace', 'API access', 'Dedicated support']
  }
};

// Create Razorpay order
router.post('/create-order', async (req: Request, res: Response) => {
  try {
    const { planId, userId } = req.body;
    const plan = SUBSCRIPTION_PLANS[planId];

    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const options = {
      amount: plan.price * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${userId}_${Date.now()}`,
      description: `${plan.name} Subscription`,
      customer_notify: 1,
      notes: {
        planId,
        userId,
        upiId: UPI_ID
      }
    };

    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

    const response = await axios.post('https://api.razorpay.com/v1/orders', options, {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({
      orderId: response.data.id,
      amount: response.data.amount,
      currency: response.data.currency,
      key: RAZORPAY_KEY_ID,
      upiId: UPI_ID
    });
  } catch (error) {
    console.error('Order creation failed:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment
router.post('/verify-payment', async (req: Request, res: Response) => {
  try {
    const { orderId, paymentId, signature, userId, planId } = req.body;

    // Verify signature
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const plan = SUBSCRIPTION_PLANS[planId];
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + plan.duration);

    // Save subscription to database (implement with your DB)
    // await saveSubscription({
    //   userId,
    //   planId,
    //   paymentId,
    //   orderId,
    //   amount: plan.price,
    //   expiryDate,
    //   status: 'active'
    // });

    res.json({
      success: true,
      message: 'Payment verified successfully',
      subscription: {
        planId,
        expiryDate,
        features: plan.features
      }
    });
  } catch (error) {
    console.error('Payment verification failed:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Get subscription plans
router.get('/plans', (req: Request, res: Response) => {
  res.json(SUBSCRIPTION_PLANS);
});

// Get user subscription
router.get('/subscription/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Fetch from database (implement with your DB)
    // const subscription = await getSubscription(userId);
    
    // Mock response
    res.json({
      userId,
      planId: 'pro',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'active',
      features: SUBSCRIPTION_PLANS.pro.features
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Cancel subscription
router.post('/cancel-subscription/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Update database (implement with your DB)
    // await cancelSubscription(userId);
    
    res.json({ success: true, message: 'Subscription cancelled' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

export default router;
