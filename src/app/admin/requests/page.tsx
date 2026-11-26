'use client';

import { useEffect, useState } from 'react';
import { getConfirmedRequests, approveAccountRequest, rejectAccountRequest } from './actions';
import {
  getPendingVerifications,
  approveVerification,
  rejectVerification
} from '@/app/journalist/verification/actions';
import {
  UserCheck,
  UserX,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  User,
  Sparkles,
  Award,
  ShieldCheck,
  Globe,
  FileText,
  BadgeCheck
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

interface VerificationItem {
  id: string;
  userId: string;
  specialties: string;
  publicProfileUrl: string | null;
  portfolioLinks: string;
  bio: string;
  ethicsAccepted: boolean;
  status: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    profilePhoto: string | null;
    role: string;
    createdAt: Date;
    _count: { articles: number };
  };
}

export default function AdminRequestsPage() {
  const [activeTab, setActiveTab] = useState<'accounts' | 'verifications'>('accounts');
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [verifications, setVerifications] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [accData, verifData] = await Promise.all([
        getConfirmedRequests(),
        getPendingVerifications()
      ]);
      setRequests(accData as any);
      setVerifications(verifData as any);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Impossible de récupérer les demandes en attente.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleApproveAccount = async (item: RequestItem) => {
    const confirmMessage = item.isPromotion
      ? `Êtes-vous sûr de vouloir approuver la promotion de ${item.name} au statut de Rédacteur ? Son compte existant sera immédiatement mis à niveau.`
      : `Êtes-vous sûr de vouloir approuver cette demande de compte pour ${item.name} ? Un mot de passe temporaire sera généré et envoyé par e-mail.`;

    if (!confirm(confirmMessage)) return;

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
        fetchAllData();
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

  const handleRejectAccount = async (item: RequestItem) => {
    if (!confirm(`Êtes-vous sûr de vouloir rejeter la demande de ${item.name} ? Un e-mail de notification sera envoyé.`)) {
      return;
    }
    setActionLoadingId(item.id);
    setMessage(null);
    try {
      const res = await rejectAccountRequest(item.id);
      if (res.success) {
        setMessage({ type: 'success', text: 'Demande rejetée et clôturée avec succès.' });
        fetchAllData();
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

  const handleApproveVerification = async (item: VerificationItem) => {
    if (!confirm(`Confirmer l'attribution du badge Journaliste Vérifié à ${item.user.name} ? Un e-mail d'attestation lui sera envoyé.`)) {
      return;
    }
    setActionLoadingId(item.id);
    setMessage(null);
    try {
      const res = await approveVerification(item.id);
      if (res.success) {
        setMessage({
          type: 'success',
          text: `Certification accordée à ${item.user.name}. Le badge officiel est maintenant actif sur ses articles.`
        });
        fetchAllData();
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

  const handleRejectVerification = async (item: VerificationItem) => {
    const reason = prompt(`Motif du refus pour ${item.user.name} (optionnel) :`, '');
    if (reason === null) return;

    setActionLoadingId(item.id);
    setMessage(null);
    try {
      const res = await rejectVerification(item.id, reason || undefined);
      if (res.success) {
        setMessage({ type: 'success', text: `Dossier d'accréditation rejeté pour ${item.user.name}.` });
        fetchAllData();
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
          Demandes & Accréditations
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Examinez les demandes de création de comptes rédacteurs et les dossiers d&apos;accréditation pour le badge Journaliste Vérifié.
        </p>
      </div>

      {/* Onglets */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition border-b-2 flex items-center gap-2 ${
            activeTab === 'accounts'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Comptes & Promotions
          {requests.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
              {requests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('verifications')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition border-b-2 flex items-center gap-2 ${
            activeTab === 'verifications'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <BadgeCheck className="w-4 h-4" />
          Accréditations & Badges Vérifiés
          {verifications.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              {verifications.length}
            </span>
          )}
        </button>
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
      ) : activeTab === 'accounts' ? (
        /* ONGLET 1 : COMPTES & PROMOTIONS */
        requests.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800/60 rounded-2xl space-y-3">
            <Clock className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
            <p className="text-sm text-slate-700 dark:text-slate-400 font-bold">Aucune demande de compte en attente</p>
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
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        <div className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center relative">
                          {item.profilePhoto ? (
                            <img src={item.profilePhoto} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-slate-400 dark:text-slate-600" />
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white">{item.name}</span>
                          <span className="text-[11px] text-slate-500">{item.email}</span>
                        </div>
                      </td>

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

                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-slate-500 dark:text-slate-400 text-xs">
                        {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleApproveAccount(item)}
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
                            onClick={() => handleRejectAccount(item)}
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
        )
      ) : (
        /* ONGLET 2 : DOSSIERS D'ACCRÉDITATION & BADGES VÉRIFIÉS */
        verifications.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800/60 rounded-2xl space-y-3">
            <ShieldCheck className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
            <p className="text-sm text-slate-700 dark:text-slate-400 font-bold">Aucun dossier de certification en attente</p>
            <p className="text-xs text-slate-500 dark:text-slate-600 max-w-md mx-auto">
              Tous les dossiers de demande d&apos;accréditation journalistique ont été traités.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {verifications.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                      {item.user.profilePhoto ? (
                        <img src={item.user.profilePhoto} alt={item.user.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 dark:text-white text-base">
                          {item.user.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          {item.user._count.articles} article(s) publié(s)
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">{item.user.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveVerification(item)}
                      disabled={actionLoadingId !== null}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                    >
                      {actionLoadingId === item.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5" />
                      )}
                      Attribuer le Badge Vérifié
                    </button>
                    <button
                      onClick={() => handleRejectVerification(item)}
                      disabled={actionLoadingId !== null}
                      className="px-4 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950 dark:text-slate-300 dark:hover:text-rose-400 font-bold rounded-xl text-xs uppercase tracking-wider transition border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-900/50 cursor-pointer disabled:opacity-50"
                    >
                      Refuser
                    </button>
                  </div>
                </div>

                {/* Détails du dossier */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Spécialités */}
                  <div className="space-y-1">
                    <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                      Spécialités
                    </span>
                    <p className="text-slate-900 dark:text-white font-medium">
                      {item.specialties || 'Non précisé'}
                    </p>
                  </div>

                  {/* Profil public / Empreinte en ligne */}
                  <div className="space-y-1">
                    <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                      Profil Public / Média
                    </span>
                    <div>
                      {item.publicProfileUrl ? (
                        <a
                          href={item.publicProfileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 dark:text-teal-400 font-semibold hover:underline flex items-center gap-1"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          Consulter la présence publique <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">Aucun lien fourni</span>
                      )}
                    </div>
                  </div>

                  {/* Date de dépôt */}
                  <div className="space-y-1">
                    <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                      Date de soumission
                    </span>
                    <p className="text-slate-900 dark:text-white font-medium">
                      {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Présentation / Démarche */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">
                    Démarche & Travaux d&apos;investigation :
                  </span>
                  <p className="text-slate-600 dark:text-slate-350 whitespace-pre-line leading-relaxed">
                    {item.bio}
                  </p>
                </div>

                {/* Liens de travaux / Portefeuille */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">
                    Articles & Enquêtes cités en référence :
                  </span>
                  <p className="text-slate-600 dark:text-slate-350 whitespace-pre-line leading-relaxed font-mono text-[11px]">
                    {item.portfolioLinks}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
