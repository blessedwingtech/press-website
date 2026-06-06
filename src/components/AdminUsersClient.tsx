'use client';

import { useState } from 'react';
import {
  updateUserRole,
  toggleUserBan,
  createUser,
  updateUser,
  deleteUser,
} from '@/app/admin/users/actions';
import {
  UserCheck,
  UserX,
  AlertTriangle,
  UserPlus,
  Edit2,
  Trash2,
  X,
  Plus,
  Loader2,
} from 'lucide-react';

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
  const [success, setSuccess] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('reader');
  const [status, setStatus] = useState('active');
  const [formLoading, setFormLoading] = useState(false);

  const resetForm = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('reader');
    setStatus('active');
    setError(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: UserData) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword(''); // Empty password as default in edit mode
    setRole(user.role);
    setStatus(user.status);
    setError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingUser) {
        // Confirmation for edit action
        if (!confirm(`Voulez-vous vraiment enregistrer les modifications pour l'utilisateur "${name}" ?`)) {
          setFormLoading(false);
          return;
        }
        await updateUser(editingUser.id, {
          name,
          email,
          password: password || undefined,
          role,
          status,
        });
        setSuccess('Utilisateur mis à jour avec succès.');
      } else {
        if (!confirm(`Voulez-vous vraiment créer l'utilisateur "${name}" ?`)) {
          setFormLoading(false);
          return;
        }
        await createUser({
          name,
          email,
          password,
          role,
          status,
        });
        setSuccess('Nouvel utilisateur créé avec succès.');
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite lors de l'enregistrement.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`ATTENTION : Voulez-vous vraiment supprimer définitivement l'utilisateur "${name}" ? Cette action est irréversible.`)) {
      return;
    }
    setUpdatingId(id);
    setError(null);
    setSuccess(null);
    try {
      await deleteUser(id);
      setSuccess('Utilisateur supprimé avec succès.');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression.');
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
    setSuccess(null);
    try {
      await toggleUserBan(id);
      setSuccess(`L'utilisateur "${name}" a été ${isCurrentlyBanned ? 'débanni' : 'banni'} avec succès.`);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification du statut.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 w-full relative">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
            Gestion des Utilisateurs &amp; Rôles
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Ajoutez, modifiez ou supprimez des rédacteurs, ajustez les privilèges d’écriture des journalistes ou appliquez des bans d’accès.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg shadow-md transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Ajouter un utilisateur
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl text-xs font-semibold text-rose-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-500" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-xs font-semibold text-emerald-400 flex items-center gap-2">
          <UserCheck className="w-4 h-4 flex-shrink-0 text-emerald-500" />
          {success}
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
                      <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        user.role === 'admin' 
                          ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' 
                          : user.role === 'journalist'
                          ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'
                          : 'bg-slate-800 border border-slate-700 text-slate-300'
                      }`}>
                        {user.role === 'admin' ? 'Administrateur' : user.role === 'journalist' ? 'Journaliste' : 'Lecteur'}
                      </span>
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
                      <div className="flex justify-end gap-2 items-center">
                        <button
                          disabled={updatingId === user.id}
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors disabled:opacity-40 cursor-pointer"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        
                        <button
                          disabled={isSelf || updatingId === user.id}
                          onClick={() => handleToggleBan(user.id, user.name, isBanned)}
                          className={`p-1.5 border rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                            isBanned
                              ? 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10'
                              : 'border-rose-500/20 text-rose-450 hover:bg-rose-500/10'
                          }`}
                          title={isBanned ? "Débannir" : "Bannir"}
                        >
                          {isBanned ? (
                            <UserCheck className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <UserX className="w-4 h-4 text-rose-500" />
                          )}
                        </button>

                        <button
                          disabled={isSelf || updatingId === user.id}
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'ajout / modification */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
            {/* Décoration de fond */}
            <div className="absolute -top-10 -left-10 w-42 h-42 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                {editingUser ? 'Modifier l’Utilisateur' : 'Créer un Utilisateur'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Nom complet
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-400 transition-colors"
                  placeholder="Ex: Jean Reporter"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Adresse Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-400 transition-colors"
                  placeholder="journalist@sports.com"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Mot de passe {editingUser && <span className="text-[8px] text-slate-500 lowercase">(laisser vide pour ne pas changer)</span>}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-400 transition-colors"
                  placeholder={editingUser ? "••••••••" : "Saisir un mot de passe"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Rôle
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={editingUser?.id === currentUserId}
                    className="block w-full px-3 py-2 bg-slate-955 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="reader">Lecteur</option>
                    <option value="journalist">Journaliste</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Statut
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={editingUser?.id === currentUserId}
                    className="block w-full px-3 py-2 bg-slate-955 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="active">Actif</option>
                    <option value="banned">Banni</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-800 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-grow py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-350 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-grow flex justify-center items-center gap-1 py-2 px-3 bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-xs font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {formLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                  ) : editingUser ? (
                    'Sauvegarder'
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 text-slate-950" />
                      Créer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
