'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Heart, ShieldCheck, Sparkles, Coffee } from 'lucide-react';
import { createPayHubCheckoutUrl } from '@/lib/pay-hub';

interface SupportBoxProps {
  articleId?: string;
  articleTitle?: string;
  authorName?: string;
  authorId?: string;
}

export default function SupportBox({
  articleId,
  articleTitle,
  authorName,
  authorId,
}: SupportBoxProps) {
  const { data: session } = useSession();
  const [currency, setCurrency] = useState<'USD' | 'HTG'>('USD');
  const [selectedAmount, setSelectedAmount] = useState<number>(5);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const presetsUSD = [2, 5, 10, 25];
  const presetsHTG = [250, 500, 1000, 2500];

  const currentPresets = currency === 'USD' ? presetsUSD : presetsHTG;

  const handleSupport = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (!amount || amount <= 0) {
      setLoading(false);
      return;
    }

    const currentOrigin =
      typeof window !== 'undefined' ? window.location.origin : 'https://press.bittonik.com';
    const currentPath = typeof window !== 'undefined' ? window.location.href : currentOrigin;

    const description = authorName
      ? `Soutien rédaction PressTonik - Reportage de ${authorName}`
      : 'Soutien au journalisme indépendant PressTonik Ayiti';

    const checkoutUrl = createPayHubCheckoutUrl({
      userId: session?.user?.id,
      email: session?.user?.email || undefined,
      fullName: session?.user?.name || undefined,
      amount,
      currency,
      purpose: 'DONATION',
      description,
      returnUrl: `${currentPath}${currentPath.includes('?') ? '&' : '?'}donation=success`,
      cancelUrl: currentPath,
      metadata: {
        articleId,
        articleTitle,
        authorName,
        authorId,
        type: 'DONATION',
      },
    });

    window.location.href = checkoutUrl;
  };

  return (
    <div className="my-8 bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-emerald-950/20 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
      {/* Glow décoratif */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Heart className="w-5 h-5 fill-emerald-500/20 text-emerald-400" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                Soutenir ce journalisme indépendant
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {authorName
                  ? `Encouragez ${authorName} et l'équipe de rédaction dans leurs enquêtes.`
                  : "Votre contribution garantit notre indépendance éditoriale."}
              </p>
            </div>
          </div>

          {/* Sélecteur de Devise */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setCurrency('USD');
                setSelectedAmount(5);
                setCustomAmount('');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                currency === 'USD'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              $ USD
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrency('HTG');
                setSelectedAmount(500);
                setCustomAmount('');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                currency === 'HTG'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Gourdes (HTG)
            </button>
          </div>
        </div>

        {/* Boutons Montants Prédéfinis */}
        <div className="space-y-3">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Coffee className="w-3.5 h-3.5 text-amber-400" /> Choisissez votre contribution :
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {currentPresets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setSelectedAmount(val);
                  setCustomAmount('');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border transition-all ${
                  selectedAmount === val && !customAmount
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-950/30 ring-1 ring-emerald-400/50'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                {val} {currency === 'USD' ? '$' : 'HTG'}
              </button>
            ))}
          </div>

          {/* Montant personnalisé */}
          <div className="pt-1 flex items-center gap-3">
            <input
              type="number"
              min="1"
              placeholder={`Autre montant (${currency})...`}
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="flex-grow bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              type="button"
              onClick={handleSupport}
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              {loading ? 'Redirection...' : 'Soutenir'}
            </button>
          </div>
        </div>

        {/* Moyens de paiement acceptés (MonCash, CB, PayPal) */}
        <div className="pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Paiement sécurisé via BitTonik Pay-Hub
          </span>
          <div className="flex items-center gap-2 font-bold text-slate-400 uppercase tracking-widest text-[9px]">
            <span>MonCash (HTG)</span>
            <span>•</span>
            <span>Visa / Mastercard</span>
            <span>•</span>
            <span>PayPal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
