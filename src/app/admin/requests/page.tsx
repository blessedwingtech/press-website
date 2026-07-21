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
  User
} from 'lucide-react';

interface RequestItem {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  profilePhoto: string | null;
  createdAt: Date;
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getConfirmedRequests();
      // On convertit les dates si nécessaire
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

  const handleApprove = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir approuver cette demande de compte ? Un mot de passe temporaire sera généré et envoyé par e-mail.')) {
      return;
    }
    setActionLoadingId(id);
    setMessage(null);
    try {
      const res = await approveAccountRequest(id);
      if (res.success) {
        setMessage({ type: 'success', text: 'Demande approuvée avec succès. L\'utilisateur a reçu ses identifiants par e-mail.' });
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

  const handleReject = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir rejeter et supprimer définitivement cette demande de compte ? Un e-mail de notification sera envoyé.')) {
      return;
    }
    setActionLoadingId(id);
    setMessage(null);
    try {
      const res = await rejectAccountRequest(id);
      if (res.success) {
        setMessage({ type: 'success', text: 'Demande rejetée et supprimée avec succès.' });
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
        <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
          Demandes d'inscription en attente
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Gérez, approuvez ou rejetez les demandes de création de compte des visiteurs. Les demandes listées ici ont déjà validé leur adresse e-mail.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border text-xs sm:text-sm ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-455'
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
        <div className="flex justify-center items-center py-20 bg-slate-900/25 border border-slate-800/80 rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/20 border border-slate-800/60 rounded-2xl space-y-3">
          <Clock className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400 font-bold">Aucune demande en attente</p>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Toutes les demandes d'inscription confirmées par e-mail ont été traitées.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-extrabold uppercase tracking-widest text-[9px] sm:text-[10px]">
                <tr>
                  <th className="py-4 px-4 sm:px-6">Profil</th>
                  <th className="py-4 px-4 sm:px-6">Identité</th>
                  <th className="py-4 px-4 sm:px-6">E-mail / Utilisateur</th>
                  <th className="py-4 px-4 sm:px-6">Rôle demandé</th>
                  <th className="py-4 px-4 sm:px-6">Date de demande</th>
                  <th className="py-4 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {requests.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-950/40 transition">
                    {/* Photo de profil */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      <div className="w-10 h-10 rounded-lg border border-slate-800 bg-slate-950 overflow-hidden flex items-center justify-center relative">
                        {item.profilePhoto ? (
                          <img src={item.profilePhoto} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-slate-600" />
                        )}
                      </div>
                    </td>

                    {/* Nom Complet */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap font-bold text-white">
                      {item.name}
                    </td>

                    {/* Email / Username */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span>{item.email}</span>
                        <span className="text-[10px] text-slate-500 font-mono">@{item.username}</span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest border ${
                        item.role === 'journalist'
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          : 'bg-teal-500/10 border-teal-500/20 text-teal-400'
                      }`}>
                        {item.role === 'journalist' ? 'Journaliste' : 'Lecteur'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-slate-450 text-xs">
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
                          onClick={() => handleApprove(item.id)}
                          disabled={actionLoadingId !== null}
                          className="flex items-center gap-1 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                        >
                          {actionLoadingId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
                          Approuver
                        </button>
                        <button
                          onClick={() => handleReject(item.id)}
                          disabled={actionLoadingId !== null}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 disabled:opacity-50 text-slate-300 font-bold rounded-lg text-xs transition border border-slate-700 hover:border-rose-900/50 cursor-pointer"
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
