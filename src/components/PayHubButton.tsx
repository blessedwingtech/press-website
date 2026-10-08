'use client';

import { useSession } from 'next-auth/react';
import { createPayHubCheckoutUrl, PayHubCheckoutOptions } from '@/lib/pay-hub';
import { CreditCard } from 'lucide-react';

interface PayHubButtonProps {
  amount: number;
  currency?: 'USD' | 'HTG' | 'EUR';
  purpose: 'SUBSCRIPTION' | 'ONE_TIME' | 'DONATION' | 'PAYOUT';
  description: string;
  metadata?: Record<string, any>;
  children?: React.ReactNode;
  className?: string;
}

export default function PayHubButton({
  amount,
  currency = 'USD',
  purpose,
  description,
  metadata = {},
  children,
  className = 'inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-950/30',
}: PayHubButtonProps) {
  const { data: session } = useSession();

  const handleCheckout = () => {
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://press.bittonik.com';
    const currentPath = typeof window !== 'undefined' ? window.location.href : currentOrigin;

    const options: PayHubCheckoutOptions = {
      userId: session?.user?.id,
      email: session?.user?.email || undefined,
      fullName: session?.user?.name || undefined,
      amount,
      currency,
      purpose,
      description,
      returnUrl: `${currentOrigin}/profile?payment=success`,
      cancelUrl: currentPath,
      metadata,
    };

    const checkoutUrl = createPayHubCheckoutUrl(options);
    window.location.href = checkoutUrl;
  };

  return (
    <button type="button" onClick={handleCheckout} className={className}>
      {children || (
        <>
          <CreditCard className="w-4 h-4" />
          <span>Procéder au paiement ({amount} {currency})</span>
        </>
      )}
    </button>
  );
}
