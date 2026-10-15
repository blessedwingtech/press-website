'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Crown, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { createPayHubCheckoutUrl } from '@/lib/pay-hub';

interface SubscriptionCardProps {
  currentUser?: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  } | null;
}

export default function SubscriptionCard({ currentUser }: SubscriptionCardProps) {
  const router = useRouter();
  const [currency, setCurrency] = useState<'USD' | 'HTG'>('USD');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const isVip = currentUser?.role === 'reader_vip' || currentUser?.role === 'admin';

  const prices = {
    monthly: {
      USD: 4.99,
      HTG: 650,
    },
    yearly: {
      USD: 39.99,
      HTG: 5200,
    },
  };

  const handleSubscribe = (planType: 'monthly' | 'yearly') => {
    if (!currentUser) {
      router.push('/login?callbackUrl=/abonnement');
      return;
    }

    setLoadingPlan(planType);

    const amount = prices[planType][currency];
    const currentOrigin =
      typeof window !== 'undefined' ? window.location.origin : 'https://press.bittonik.com';

    const checkoutUrl = createPayHubCheckoutUrl({
      userId: currentUser.id,
      email: currentUser.email || undefined,
      fullName: currentUser.name || undefined,
      amount,
      currency,
      purpose: 'SUBSCRIPTION',
      description:
        planType === 'yearly'
          ? 'Abonnement Annuel PressTonik VIP (12 mois)'
          : 'Abonnement Mensuel PressTonik VIP',
      returnUrl: `${currentOrigin}/profile?subscription=success`,
      cancelUrl: `${currentOrigin}/abonnement`,
      metadata: {
        type: 'SUBSCRIPTION',
        target_role: 'reader_vip',
        plan: planType,
      },
    });

    window.location.href = checkoutUrl;
  };

  return (
    <div className="space-y-8">
      {/* Sélecteur de Devise */}
      <div className="flex justify-center items-center gap-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Devise :</span>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 inline-flex">
          <button
            type="button"
            onClick={() => setCurrency('USD')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currency === 'USD'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            $ Dollars US
          </button>
          <button
            type="button"
            onClick={() => setCurrency('HTG')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currency === 'HTG'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Gourdes Haïtiennes (HTG)
          </button>
        </div>
      </div>

      {/* Grille des 3 Cartes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {/* 1. Formule Gratuite */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Accès de base
              </span>
              <h3 className="text-xl font-black text-white mt-1">Lecteur Libre</h3>
              <p className="text-xs text-slate-400 mt-1">Pour suivre le fil d'actualité au quotidien.</p>
            </div>

            <div className="py-4 border-y border-slate-800/80">
              <span className="text-3xl font-black text-white">0 {currency === 'USD' ? '$' : 'HTG'}</span>
              <span className="text-xs text-slate-500 block mt-1 font-semibold">Gratuit pour toujours</span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-350">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Accès aux articles d'actualités générales</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Notation et avis des lecteurs</span>
              </li>
              <li className="flex items-center gap-2 text-slate-500">
                <span className="w-4 h-4 text-slate-600 font-black text-center shrink-0">✕</span>
                <span className="line-through">Lecture sans publicité</span>
              </li>
              <li className="flex items-center gap-2 text-slate-500">
                <span className="w-4 h-4 text-slate-600 font-black text-center shrink-0">✕</span>
                <span className="line-through">Dossiers d'investigation exclusifs</span>
              </li>
              <li className="flex items-center gap-2 text-slate-500">
                <span className="w-4 h-4 text-slate-600 font-black text-center shrink-0">✕</span>
                <span className="line-through">Badge membre VIP officiel</span>
              </li>
            </ul>
          </div>

          <div className="pt-4">
            <span className="block text-center py-3 px-4 rounded-xl text-xs font-bold bg-slate-950 border border-slate-800 text-slate-500 cursor-not-allowed">
              Formule Actuelle
            </span>
          </div>
        </div>

        {/* 2. Formule Mensuelle VIP */}
        <div className="bg-slate-900/60 border border-slate-700/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 relative hover:border-slate-600 transition-all">
          <div className="space-y-4">
            <div>
              <span className="text-teal-400 font-extrabold uppercase tracking-wider text-[10px]">
                Sans engagement
              </span>
              <h3 className="text-xl font-black text-white mt-1">PressTonik VIP Mensuel</h3>
              <p className="text-xs text-slate-400 mt-1">Liberté totale, résiliable à tout moment.</p>
            </div>

            <div className="py-4 border-y border-slate-800/80">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">
                  {prices.monthly[currency]} {currency === 'USD' ? '$' : 'HTG'}
                </span>
                <span className="text-xs text-slate-400 font-semibold">/ mois</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">Facturation mensuelle sans tacite reconduction forcée</span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2 font-semibold">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Expérience 100% sans publicité</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Dossiers d'investigation exclusifs</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Badge VIP sur votre profil</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Alertes WhatsApp & Email VIP</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Paiement MonCash, CB ou PayPal</span>
              </li>
            </ul>
          </div>

          <div className="pt-4">
            <button
              type="button"
              disabled={isVip || loadingPlan === 'monthly'}
              onClick={() => handleSubscribe('monthly')}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-white transition-all border border-slate-700 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loadingPlan === 'monthly' ? (
                'Connexion à Pay-Hub...'
              ) : isVip ? (
                'Actuellement Actif'
              ) : (
                <>
                  Choisir Mensuel <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. Formule Annuelle VIP (BEST VALUE) */}
        <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/40 border-2 border-emerald-500 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 relative shadow-2xl shadow-emerald-950/50 hover:scale-[1.01] transition-all">
          {/* Badge Populaire */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-[10px] uppercase tracking-widest px-4 py-1 rounded-full shadow-lg flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" /> Meilleure Offre (-33%)
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <span className="text-amber-400 font-extrabold uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 fill-amber-400" /> Recommandé
              </span>
              <h3 className="text-xl font-black text-white mt-1">PressTonik VIP Annuel</h3>
              <p className="text-xs text-slate-400 mt-1">2 mois offerts + Tous les privilèges VIP.</p>
            </div>

            <div className="py-4 border-y border-emerald-550/30">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-emerald-400">
                  {prices.yearly[currency]} {currency === 'USD' ? '$' : 'HTG'}
                </span>
                <span className="text-xs text-slate-350 font-semibold">/ an</span>
              </div>
              <span className="text-[10px] text-emerald-400/90 font-bold block mt-1">
                Soit l'équivalent de {(prices.yearly[currency] / 12).toFixed(1)} {currency}/mois
              </span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-200">
              <li className="flex items-center gap-2 font-bold text-emerald-350">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Expérience 100% sans publicité</span>
              </li>
              <li className="flex items-center gap-2 font-semibold">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Tous les dossiers d'investigation</span>
              </li>
              <li className="flex items-center gap-2 font-semibold">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Synthèse audio & mode lecture zen</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Badge VIP Doré officiel</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Accès prioritaire aux évènements & débats</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Support VIP dédié 7j/7</span>
              </li>
            </ul>
          </div>

          <div className="pt-4">
            <button
              type="button"
              disabled={isVip || loadingPlan === 'yearly'}
              onClick={() => handleSubscribe('yearly')}
              className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.02]"
            >
              {loadingPlan === 'yearly' ? (
                'Connexion à Pay-Hub...'
              ) : isVip ? (
                'Actuellement Actif'
              ) : (
                <>
                  <Crown className="w-4 h-4 fill-slate-950" />
                  Devenir Membre Annuel <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Garantie */}
      <div className="text-center flex justify-center items-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Paiement sécurisé et chiffré par BitTonik Pay-Hub. Aucune donnée bancaire n'est stockée sur nos serveurs.</span>
      </div>
    </div>
  );
}
