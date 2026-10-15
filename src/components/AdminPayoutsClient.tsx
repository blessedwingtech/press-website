'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Smartphone,
  TrendingUp,
  Building,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
} from 'lucide-react';
import { markPayoutCompletedAction, rejectPayoutAction } from '@/app/admin/payouts/actions';

interface PayoutRecord {
  id: string;
  amount: number;
  currency: string;
  method: string;
  methodDetails: string;
  status: string;
  note: string | null;
  createdAt: string | Date;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export default function AdminPayoutsClient({ initialPayouts }: { initialPayouts: PayoutRecord[] }) {
  const [payouts, setPayouts] = useState<PayoutRecord[]>(initialPayouts);
  const [filter, setFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    const note = prompt('Note de confirmation (ex: Référence virement bancaire / transaction ID) :');
    if (note === null) return;

    setProcessingId(id);
    try {
      await markPayoutCompletedAction(id, note || undefined);
      setPayouts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'COMPLETED', note: note || p.note } : p))
      );
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la validation');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Motif du rejet (les fonds seront automatiquement recrédités à l’auteur) :');
    if (!reason) return;

    setProcessingId(id);
    try {
      await rejectPayoutAction(id, reason);
      setPayouts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'REJECTED', note: reason } : p))
      );
    } catch (err: any) {
      alert(err.message || 'Erreur lors du rejet');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = payouts.filter((p) => {
    if (filter !== 'ALL' && p.status !== filter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = p.user.name?.toLowerCase().includes(q);
      const matchEmail = p.user.email?.toLowerCase().includes(q);
      const matchDetails = p.methodDetails?.toLowerCase().includes(q);
      return matchName || matchEmail || matchDetails;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
            Demandes de Reversement (Payouts)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gérez et auditez les retraits de gains des journalistes indépendants (MonCash, PayPal, Cartes, Virements).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par auteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-48 sm:w-60"
            />
          </div>

          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
            {['ALL', 'PENDING', 'COMPLETED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                  filter === st ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                {st === 'ALL' ? 'Tous' : st === 'PENDING' ? 'En attente' : st === 'COMPLETED' ? 'Payés' : 'Rejetés'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-800 text-slate-500 text-xs">
          Aucune demande de retrait correspondant à vos filtres.
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800 text-[10px] uppercase font-black tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Journaliste</th>
                  <th className="py-3.5 px-4">Montant</th>
                  <th className="py-3.5 px-4">Méthode & Coordonnées</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((p) => {
                  const dateStr = typeof p.createdAt === 'string'
                    ? new Date(p.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : p.createdAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

                  let methodIcon = <CreditCard className="w-4 h-4 text-purple-400 shrink-0" />;
                  if (p.method === 'MONCASH') methodIcon = <Smartphone className="w-4 h-4 text-red-400 shrink-0" />;
                  if (p.method === 'PAYPAL') methodIcon = <TrendingUp className="w-4 h-4 text-blue-400 shrink-0" />;
                  if (p.method === 'BANK_TRANSFER') methodIcon = <Building className="w-4 h-4 text-emerald-400 shrink-0" />;

                  return (
                    <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{p.user.name || 'Auteur anonyme'}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-xs">{p.user.email}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-sm font-black text-white">
                          {p.amount.toLocaleString()}
                        </span>{' '}
                        <span className="text-[10px] font-bold text-emerald-400">{p.currency}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-white mb-0.5">
                          {methodIcon}
                          <span>
                            {p.method === 'MONCASH'
                              ? 'MonCash'
                              : p.method === 'PAYPAL'
                              ? 'PayPal'
                              : p.method === 'CARD'
                              ? 'Carte Bancaire'
                              : 'Virement Bancaire'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 break-all max-w-md">
                          {p.methodDetails}
                        </div>
                        {p.note && (
                          <div className="text-[10px] text-slate-500 italic mt-0.5">
                            Note : {p.note}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {p.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3" /> En attente
                          </span>
                        )}
                        {p.status === 'COMPLETED' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Exécuté
                          </span>
                        )}
                        {p.status === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <XCircle className="w-3 h-3" /> Rejeté (Remboursé)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {p.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleApprove(p.id)}
                              disabled={processingId === p.id}
                              className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Valider le Virement
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(p.id)}
                              disabled={processingId === p.id}
                              className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Rejeter
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">Aucune action</span>
                        )}
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
