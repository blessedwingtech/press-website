'use client';

import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Percent,
  Check,
  X,
  Copy,
  Trash2,
  Calendar,
  Sparkles,
  Users,
  ShieldCheck,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Gift,
} from 'lucide-react';
import {
  createPromoCodeAction,
  togglePromoCodeStatusAction,
  deletePromoCodeAction,
} from '@/app/admin/promos/actions';

export interface PromoCodeItem {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  targetPlan: string;
  expiresAt: string | Date | null;
  createdAt: string | Date;
  _count?: {
    usages: number;
  };
}

export default function AdminPromosClient({
  initialPromos,
}: {
  initialPromos: PromoCodeItem[];
}) {
  const [promos, setPromos] = useState<PromoCodeItem[]>(initialPromos);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Formulaire d'ajout
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENT' | 'FIXED'>('PERCENT');
  const [discountValue, setDiscountValue] = useState<number>(100);
  const [maxUses, setMaxUses] = useState<string>('');
  const [targetPlan, setTargetPlan] = useState('ALL');
  const [expiresAt, setExpiresAt] = useState('');

  const handleCopy = (c: string) => {
    navigator.clipboard.writeText(c);
    setCopiedCode(c);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await createPromoCodeAction({
        code,
        description,
        discountType,
        discountValue: Number(discountValue),
        maxUses: maxUses ? parseInt(maxUses, 10) : null,
        targetPlan,
        expiresAt: expiresAt || null,
      });

      if (res.success) {
        setPromos([res.promo as any, ...promos]);
        setIsModalOpen(false);
        // Reset
        setCode('');
        setDescription('');
        setDiscountValue(100);
        setMaxUses('');
        setExpiresAt('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de la création du code promo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setPromos(promos.map((p) => (p.id === id ? { ...p, active: nextStatus } : p)));
    try {
      await togglePromoCodeStatusAction(id, nextStatus);
    } catch (err: any) {
      alert(err.message || 'Erreur lors du changement de statut');
      setPromos(promos.map((p) => (p.id === id ? { ...p, active: currentStatus } : p)));
    }
  };

  const handleDelete = async (id: string, c: string) => {
    if (!confirm(`Supprimer définitivement le code promo "${c}" ?`)) return;

    setPromos(promos.filter((p) => p.id !== id));
    try {
      await deletePromoCodeAction(id);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression');
    }
  };

  // Statistiques
  const totalCodes = promos.length;
  const activeCodes = promos.filter((p) => p.active).length;
  const totalUsages = promos.reduce((sum, p) => sum + p.usedCount, 0);
  const freeCodes = promos.filter((p) => p.discountValue >= 100 && p.discountType === 'PERCENT').length;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-400" />
            Gestion des Codes Promo & Réductions
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Créez des remises partielles ou des codes à 100% qui valident les abonnements immédiatement sans passerelle bancaire.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Nouveau Code Promo
        </button>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Codes</span>
          <p className="text-2xl font-black text-white">{totalCodes}</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Codes Actifs</span>
          <p className="text-2xl font-black text-emerald-400">{activeCodes}</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Total Utilisations</span>
          <p className="text-2xl font-black text-cyan-400">{totalUsages}</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Codes 100% Gratuits</span>
          <p className="text-2xl font-black text-amber-400">{freeCodes}</p>
        </div>
      </div>

      {/* Tableau des codes promo */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-[10px] uppercase font-black tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Code Promo</th>
                <th className="py-3.5 px-4">Remise</th>
                <th className="py-3.5 px-4">Formule Cible</th>
                <th className="py-3.5 px-4">Utilisations / Quota</th>
                <th className="py-3.5 px-4">Expiration</th>
                <th className="py-3.5 px-4">Statut</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {promos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    Aucun code promo créé. Cliquez sur "Nouveau Code Promo" pour en créer un.
                  </td>
                </tr>
              ) : (
                promos.map((p) => {
                  const isHundred = p.discountType === 'PERCENT' && p.discountValue >= 100;
                  const isExpired = p.expiresAt && new Date(p.expiresAt) < new Date();

                  return (
                    <tr key={p.id} className="hover:bg-slate-900/40 transition">
                      {/* Code */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                            {p.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(p.code)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="Copier le code"
                          >
                            {copiedCode === p.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {p.description && (
                          <div className="text-[10px] text-slate-400 mt-1 max-w-xs truncate">
                            {p.description}
                          </div>
                        )}
                      </td>

                      {/* Remise */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isHundred ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-max">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            100% Gratuit (Immédiat)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                            -{p.discountValue}
                            {p.discountType === 'PERCENT' ? '%' : '$ USD'}
                          </span>
                        )}
                      </td>

                      {/* Formule Cible */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-[11px] font-bold text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {p.targetPlan === 'ALL'
                            ? 'Tous abonnements'
                            : p.targetPlan === 'SUBSCRIPTION_VIP'
                            ? 'VIP Lecteur'
                            : p.targetPlan === 'JOURNALIST_PRO'
                            ? 'PRO Journaliste'
                            : p.targetPlan}
                        </span>
                      </td>

                      {/* Utilisations */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className="font-bold text-white text-xs">
                            {p.usedCount}{' '}
                            <span className="text-slate-400 font-normal">
                              / {p.maxUses !== null ? p.maxUses : '∞ illimité'}
                            </span>
                          </span>
                          {p.maxUses !== null && (
                            <div className="w-24 bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                              <div
                                className="bg-emerald-500 h-full rounded-full"
                                style={{
                                  width: `${Math.min(100, (p.usedCount / p.maxUses) * 100)}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Expiration */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[11px]">
                        {p.expiresAt ? (
                          <span
                            className={
                              isExpired
                                ? 'text-red-400 font-bold'
                                : 'text-slate-350'
                            }
                          >
                            {new Date(p.expiresAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                            {isExpired && ' (Expiré)'}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">Sans limite</span>
                        )}
                      </td>

                      {/* Statut Toggle */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggle(p.id, p.active)}
                          className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border transition flex items-center gap-1 cursor-pointer ${
                            p.active && !isExpired
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                              : 'bg-slate-950 border-slate-800 text-slate-500'
                          }`}
                        >
                          {p.active && !isExpired ? 'Actif' : 'Inactif'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, p.code)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition cursor-pointer"
                          title="Supprimer ce code promo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de création */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <Tag className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-white">Nouveau Code Promo</h3>
                  <p className="text-[11px] text-slate-400">Configurez le code et sa valeur de remise</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Code */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">
                  Code (ex: GRATUIT100, VIP50)
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="PRESSE100"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 font-mono text-sm text-white uppercase placeholder-slate-600 focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">
                  Description interne
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Offre découverte partenaires média"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              {/* Type et Valeur */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">
                    Type de remise
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/60 cursor-pointer"
                  >
                    <option value="PERCENT">Pourcentage (%)</option>
                    <option value="FIXED">Montant fixe ($ USD)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">
                    Valeur de remise
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={discountType === 'PERCENT' ? 100 : 1000}
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-emerald-500/60"
                  />
                </div>
              </div>

              {/* Raccourcis pratiques */}
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Raccourcis :</span>
                {[100, 50, 20].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setDiscountType('PERCENT');
                      setDiscountValue(val);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                      discountType === 'PERCENT' && discountValue === val
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {val === 100 ? '100% (Gratuit Immédiat)' : `-${val}%`}
                  </button>
                ))}
              </div>

              {/* Formule Cible */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">
                  Formule éligible
                </label>
                <select
                  value={targetPlan}
                  onChange={(e) => setTargetPlan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/60 cursor-pointer"
                >
                  <option value="ALL">Tous les abonnements (VIP & PRO)</option>
                  <option value="SUBSCRIPTION_VIP">Abonnement VIP Lecteur uniquement</option>
                  <option value="JOURNALIST_PRO">Abonnement Journaliste PRO uniquement</option>
                </select>
              </div>

              {/* Limite d'utilisations & Date limite */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">
                    Quota max (laisser vide = illimité)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    placeholder="Ex: 50"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">
                    Date limite (optionnel)
                  </label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                  />
                </div>
              </div>

              {discountType === 'PERCENT' && discountValue >= 100 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Validation Immédiate :</strong> Ce code offre une gratuité totale (100%). L'utilisateur sera activé instantanément sans redirection vers la passerelle de paiement.
                  </span>
                </div>
              )}

              {errorMsg && (
                <p className="text-xs text-red-400 font-medium">{errorMsg}</p>
              )}

              {/* Boutons d'action */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-950/40"
                >
                  {isLoading ? 'Création...' : 'Créer le code promo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
