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
} from 'lucide-react';
import { updateJournalistProfile, requestPayoutAction } from '@/app/journalist/actions';

interface JournalistMonetizationProps {
  balanceHTG: number;
  balanceUSD: number;
  donationsCount: number;
  initialWhatsappChannel: string | null;
  initialBio: string | null;
  initialTwitter: string | null;
}

export default function JournalistMonetizationCard({
  balanceHTG,
  balanceUSD,
  donationsCount,
  initialWhatsappChannel,
  initialBio,
  initialTwitter,
}: JournalistMonetizationProps) {
  // Profil état
  const [whatsappChannel, setWhatsappChannel] = useState(initialWhatsappChannel || '');
  const [bio, setBio] = useState(initialBio || '');
  const [twitter, setTwitter] = useState(initialTwitter || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Payout état
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [payoutCurrency, setPayoutCurrency] = useState<'HTG' | 'USD'>('HTG');
  const [payoutAmount, setPayoutAmount] = useState<string>('');
  const [payoutMethod, setPayoutMethod] = useState<'MONCASH' | 'BANK_TRANSFER'>('MONCASH');
  const [payoutDetails, setPayoutDetails] = useState<string>('');
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutMsg, setPayoutMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
      if (!payoutDetails.trim()) {
        throw new Error('Veuillez indiquer les coordonnées (ex: numéro MonCash ou IBAN)');
      }

      await requestPayoutAction({
        amount,
        currency: payoutCurrency,
        method: payoutMethod,
        methodDetails: payoutDetails,
      });

      setPayoutMsg({
        type: 'success',
        text: `Demande de ${amount} ${payoutCurrency} soumise avec succès ! Vous recevrez les fonds sous 24-48h.`,
      });
      setPayoutAmount('');
      setPayoutDetails('');
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Carte Monétisation & Solde (85% Journaliste / 15% PressTonik) */}
      <div className="lg:col-span-1 bg-gradient-to-br from-slate-900/90 to-emerald-950/20 border border-emerald-500/30 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-5">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Wallet className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              85% Net Auteur
            </span>
          </div>

          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Vos Gains & Pourboires Disponibles
            </p>
            <div className="mt-2 space-y-1">
              <p className="text-2xl font-black text-white">
                {balanceHTG.toLocaleString('fr-FR')} <span className="text-xs text-emerald-400 font-bold">HTG</span>
              </p>
              <p className="text-sm font-bold text-slate-350">
                {balanceUSD.toFixed(2)} <span className="text-xs text-slate-500 font-semibold">$ USD</span>
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-3 flex items-center justify-between">
            <span>Soutiens reçus : <strong className="text-white">{donationsCount}</strong></span>
            <span className="text-slate-500 text-[10px] flex items-center gap-1" title="15% retenus pour les frais de passerelle et l'hébergement PressTonik">
              <HelpCircle className="w-3 h-3" /> Frais 15%
            </span>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setPayoutOpen(!payoutOpen)}
            disabled={balanceHTG <= 0 && balanceUSD <= 0}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-950/40 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            {payoutOpen ? 'Fermer le formulaire' : 'Demander un Payout'}
          </button>
        </div>
      </div>

      {/* 2. Formulaire Payout (si ouvert) OU Configuration Canal WhatsApp & Bio */}
      <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        {payoutOpen ? (
          <form onSubmit={handlePayoutSubmit} className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-emerald-400" /> Demande de Reversement (Payout)
              </h3>
              <span className="text-[10px] text-slate-400">
                Solde max : <strong className="text-emerald-400">{maxBalance} {payoutCurrency}</strong>
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
                {payoutMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{payoutMsg.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Devise
                </label>
                <select
                  value={payoutCurrency}
                  onChange={(e) => setPayoutCurrency(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="HTG">Gourdes (HTG) - MonCash</option>
                  <option value="USD">Dollars (USD) - Virement/PayPal</option>
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
                  placeholder={`Max: ${maxBalance}`}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Mode de Réception
              </label>
              <select
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="MONCASH">MonCash (Recommandé en Haïti)</option>
                <option value="BANK_TRANSFER">Virement Bancaire (Sogebank / Unibank / Autre)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                {payoutMethod === 'MONCASH'
                  ? 'Numéro de Téléphone MonCash (+509...)'
                  : 'Coordonnées Bancaires / Numéro de compte'}
              </label>
              <input
                type="text"
                required
                placeholder={payoutMethod === 'MONCASH' ? 'Ex: +509 3700 0000' : 'Banque, Nom exact, Numéro de compte'}
                value={payoutDetails}
                onChange={(e) => setPayoutDetails(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

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
                className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-50"
              >
                {payoutLoading ? 'Traitement...' : 'Confirmer le Retrait'}
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
  );
}
