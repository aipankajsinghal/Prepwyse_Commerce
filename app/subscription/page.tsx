"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Check,
  Crown,
  Sparkles,
  TrendingUp,
  Zap,
  Shield,
  Users,
  Clock,
} from "lucide-react";

interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: string;
  durationDays: number;
  features: string[];
  isActive: boolean;
  order: number;
}

interface SubscriptionStatus {
  hasSubscription: boolean;
  isActive: boolean;
  isTrial: boolean;
  daysRemaining: number;
  plan?: {
    displayName: string;
    price: string;
  };
  endDate?: string;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load plans
      const plansRes = await fetch("/api/admin/subscription-plans");
      const plansData = await plansRes.json();
      setPlans(plansData.plans || []);

      // Load user status
      const statusRes = await fetch("/api/subscription/status");
      const statusData = await statusRes.json();
      setStatus(statusData.status || null);
    } catch (error) {
      console.error("Failed to load subscription data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    if (processing) return;

    setProcessing(true);
    try {
      // Create Razorpay order
      const orderRes = await fetch("/api/subscription/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const orderData = await orderRes.json();

      if (!orderData.order) {
        throw new Error("Failed to create order");
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "PrepWyse Commerce",
        description: `${orderData.plan.name} Subscription`,
        order_id: orderData.order.id,
        handler: async function (response: any) {
          // Verify payment
          const verifyRes = await fetch("/api/subscription/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.subscription) {
            router.push("/dashboard?subscribed=true");
          }
        },
        theme: {
          color: "rgb(183, 73, 50)",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to process payment. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const getPlanIcon = (index: number) => {
    const icons = [Zap, Crown, Sparkles];
    return icons[index] || Zap;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Crown className="h-12 w-12 text-accent-1" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))] bg-pattern">
      {/* Load Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 mb-4 px-4 py-2 rounded-full bg-accent-1/10 text-accent-1">
            <Crown className="h-5 w-5" />
            <span className="font-display font-semibold">Premium Access</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-6 text-text-primary">
            Choose Your Learning Path
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto font-body">
            Unlock unlimited access to AI-powered quizzes, adaptive learning, and personalized recommendations
          </p>
        </motion.div>

        {/* Current Status (if subscribed) */}
        {status?.isActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 max-w-3xl mx-auto"
          >
            <div className="edu-card bg-gradient-to-r from-accent-1/10 to-accent-2/10 border-2 border-accent-1/20">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <Shield className="h-12 w-12 text-accent-1" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl font-semibold mb-1">
                    Active: {status.plan?.displayName}
                  </h3>
                  <p className="text-text-secondary">
                    {status.daysRemaining} days remaining
                    {status.isTrial && " (Trial)"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-display font-bold text-accent-1">
                    ₹{status.plan?.price}
                  </div>
                  <div className="text-sm text-text-muted">per month</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const Icon = getPlanIcon(index);
            const isPopular = index === 1; // Middle plan is popular

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative ${isPopular ? "md:-mt-4" : ""}`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-accent-1 text-white px-4 py-1 rounded-full text-sm font-display font-semibold shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}

                <div
                  className={`edu-card h-full ${
                    isPopular
                      ? "border-2 border-accent-1 shadow-lg"
                      : "border border-text-primary/10"
                  }`}
                >
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-1 to-accent-1-dark text-white mb-4 animate-float">
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="font-display text-2xl font-bold mb-2">
                      {plan.displayName}
                    </h3>
                    <p className="text-text-secondary text-sm mb-4">
                      {plan.description}
                    </p>
                    <div className="mb-2">
                      <span className="text-5xl font-display font-bold text-accent-1">
                        ₹{plan.price}
                      </span>
                    </div>
                    <div className="text-text-muted text-sm">
                      for {plan.durationDays} days
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-semantic-success flex-shrink-0 mt-0.5" />
                        <span className="text-text-secondary text-sm">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={processing || !plan.isActive}
                    className={`w-full font-display font-semibold py-3 rounded-xl transition-all ${
                      isPopular
                        ? "btn-primary"
                        : "btn-secondary"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {processing ? "Processing..." : "Select Plan"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <h2 className="font-display text-3xl font-bold mb-12">
            Why Choose PrepWyse Premium?
          </h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: TrendingUp,
                title: "Adaptive Learning",
                desc: "AI adjusts to your pace",
              },
              {
                icon: Sparkles,
                title: "Smart Quizzes",
                desc: "Personalized questions",
              },
              { icon: Users, title: "Expert Support", desc: "24/7 assistance" },
              {
                icon: Clock,
                title: "Learn Anytime",
                desc: "Access on any device",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                className="edu-card text-center"
              >
                <feature.icon className="h-10 w-10 text-accent-2 mx-auto mb-3" />
                <h4 className="font-display font-semibold mb-2">
                  {feature.title}
                </h4>
                <p className="text-sm text-text-secondary">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center space-x-8 text-text-muted text-sm">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4" />
              <span>No Hidden Fees</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>10,000+ Students</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
