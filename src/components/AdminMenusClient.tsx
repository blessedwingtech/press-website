'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveMenu, deleteMenu, saveSubMenu, deleteSubMenu } from '@/app/admin/menus/actions';
import {
  Plus,
  Trash2,
  Edit2,
  ChevronRight,
  Layers,
  ArrowUpDown,
  Loader2,
  CheckCircle2,
  FolderPlus,
  AlertTriangle,
  FolderTree
} from 'lucide-react';

interface SubMenuData {
  id: string;
  nom: string;
  slug: string;
  order: number;
  menuId: string;
}

interface MenuData {
  id: string;
  nom: string;
  slug: string;
  order: number;
  submenus: SubMenuData[];
}

interface AdminMenusProps {
  menus: MenuData[];
}

export default function AdminMenusClient({ menus }: AdminMenusProps) {
  const router = useRouter();

  // Formulaire Menu
  const [menuId, setMenuId] = useState<string | undefined>(undefined);
  const [menuNom, setMenuNom] = useState('');
  const [menuOrder, setMenuOrder] = useState<number>(0);
  const [menuLoading, setMenuLoading] = useState(false);

  // Formulaire Sous-menu
  const [subMenuId, setSubMenuId] = useState<string | undefined>(undefined);
  const [subMenuNom, setSubMenuNom] = useState('');
  const [subMenuOrder, setSubMenuOrder] = useState<number>(0);
  const [subMenuParentId, setSubMenuParentId] = useState('');
  const [subMenuLoading, setSubMenuLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMenuLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await saveMenu(menuId, { nom: menuNom, order: menuOrder });
      if (res?.error) {
        setError(res.error);
        return;
      }
      setSuccess(menuId ? `Menu "${menuNom}" mis à jour avec succès.` : `Nouveau menu "${menuNom}" créé avec succès.`);
      setMenuId(undefined);
      setMenuNom('');
      setMenuOrder(0);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Erreur d’enregistrement du menu.');
    } finally {
      setMenuLoading(false);
    }
  };

  const handleSubMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subMenuParentId) {
      setError('Veuillez sélectionner le menu parent pour cette rubrique.');
      return;
    }
    setSubMenuLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await saveSubMenu(subMenuId, {
        nom: subMenuNom,
        order: subMenuOrder,
        menuId: subMenuParentId,
      });
      if (res?.error) {
        setError(res.error);
        return;
      }
      setSuccess(subMenuId ? `Rubrique "${subMenuNom}" mise à jour.` : `Sous-rubrique "${subMenuNom}" ajoutée au menu.`);
      setSubMenuId(undefined);
      setSubMenuNom('');
      setSubMenuOrder(0);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Erreur d’enregistrement de la sous-rubrique.');
    } finally {
      setSubMenuLoading(false);
    }
  };

  const handleEditMenu = (menu: MenuData) => {
    setMenuId(menu.id);
    setMenuNom(menu.nom);
    setMenuOrder(menu.order);
    setError(null);
    setSuccess(null);
    document.getElementById('menu-form-card')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEditSubMenu = (sub: SubMenuData) => {
    setSubMenuId(sub.id);
    setSubMenuNom(sub.nom);
    setSubMenuOrder(sub.order);
    setSubMenuParentId(sub.menuId);
    setError(null);
    setSuccess(null);
    document.getElementById('submenu-form-card')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddSubMenuToMenu = (menu: MenuData) => {
    setSubMenuId(undefined);
    setSubMenuNom('');
    setSubMenuParentId(menu.id);
    // Calcul de l'index suivant
    const nextOrder = menu.submenus.length > 0
      ? Math.max(...menu.submenus.map((s) => s.order)) + 1
      : 1;
    setSubMenuOrder(nextOrder);
    setError(null);
    setSuccess(null);
    document.getElementById('submenu-form-card')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
          Structure Éditoriale (Menus &amp; Rubriques)
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Gérez l&apos;architecture de navigation : créez des menus principaux et rattachez-y dynamiquement autant de sous-rubriques que nécessaire.
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl text-xs font-semibold text-rose-500 dark:text-rose-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Partie gauche : Arborescence des menus */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-emerald-500" />
                Arborescence active ({menus.length} menu{menus.length > 1 ? 's' : ''})
              </span>
              <span className="text-[10px] text-slate-500 font-normal normal-case">
                Ordre croissant d&apos;affichage
              </span>
            </h2>

            {menus.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">
                Aucun menu disponible. Remplissez le formulaire de droite pour créer votre premier menu.
              </p>
            ) : (
              <div className="space-y-4">
                {menus.map((menu) => (
                  <div
                    key={menu.id}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/60 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700 transition"
                  >
                    {/* Niveau 1 : Catégorie principale */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/60 pb-3 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 px-2 py-0.5 rounded text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1 select-none">
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                          #{menu.order}
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          {menu.nom}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          (/{menu.slug})
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                          {menu.submenus.length} rubrique{menu.submenus.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Bouton d'ajout rapide de sous-rubrique */}
                        <button
                          onClick={() => handleAddSubMenuToMenu(menu)}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30 flex items-center gap-1 transition cursor-pointer"
                          title={`Ajouter une rubrique à "${menu.nom}"`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Rubrique</span>
                        </button>
                        <button
                          onClick={() => handleEditMenu(menu)}
                          className="p-1.5 text-slate-500 hover:text-cyan-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Modifier le nom ou l'ordre"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Voulez-vous supprimer le menu principal "${menu.nom}" ? Les articles liés seront détachés et ses sous-rubriques supprimées.`)) {
                              setError(null);
                              const res = await deleteMenu(menu.id);
                              if (res?.error) {
                                setError(res.error);
                              } else {
                                setSuccess(`Menu "${menu.nom}" supprimé.`);
                                router.refresh();
                              }
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-500/15 rounded-lg transition cursor-pointer"
                          title="Supprimer le menu"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Niveau 2 : Sous-rubriques */}
                    <div className="pl-4 sm:pl-6 space-y-2">
                      {menu.submenus.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic flex items-center gap-1.5 py-1">
                          <span>Aucune sous-rubrique rattachée.</span>
                          <button
                            onClick={() => handleAddSubMenuToMenu(menu)}
                            className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
                          >
                            + Ajouter une sous-rubrique
                          </button>
                        </p>
                      ) : (
                        menu.submenus.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex justify-between items-center bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-lg text-xs transition"
                          >
                            <div className="flex items-center gap-2">
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-[9px] font-mono bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded text-slate-500 border border-slate-200 dark:border-slate-800 select-none">
                                Ordre {sub.order}
                              </span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">{sub.nom}</span>
                              <span className="text-[9px] text-slate-400 font-mono">({sub.slug})</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEditSubMenu(sub)}
                                className="p-1 text-slate-400 hover:text-cyan-500 transition"
                                title="Modifier la rubrique"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm(`Voulez-vous supprimer la sous-rubrique "${sub.nom}" ?`)) {
                                    setError(null);
                                    const res = await deleteSubMenu(sub.id);
                                    if (res?.error) {
                                      setError(res.error);
                                    } else {
                                      setSuccess(`Sous-rubrique "${sub.nom}" supprimée.`);
                                      router.refresh();
                                    }
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                                title="Supprimer la rubrique"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Partie droite : Formulaires de création */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Formulaire Menu */}
          <div id="menu-form-card" className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center justify-between">
              <span>{menuId ? 'Éditer le Menu' : 'Nouveau Menu Principal'}</span>
              {menuId && (
                <span className="text-[9px] text-amber-500 uppercase font-black bg-amber-500/15 px-2 py-0.5 rounded-full">
                  Mode Édition
                </span>
              )}
            </h3>
            
            <form onSubmit={handleMenuSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                  Nom du menu
                </label>
                <input
                  type="text"
                  required
                  value={menuNom}
                  onChange={(e) => setMenuNom(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                  placeholder="Ex: Politique, Sport, Économie..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                  Index d&apos;ordre (tri)
                </label>
                <input
                  type="number"
                  required
                  value={menuOrder}
                  onChange={(e) => setMenuOrder(parseInt(e.target.value) || 0)}
                  className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={menuLoading}
                  className="flex-grow flex justify-center items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {menuLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  {menuId ? 'Mettre à jour' : 'Ajouter le Menu'}
                </button>
                {menuId && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuId(undefined);
                      setMenuNom('');
                      setMenuOrder(0);
                    }}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Formulaire Sous-menu */}
          <div id="submenu-form-card" className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center justify-between">
              <span>{subMenuId ? 'Éditer la Rubrique' : 'Nouvelle Sous-Rubrique'}</span>
              {subMenuId && (
                <span className="text-[9px] text-amber-500 uppercase font-black bg-amber-500/15 px-2 py-0.5 rounded-full">
                  Mode Édition
                </span>
              )}
            </h3>

            <form onSubmit={handleSubMenuSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                  Menu Principal Parent
                </label>
                <select
                  required
                  value={subMenuParentId}
                  onChange={(e) => setSubMenuParentId(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="">-- Sélectionner le menu parent --</option>
                  {menus.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                  Nom de la sous-rubrique
                </label>
                <input
                  type="text"
                  required
                  value={subMenuNom}
                  onChange={(e) => setSubMenuNom(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-teal-500"
                  placeholder="Ex: National, International, Football..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                  Index d&apos;ordre (tri)
                </label>
                <input
                  type="number"
                  required
                  value={subMenuOrder}
                  onChange={(e) => setSubMenuOrder(parseInt(e.target.value) || 0)}
                  className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={subMenuLoading}
                  className="flex-grow flex justify-center items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {subMenuLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  {subMenuId ? 'Mettre à jour' : 'Ajouter la Rubrique'}
                </button>
                {subMenuId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSubMenuId(undefined);
                      setSubMenuNom('');
                      setSubMenuOrder(0);
                      setSubMenuParentId('');
                    }}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
