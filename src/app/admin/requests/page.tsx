'use client';

import { useEffect, useState } from 'react';
import { getConfirmedRequests, approveAccountRequest, rejectAccountRequest } from './actions';
import {
  UserCheck,
  UserX,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  ShieldAlert,
  User,
  Sparkles,
  FileText,
  Globe
} from 'lucide-react';

interface RequestItem {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  profilePhoto: string | null;
  motivation?: string | null;
  portfolioUrl?: string | null;
  isPromotion: boolean;
  createdAt: Date;
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getConfirmedRequests();
      setRequests(data as any);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Impossible de récupérer la liste des demandes.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (item: RequestItem) => {
    const confirmMessage = item.isPromotion
      ? `Êtes-vous sûr de vouloir approuver la promotion de ${item.name} au statut de Rédacteur ? Son compte existant sera immédiatement mis à niveau.`
      : `Êtes-vous sûr de vouloir approuver cette demande de compte pour ${item.name} ? Un mot de passe temporaire sera généré et envoyé par e-mail.`;

    if (!confirm(confirmMessage)) {
      return;
    }
    setActionLoadingId(item.id);
    setMessage(null);
    try {
      const res = await approveAccountRequest(item.id);
      if (res.success) {
        setMessage({
          type: 'success',
          text: item.isPromotion
            ? `Promotion approuvée avec succès ! ${item.name} a maintenant les accès Rédacteur.`
            : `Demande approuvée avec succès. ${item.name} a reçu ses identifiants par e-mail.`
        });
        fetchRequests();
      } else {
        setMessage({ type: 'error', text: res.error || 'Erreur lors de l\'approbation.' });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Une erreur réseau est survenue.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (item: RequestItem) => {
    if (!confirm(`Êtes-vous sûr de vouloir rejeter la demande de ${item.name} ? Un e-mail de notification sera envoyé.`)) {
      return;
    }
    setActionLoadingId(item.id);
    setMessage(null);
    try {
      const res = await rejectAccountRequest(item.id);
      if (res.success) {
        setMessage({ type: 'success', text: 'Demande rejetée et clôturée avec succès.' });
        fetchRequests();
      } else {
        setMessage({ type: 'error', text: res.error || 'Erreur lors du rejet.' });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Une erreur réseau est survenue.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
          Demandes d&apos;inscription et de promotion
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Gérez, examinez et approuvez les candidatures de rédacteurs et les créations de comptes. Les demandes listées ont validé leur adresse e-mail.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border text-xs sm:text-sm ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20 bg-slate-100 dark:bg-slate-900/25 border border-slate-200 dark:border-slate-800/80 rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800/60 rounded-2xl space-y-3">
          <Clock className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
          <p className="text-sm text-slate-700 dark:text-slate-400 font-bold">Aucune demande en attente</p>
          <p className="text-xs text-slate-500 dark:text-slate-600 max-w-md mx-auto">
            Toutes les demandes d&apos;inscription et de promotion confirmées par e-mail ont été traitées.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-extrabold uppercase tracking-widest text-[9px] sm:text-[10px]">
                <tr>
                  <th className="py-4 px-4 sm:px-6">Profil</th>
                  <th className="py-4 px-4 sm:px-6">Identité</th>
                  <th className="py-4 px-4 sm:px-6">Type & Rôle</th>
                  <th className="py-4 px-4 sm:px-6">Dossier / Motivation</th>
                  <th className="py-4 px-4 sm:px-6">Date</th>
                  <th className="py-4 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {requests.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-950/40 transition">
                    {/* Photo de profil */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      <div className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center relative">
                        {item.profilePhoto ? (
                          <img src={item.profilePhoto} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-slate-400 dark:text-slate-600" />
                        )}
                      </div>
                    </td>

                    {/* Nom Complet & Email */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white">{item.name}</span>
                        <span className="text-[11px] text-slate-500">{item.email}</span>
                      </div>
                    </td>

                    {/* Type & Rôle demandé */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                        {item.isPromotion ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> Promotion Rédacteur
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400">
                            Nouveau Compte
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 font-semibold">
                          Rôle : {item.role === 'journalist' ? 'Rédacteur' : 'Lecteur'}
                        </span>
                      </div>
                    </td>

                    {/* Motivation / Portfolio */}
                    <td className="py-4 px-4 sm:px-6 max-w-xs">
                      {item.motivation || item.portfolioUrl ? (
                        <div className="space-y-1">
                          {item.motivation && (
                            <p className="text-xs text-slate-600 dark:text-slate-350 line-clamp-2 italic">
                              &ldquo;{item.motivation}&rdquo;
                            </p>
                          )}
                          {item.portfolioUrl && (
                            <a
                              href={item.portfolioUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-semibold"
                            >
                              <Globe className="w-3 h-3" /> Voir Portfolio / Liens <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Aucune note</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-slate-500 dark:text-slate-400 text-xs">
                      {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleApprove(item)}
                          disabled={actionLoadingId !== null}
                          className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition cursor-pointer shadow-sm"
                        >
                          {actionLoadingId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
                          Approuver
                        </button>
                        <button
                          onClick={() => handleReject(item)}
                          disabled={actionLoadingId !== null}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950 dark:text-slate-300 dark:hover:text-rose-400 disabled:opacity-50 font-bold rounded-lg text-xs transition border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-900/50 cursor-pointer"
                        >
                          {actionLoadingId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserX className="w-3.5 h-3.5" />
                          )}
                          Rejeter
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
