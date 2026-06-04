'use client';

import { useState } from 'react';
import { updateUserRole, toggleUserBan } from '@/app/admin/users/actions';
import { UserCheck, UserX, AlertTriangle } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface AdminUsersProps {
  users: UserData[];
  currentUserId: string;
}

export default function AdminUsersClient({ users, currentUserId }: AdminUsersProps) {
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleRoleChange = async (id: string, newRole: string) => {
    setUpdatingId(id);
    setError(null);
    try {
      await updateUserRole(id, newRole);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour du rôle.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleBan = async (id: string, name: string, isCurrentlyBanned: boolean) => {
    const actionName = isCurrentlyBanned ? 'débannir' : 'bannir';
    if (!confirm(`Voulez-vous vraiment ${actionName} l’utilisateur "${name}" ?`)) {
      return;
    }
    setUpdatingId(id);
    setError(null);
    try {
      await toggleUserBan(id);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification du statut.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
          Gestion des Utilisateurs &amp; Rôles
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Ajustez les privilèges d’écriture des journalistes, rétrogradez des modérateurs ou appliquez des bans d’accès sur les comptes perturbateurs.
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl text-xs font-semibold text-rose-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-500" />
          {error}
        </div>
      )}

      <div className="bg-slate-900/20 border border-slate-800/60 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-450 uppercase tracking-widest font-black text-[10px]">
                <th className="py-4 px-6">Identité</th>
                <th className="py-4 px-6">Adresse Email</th>
                <th className="py-4 px-6">Rôle affecté</th>
                <th className="py-4 px-6">Statut d'accès</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 font-medium">
              {users.map((user) => {
                const isSelf = user.id === currentUserId;
                const isBanned = user.status === 'banned';

                return (
                  <tr
                    key={user.id}
                    className={`hover:bg-slate-900/10 transition-colors ${
                      isSelf ? 'bg-slate-900/20' : ''
                    }`}
                  >
                    <td className="py-4 px-6 font-bold text-white flex items-center gap-1.5">
                      {user.name}
                      {isSelf && (
                        <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[8px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider select-none">
                          Vous
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-mono">{user.email}</td>
                    <td className="py-4 px-6">
                      <select
                        disabled={isSelf || updatingId === user.id}
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      >
                        <option value="reader">Lecteur / Lectrice</option>
                        <option value="journalist">Journaliste</option>
                        <option value="admin">Administrateur</option>
                      </select>
                    </td>
                    <td className="py-4 px-6">
                      {isBanned ? (
                        <span className="text-[9px] font-extrabold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max select-none">
                          Banni
                        </span>
                      ) : (
                        <span className="text-[9px] font-extrabold text-emerald-450 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max select-none">
                          Actif
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        disabled={isSelf || updatingId === user.id}
                        onClick={() => handleToggleBan(user.id, user.name, isBanned)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 border rounded-lg font-bold transition text-[11px] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                          isBanned
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-450 hover:bg-emerald-500/20'
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                        }`}
                      >
                        {isBanned ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-emerald-500" /> Réactiver
                          </>
                        ) : (
                          <>
                            <UserX className="w-3.5 h-3.5 text-rose-500" /> Bannir
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
