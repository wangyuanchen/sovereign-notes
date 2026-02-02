'use client';

import { useState } from 'react';
import { CreditCard, Loader2, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n';

interface SubscriptionButtonProps {
  currentPlan?: 'free' | 'pro' | 'early_bird';
  subscriptionStatus?: 'active' | 'inactive' | 'expired';
}

export default function SubscriptionButton({ 
  currentPlan = 'free', 
  subscriptionStatus = 'inactive' 
}: SubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const { t } = useTranslation();

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error('Failed to start checkout', { description: data.error });
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast.error('Failed to connect to payment service');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.error) {
        toast.error('Failed to open billing portal', { description: data.error });
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast.error('Failed to connect to payment service');
    } finally {
      setIsLoading(false);
    }
  };

  const isPro = currentPlan === 'pro' || currentPlan === 'early_bird';
  const isActive = subscriptionStatus === 'active';

  if (isPro && isActive) {
    return (
      <div className="bg-gradient-to-r from-sky-500/10 to-purple-500/10 border border-sky-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-sky-400" />
          <h3 className="text-lg font-semibold text-sky-400">
            {currentPlan === 'early_bird' ? 'Early Bird Pro' : 'Pro Plan'}
          </h3>
        </div>
        <p className="text-zinc-400 text-sm mb-4">
          You have full access to all premium features.
        </p>
        <button
          onClick={handleManageSubscription}
          disabled={isLoading}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-2 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CreditCard className="w-4 h-4" />
          )}
          Manage Subscription
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold">Upgrade to Pro</h3>
      </div>
      
      <ul className="text-zinc-400 text-sm mb-6 space-y-2">
        <li className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" />
          Cross-device sync with E2E encryption
        </li>
        <li className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" />
          2 GB encrypted cloud storage
        </li>
        <li className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" />
          Daily automatic backups
        </li>
        <li className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" />
          Web3 wallet login support
        </li>
      </ul>

      {/* Plan Toggle */}
      <div className="flex bg-zinc-800 rounded-lg p-1 mb-4">
        <button
          onClick={() => setSelectedPlan('monthly')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition ${
            selectedPlan === 'monthly'
              ? 'bg-white text-black'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Monthly · $1
        </button>
        <button
          onClick={() => setSelectedPlan('yearly')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition ${
            selectedPlan === 'yearly'
              ? 'bg-white text-black'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Yearly · $9
          <span className="ml-1 text-green-500 text-xs">Save 25%</span>
        </button>
      </div>

      <button
        onClick={handleSubscribe}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-sky-500 to-purple-500 hover:from-sky-600 hover:to-purple-600 text-white py-3 px-4 rounded-lg font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CreditCard className="w-4 h-4" />
        )}
        Subscribe Now
      </button>

      <p className="text-zinc-500 text-xs text-center mt-3">
        Secure payment via Stripe. Cancel anytime.
      </p>
    </div>
  );
}
