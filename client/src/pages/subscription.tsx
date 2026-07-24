import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  features: string[];
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function SubscriptionPlans() {
  const [plans, setPlans] = useState<Record<string, SubscriptionPlan>>({});
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
    loadRazorpayScript();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('http://localhost:5000/payment/plans');
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const loadRazorpayScript = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const handleSubscribe = async (planId: string) => {
    setLoading(true);
    try {
      // Get user ID from auth context
      const userId = localStorage.getItem('userId') || 'user_123';

      // Create order
      const orderResponse = await fetch('http://localhost:5000/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, userId })
      });

      const orderData = await orderResponse.json();

      // Open Razorpay checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        description: `Subscribe to ${planId} plan`,
        prefill: {
          email: localStorage.getItem('userEmail') || '',
          contact: ''
        },
        notes: {
          upiId: orderData.upiId
        },
        handler: async (response: any) => {
          // Verify payment
          const verifyResponse = await fetch('http://localhost:5000/payment/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: orderData.orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              userId,
              planId
            })
          });

          const verifyData = await verifyResponse.json();
          if (verifyData.success) {
            alert('✅ Subscription activated successfully!');
            // Redirect to dashboard or refresh
            window.location.href = '/dashboard';
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Subscription failed:', error);
      alert('Failed to process subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p className="text-slate-400 text-lg">Unlock premium features and boost your productivity</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {Object.values(plans).map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-all duration-300 ${
                selectedPlan === plan.id ? 'ring-2 ring-blue-500 scale-105' : ''
              }`}
            >
              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-blue-400">₹{plan.price}</span>
                  <span className="text-slate-400 ml-2">/{plan.duration} days</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-slate-300">
                      <Check className="w-5 h-5 text-green-400 mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => {
                    setSelectedPlan(plan.id);
                    handleSubscribe(plan.id);
                  }}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  {loading ? 'Processing...' : 'Subscribe Now'}
                </Button>

                {plan.id === 'pro' && (
                  <Badge className="absolute top-4 right-4 bg-yellow-500 text-black">
                    Popular
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 p-6 bg-slate-800 rounded-lg border border-slate-700">
          <h3 className="text-white font-semibold mb-2">💳 Payment Methods</h3>
          <p className="text-slate-400">
            We accept UPI (9659593334@axl), Credit/Debit Cards, and Net Banking via Razorpay
          </p>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionPlans;
