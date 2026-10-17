'use client';

import React, { useState } from 'react';
import {
  Wallet,
  MessageCircle,
  TrendingUp,
  ArrowUpRight,
  Save,
  Check,
  AlertCircle,
  HelpCircle,
  Smartphone,
  CreditCard,
  Building,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { updateJournalistProfile, requestPayoutAction } from '@/app/journalist/actions';

export interface PayoutHistoryItem {
  id: string;
  amount: number;
  currency: string;
  method: string;
  methodDetails: string;
  status: string;
  note?: string | null;
  createdAt: string | Date;
}

interface JournalistMonetizationProps {
  balanceHTG: number;
  balanceUSD: number;
  donationsCount: number;
  initialWhatsappChannel: string | null;
  initialBio: string | null;
  initialTwitter: string | null;
  recentPayouts?: PayoutHistoryItem[];
  isPro?: boolean;
  proExpiresAt?: string | Date | null;
}

type PayoutMethodType = 'MONCASH' | 'PAYPAL' | 'CARD' | 'BANK_TRANSFER';

export default function JournalistMonetizationCard({
  balanceHTG,
  balanceUSD,
  donationsCount,
  initialWhatsappChannel,
  initialBio,
  initialTwitter,
  recentPayouts = [],
  isPro = false,
  proExpiresAt,
}: JournalistMonetizationProps) {
  // Profil état
  const [whatsappChannel, setWhatsappChannel] = useState(initialWhatsappChannel || '');
  const [bio, setBio] = useState(initialBio || '');
  const [twitter, setTwitter] = useState(initialTwitter || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Payout état
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethodType>('MONCASH');
  const [payoutCurrency, setPayoutCurrency] = useState<'HTG' | 'USD'>('HTG');
  const [payoutAmount, setPayoutAmount] = useState<string>('');

  // Détails spécifiques selon le mode
  const [moncashPhone, setMoncashPhone] = useState('');
  const [moncashName, setMoncashName] = useState('');

  const [paypalEmail, setPaypalEmail] = useState('');
  const [paypalName, setPaypalName] = useState('');

  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');

  const [bankName, setBankName] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankSwift, setBankSwift] = useState('');

  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutMsg, setPayoutMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Changer de méthode ajuste intelligemment la devise par défaut
  const handleSelectMethod = (method: PayoutMethodType) => {
    setPayoutMethod(method);
    if (method === 'MONCASH') {
      setPayoutCurrency('HTG');
    } else if (method === 'PAYPAL') {
      setPayoutCurrency('USD');
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(false);
    try {
      await updateJournalistProfile({
        whatsappChannel,
        bio,
        twitter,
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Erreur de sauvegarde');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutLoading(true);
    setPayoutMsg(null);
    try {
      const amount = parseFloat(payoutAmount);
      if (!amount || amount <= 0) {
        throw new Error('Veuillez entrer un montant valide');
      }

      let formattedDetails = '';

      if (payoutMethod === 'MONCASH') {
        if (!moncashPhone.trim()) throw new Error('Veuillez saisir votre numéro MonCash');
        formattedDetails = `MonCash: ${moncashPhone.trim()}${moncashName.trim() ? ` (Titulaire: ${moncashName.trim()})` : ''}`;
      } else if (payoutMethod === 'PAYPAL') {
        if (!paypalEmail.trim()) throw new Error('Veuillez renseigner votre email PayPal');
        formattedDetails = `PayPal: ${paypalEmail.trim()}${paypalName.trim() ? ` (Nom: ${paypalName.trim()})` : ''}`;
      } else if (payoutMethod === 'CARD') {
        if (!cardNumber.trim() || !cardHolder.trim()) {
          throw new Error('Veuillez renseigner le titulaire et le numéro de la carte');
        }
        formattedDetails = `Carte: ${cardNumber.trim()} (Titulaire: ${cardHolder.trim()}${cardExpiry.trim() ? `, Exp: ${cardExpiry.trim()}` : ''})`;
      } else if (payoutMethod === 'BANK_TRANSFER') {
        if (!bankName.trim() || !bankAccountNumber.trim() || !bankAccountName.trim()) {
          throw new Error('Veuillez renseigner la banque, le titulaire et le numéro de compte');
        }
        formattedDetails = `Virement Bancaire - Banque: ${bankName.trim()} | Titulaire: ${bankAccountName.trim()} | Compte: ${bankAccountNumber.trim()}${bankSwift.trim() ? ` | Swift/BIC: ${bankSwift.trim()}` : ''}`;
      }

      await requestPayoutAction({
        amount,
        currency: payoutCurrency,
        method: payoutMethod,
        methodDetails: formattedDetails,
      });

      setPayoutMsg({
        type: 'success',
        text: `Demande de ${amount} ${payoutCurrency} soumise avec succès ! Vous recevrez vos fonds sous 24-48h.`,
      });

      // Réinitialiser le formulaire
      setPayoutAmount('');
      setMoncashPhone('');
      setMoncashName('');
      setPaypalEmail('');
      setPaypalName('');
      setCardHolder('');
      setCardNumber('');
      setBankName('');
      setBankAccountName('');
      setBankAccountNumber('');
    } catch (err: any) {
      setPayoutMsg({
        type: 'error',
        text: err.message || 'Erreur lors de la demande de reversement.',
      });
    } finally {
      setPayoutLoading(false);
    }
  };

  const maxBalance = payoutCurrency === 'HTG' ? balanceHTG : balanceUSD;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Carte Monétisation & Solde (95% PRO / 85% Standard) */}
        <div className={`lg:col-span-1 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-5 border ${
          isPro 
            ? 'bg-gradient-to-br from-amber-950/30 via-slate-900 to-amber-950/10 border-amber-500/40 shadow-amber-950/20' 
            : 'bg-gradient-to-br from-slate-900/90 to-emerald-950/20 border-emerald-500/30 shadow-emerald-950/20'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={`p-2 rounded-xl border ${
                isPro 
                  ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' 
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              }`}>
                <Wallet className="w-5 h-5" />
              </span>
              {isPro ? (
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1 shadow-sm">
                  ⭐ 95% Net Auteur (PRO)
                </span>
              ) : (
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  85% Net Auteur
                </span>
              )}
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Vos Gains & Pourboires Disponibles
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-2xl font-black text-white">
                  {balanceHTG.toLocaleString('fr-FR')} <span className={`text-xs font-bold ${isPro ? 'text-amber-400' : 'text-emerald-400'}`}>HTG</span>
                </p>
                <p className="text-sm font-bold text-slate-350">
                  {balanceUSD.toFixed(2)} <span className="text-xs text-slate-500 font-semibold">$ USD</span>
                </p>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-3 flex items-center justify-between">
              <span>Soutiens reçus : <strong className="text-white">{donationsCount}</strong></span>
              <span className="text-slate-500 text-[10px] flex items-center gap-1" title={isPro ? "Frais plateforme réduits à 5% pour les journalistes PRO" : "15% retenus pour la maintenance, passerelle Pay-Hub et sécurité"}>
                <HelpCircle className="w-3 h-3" /> Frais {isPro ? '5%' : '15%'}
              </span>
            </div>

            {isPro && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-[11px] text-amber-300 flex items-center gap-2">
                <span className="text-base">⚡</span>
                <div>
                  <strong className="block text-amber-200">Retrait Express Garanti</strong>
                  Traitement prioritaire en moins de 4 heures ouvré.
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={() => setPayoutOpen(!payoutOpen)}
              disabled={balanceHTG <= 0 && balanceUSD <= 0}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-950/40 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              {payoutOpen ? 'Fermer le formulaire' : 'Demander un Retrait (Payout)'}
            </button>
          </div>
        </div>

        {/* 2. Formulaire Payout Fluide (si ouvert) OU Configuration Canal WhatsApp & Bio */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          {payoutOpen ? (
            <form onSubmit={handlePayoutSubmit} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" /> Retrait de Fonds Multi-Méthodes
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Choisissez votre méthode préférée : MonCash, PayPal, Carte ou Virement Bancaire.
                  </p>
                </div>
                <span className="text-[10px] text-slate-400">
                  Solde max : <strong className="text-emerald-400">{maxBalance.toLocaleString()} {payoutCurrency}</strong>
                </span>
              </div>

              {payoutMsg && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    payoutMsg.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                  }`}
                >
                  {payoutMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{payoutMsg.text}</span>
                </div>
              )}

              {/* Sélection des méthodes de paiement */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Sélectionnez le mode de réception
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectMethod('MONCASH')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      payoutMethod === 'MONCASH'
                        ? 'bg-red-500/10 border-red-500 text-white shadow-lg shadow-red-950/40'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Smartphone className={`w-4 h-4 mb-2 ${payoutMethod === 'MONCASH' ? 'text-red-400' : 'text-slate-500'}`} />
                    <div>
                      <span className="text-xs font-black block">MonCash</span>
                      <span className="text-[9px] text-slate-500 block">Digicel Haïti (HTG)</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectMethod('PAYPAL')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      payoutMethod === 'PAYPAL'
                        ? 'bg-blue-500/10 border-blue-500 text-white shadow-lg shadow-blue-950/40'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <TrendingUp className={`w-4 h-4 mb-2 ${payoutMethod === 'PAYPAL' ? 'text-blue-400' : 'text-slate-500'}`} />
                    <div>
                      <span className="text-xs font-black block">PayPal</span>
                      <span className="text-[9px] text-slate-500 block">Diaspora / USD</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectMethod('CARD')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      payoutMethod === 'CARD'
                        ? 'bg-purple-500/10 border-purple-500 text-white shadow-lg shadow-purple-950/40'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <CreditCard className={`w-4 h-4 mb-2 ${payoutMethod === 'CARD' ? 'text-purple-400' : 'text-slate-500'}`} />
                    <div>
                      <span className="text-xs font-black block">Carte Bancaire</span>
                      <span className="text-[9px] text-slate-500 block">Stripe Payout</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectMethod('BANK_TRANSFER')}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      payoutMethod === 'BANK_TRANSFER'
                        ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-950/40'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Building className={`w-4 h-4 mb-2 ${payoutMethod === 'BANK_TRANSFER' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <div>
                      <span className="text-xs font-black block">Virement</span>
                      <span className="text-[9px] text-slate-500 block">Banque / SPIH</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Devise et Montant */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Devise de Retrait
                  </label>
                  <select
                    value={payoutCurrency}
                    onChange={(e) => setPayoutCurrency(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="HTG">Gourdes (HTG)</option>
                    <option value="USD">Dollars ($ USD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Montant à retirer ({payoutCurrency})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={maxBalance}
                    step="0.01"
                    required
                    placeholder={`Max disponible: ${maxBalance.toLocaleString()}`}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Champs dynamiques selon la méthode choisie */}
              {payoutMethod === 'MONCASH' && (
                <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                    <Smartphone className="w-4 h-4" /> Coordonnées MonCash (Digicel Haïti)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Numéro MonCash (+509...)
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+509 3700 0000"
                        value={moncashPhone}
                        onChange={(e) => setMoncashPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Nom du Titulaire MonCash (Optionnel)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Jean Baptiste"
                        value={moncashName}
                        onChange={(e) => setMoncashName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {payoutMethod === 'PAYPAL' && (
                <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                    <TrendingUp className="w-4 h-4" /> Coordonnées PayPal International
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Email du Compte PayPal
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="votre-paypal@email.com"
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Nom complet du Titulaire
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Jean Baptiste"
                        value={paypalName}
                        onChange={(e) => setPaypalName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {payoutMethod === 'CARD' && (
                <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                    <CreditCard className="w-4 h-4" /> Carte Bancaire / Débit Direct (Stripe Payout)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Numéro de la Carte ou Identifiant RIB
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="4532 •••• •••• 8890"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Titulaire
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Jean Baptiste"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Transféré de manière sécurisée via la passerelle certifiée PCI-DSS BitTonik Pay-Hub.
                  </p>
                </div>
              )}

              {payoutMethod === 'BANK_TRANSFER' && (
                <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <Building className="w-4 h-4" /> Coordonnées Bancaires Complètes
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Nom de la Banque
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Sogebank, Unibank, BUH, Citibank..."
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Nom exact du Titulaire de Compte
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nom prénom ou Raison sociale"
                        value={bankAccountName}
                        onChange={(e) => setBankAccountName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Numéro de Compte Bancaire / IBAN
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Numéro de compte ou IBAN"
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Code SWIFT / BIC (Optionnel)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: SOGEHTPP"
                        value={bankSwift}
                        onChange={(e) => setBankSwift(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayoutOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={payoutLoading}
                  className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-50 transition-colors shadow-md shadow-emerald-950/40 cursor-pointer"
                >
                  {payoutLoading ? 'Envoi en cours...' : 'Confirmer la Demande de Retrait'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    Votre Communauté & Canal WhatsApp Personnel
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Ce canal sera affiché automatiquement sur vos articles pour fidéliser vos lecteurs.
                  </p>
                </div>
                {profileSuccess && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> Enregistré
                  </span>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Lien de votre Canal / Groupe WhatsApp Personnel
                </label>
                <input
                  type="url"
                  placeholder="https://chat.whatsapp.com/..."
                  value={whatsappChannel}
                  onChange={(e) => setWhatsappChannel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <span className="block text-[10px] text-slate-500 mt-1">
                  Exemple : Lien d'invitation à votre chaîne WhatsApp publique ou groupe d'alertes.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Courte Biographie Auteur
                  </label>
                  <input
                    type="text"
                    placeholder="Journaliste d'investigation économique..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Identifiant Twitter / X
                  </label>
                  <input
                    type="text"
                    placeholder="@mon_compte"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5 text-emerald-400" />
                  {savingProfile ? 'Enregistrement...' : 'Enregistrer mon profil'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* 3. Historique Récent des Demandes de Retrait (Payouts) */}
      {recentPayouts.length > 0 && (
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <h4 className="text-xs font-black text-slate-350 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Historique Récent de vos Demandes de Retrait
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 text-[10px] uppercase font-bold text-slate-500">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Montant</th>
                  <th className="py-2.5 px-3">Méthode</th>
                  <th className="py-2.5 px-3">Coordonnées</th>
                  <th className="py-2.5 px-3 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {recentPayouts.map((p) => {
                  const dateStr = typeof p.createdAt === 'string'
                    ? new Date(p.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
                    : p.createdAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

                  let statusBadge = (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Clock className="w-3 h-3" /> En attente
                    </span>
                  );
                  if (p.status === 'COMPLETED') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Transféré
                      </span>
                    );
                  } else if (p.status === 'REJECTED') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <XCircle className="w-3 h-3" /> Refusé
                      </span>
                    );
                  }

                  return (
                    <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-2.5 px-3 text-slate-400">{dateStr}</td>
                      <td className="py-2.5 px-3 font-bold text-white">
                        {p.amount.toLocaleString()} <span className="text-[10px] text-emerald-400">{p.currency}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-300">
                          {p.method === 'MONCASH'
                            ? 'MonCash'
                            : p.method === 'PAYPAL'
                            ? 'PayPal'
                            : p.method === 'CARD'
                            ? 'Carte'
                            : 'Virement'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px] truncate max-w-xs" title={p.methodDetails}>
                        {p.methodDetails}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {statusBadge}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
