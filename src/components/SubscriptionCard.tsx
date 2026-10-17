'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  Crown,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Tag,
  Loader2,
  Gift,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { createPayHubCheckoutUrl } from '@/lib/pay-hub';
import {
  validatePromoCodeAction,
  applyFreePromoCodeAction,
  PromoValidationResult,
} from '@/app/actions/promo';

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

  // Gestion des Codes Promo
  const [promoInput, setPromoInput] = useState('');
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<PromoValidationResult | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  // Calcul du prix après éventuelle réduction promo
  const computeFinalPrice = (basePrice: number) => {
    if (!appliedPromo || !appliedPromo.valid) return basePrice;
    if (appliedPromo.isFree) return 0;
    if (appliedPromo.discountType === 'PERCENT') {
      const discounted = basePrice * (1 - (appliedPromo.discountValue || 0) / 100);
      return Math.max(0, Math.round(discounted * 100) / 100);
    }
    return Math.max(0, Math.round((basePrice - (appliedPromo.discountValue || 0)) * 100) / 100);
  };

  const currentMonthlyPrice = computeFinalPrice(prices.monthly[currency]);
  const currentYearlyPrice = computeFinalPrice(prices.yearly[currency]);

  // Validation du code promo
  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    setValidatingPromo(true);
    setPromoError(null);

    try {
      const res = await validatePromoCodeAction(
        promoInput.trim(),
        prices.monthly[currency],
        'SUBSCRIPTION_VIP'
      );

      if (res.valid) {
        setAppliedPromo(res);
        setPromoError(null);
      } else {
        setAppliedPromo(null);
        setPromoError(res.error || 'Code promo invalide.');
      }
    } catch (err: any) {
      setPromoError(err.message || 'Erreur lors de la validation.');
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError(null);
  };

  // Souscription ou Validation Immédiate si 100% Gratuit
  const handleSubscribe = async (planType: 'monthly' | 'yearly') => {
    if (!currentUser) {
      router.push('/login?callbackUrl=/abonnement');
      return;
    }

    setLoadingPlan(planType);
    setPromoError(null);

    // CAS EXCLUSIF : RÉDUCTION À 100% -> VALIDATION IMMÉDIATE SANS PASSERELLE
    if (appliedPromo && appliedPromo.isFree) {
      try {
        const res = await applyFreePromoCodeAction({
          code: appliedPromo.code!,
          targetPlan: 'SUBSCRIPTION_VIP',
          planDuration: planType,
        });

        if (res.success) {
          setSuccessMsg(res.message || 'Abonnement VIP activé immédiatement avec succès !');
          setTimeout(() => {
            router.push('/profile?subscription=success');
            router.refresh();
          }, 1800);
          return;
        } else {
          setPromoError(res.error || 'Échec de la validation du code 100%.');
          setLoadingPlan(null);
          return;
        }
      } catch (err: any) {
        setPromoError(err.message || 'Erreur lors de l\'activation immédiate.');
        setLoadingPlan(null);
        return;
      }
    }

    // CAS STANDARD OU REMISE PARTIELLE (< 100%) -> PASSAGE SÉCURISÉ PAR PAY-HUB
    const amount = planType === 'yearly' ? currentYearlyPrice : currentMonthlyPrice;
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
          ? `Abonnement Annuel VIP (12 mois)${appliedPromo ? ` [Code ${appliedPromo.code}]` : ''}`
          : `Abonnement Mensuel VIP${appliedPromo ? ` [Code ${appliedPromo.code}]` : ''}`,
      returnUrl: `${currentOrigin}/profile?subscription=success`,
      cancelUrl: `${currentOrigin}/abonnement`,
      metadata: {
        type: 'SUBSCRIPTION',
        target_role: 'reader_vip',
        plan: planType,
        promoCode: appliedPromo?.code || null,
        discountApplied: appliedPromo ? appliedPromo.discountValue : 0,
      },
    });

    window.location.href = checkoutUrl;
  };

  return (
    <div className="space-y-8">
      {/* Message de succès immédiat si code 100% */}
      {successMsg && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500 text-emerald-300 flex items-center gap-3 animate-in fade-in duration-200 shadow-xl shadow-emerald-950/40">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <strong className="block text-sm font-black text-white mb-0.5">Offre Validée Immédiatement !</strong>
            <span className="text-xs">{successMsg}</span>
          </div>
        </div>
      )}

      {/* Barre d'outils : Sélecteur de Devise & Code Promo */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        {/* Sélecteur de Devise */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Devise :</span>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-1 inline-flex">
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
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
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currency === 'HTG'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Gourdes (HTG)
            </button>
          </div>
        </div>

        {/* Section Code Promo */}
        <div className="w-full md:w-auto">
          {appliedPromo ? (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 rounded-xl">
              <Tag className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <span className="font-mono font-black text-emerald-300">{appliedPromo.code}</span>
                <span className="text-emerald-400 font-bold ml-1.5">
                  ({appliedPromo.isFree ? '100% OFF (Gratuit)' : `-${appliedPromo.discountValue}${appliedPromo.discountType === 'PERCENT' ? '%' : '$'}`})
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemovePromo}
                className="ml-2 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
                title="Retirer ce code promo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyPromo} className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-48">
                <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => {
                    setPromoInput(e.target.value.toUpperCase());
                    setPromoError(null);
                  }}
                  placeholder="Code promo..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={validatingPromo || !promoInput.trim()}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition disabled:opacity-40 cursor-pointer shrink-0"
              >
                {validatingPromo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Appliquer'}
              </button>
            </form>
          )}
        </div>
      </div>

      {promoError && (
        <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{promoError}</span>
        </div>
      )}

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
        <div className={`bg-slate-900/60 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 relative transition-all border ${
          appliedPromo ? 'border-amber-500/40' : 'border-slate-700/80 hover:border-slate-600'
        }`}>
          <div className="space-y-4">
            <div>
              <span className="text-teal-400 font-extrabold uppercase tracking-wider text-[10px]">
                Sans engagement
              </span>
              <h3 className="text-xl font-black text-white mt-1">PressTonik VIP Mensuel</h3>
              <p className="text-xs text-slate-400 mt-1">Liberté totale, résiliable à tout moment.</p>
            </div>

            <div className="py-4 border-y border-slate-800/80">
              <div className="flex items-baseline gap-2">
                {appliedPromo && currentMonthlyPrice !== prices.monthly[currency] ? (
                  <>
                    <span className="text-3xl font-black text-amber-400">
                      {currentMonthlyPrice === 0 ? 'GRATUIT' : `${currentMonthlyPrice} ${currency === 'USD' ? '$' : 'HTG'}`}
                    </span>
                    <span className="text-sm line-through text-slate-500">
                      {prices.monthly[currency]} {currency === 'USD' ? '$' : 'HTG'}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-black text-white">
                    {prices.monthly[currency]} {currency === 'USD' ? '$' : 'HTG'}
                  </span>
                )}
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
                <span>Synthèse Audio TTS & Mode Zen</span>
              </li>
            </ul>
          </div>

          <div className="pt-4">
            <button
              type="button"
              disabled={isVip || loadingPlan === 'monthly'}
              onClick={() => handleSubscribe('monthly')}
              className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                appliedPromo?.isFree
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-950/40 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
            >
              {loadingPlan === 'monthly' ? (
                appliedPromo?.isFree ? 'Activation Immédiate...' : 'Connexion à Pay-Hub...'
              ) : isVip ? (
                'Actuellement Actif'
              ) : appliedPromo?.isFree ? (
                <>
                  <Gift className="w-4 h-4" />
                  Activer Immédiatement (100% Gratuit)
                </>
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
              <div className="flex items-baseline gap-2">
                {appliedPromo && currentYearlyPrice !== prices.yearly[currency] ? (
                  <>
                    <span className="text-3xl font-black text-emerald-400">
                      {currentYearlyPrice === 0 ? 'GRATUIT' : `${currentYearlyPrice} ${currency === 'USD' ? '$' : 'HTG'}`}
                    </span>
                    <span className="text-sm line-through text-slate-500">
                      {prices.yearly[currency]} {currency === 'USD' ? '$' : 'HTG'}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-black text-emerald-400">
                    {prices.yearly[currency]} {currency === 'USD' ? '$' : 'HTG'}
                  </span>
                )}
                <span className="text-xs text-slate-350 font-semibold">/ an</span>
              </div>
              <span className="text-[10px] text-emerald-400/90 font-bold block mt-1">
                {appliedPromo?.isFree
                  ? 'Offre spéciale 100% offerte par la rédaction'
                  : `Soit l'équivalent de ${(currentYearlyPrice / 12).toFixed(1)} ${currency}/mois`}
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
                <span>Support VIP dédié 7j/7</span>
              </li>
            </ul>
          </div>

          <div className="pt-4">
            <button
              type="button"
              disabled={isVip || loadingPlan === 'yearly'}
              onClick={() => handleSubscribe('yearly')}
              className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.02] ${
                appliedPromo?.isFree
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-950/60 animate-pulse'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/60'
              }`}
            >
              {loadingPlan === 'yearly' ? (
                appliedPromo?.isFree ? 'Activation Immédiate...' : 'Connexion à Pay-Hub...'
              ) : isVip ? (
                'Actuellement Actif'
              ) : appliedPromo?.isFree ? (
                <>
                  <Gift className="w-4 h-4 fill-slate-950" />
                  Activer Immédiatement (100% Gratuit)
                </>
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
