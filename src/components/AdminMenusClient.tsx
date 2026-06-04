'use client';

import { useState } from 'react';
import { saveMenu, deleteMenu, saveSubMenu, deleteSubMenu } from '@/app/admin/menus/actions';
import { Plus, Trash2, Edit2, ChevronRight, Layers, ArrowUpDown, Loader2 } from 'lucide-react';

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

  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMenuLoading(true);
    setError(null);
    try {
      await saveMenu(menuId, { nom: menuNom, order: menuOrder });
      setMenuId(undefined);
      setMenuNom('');
      setMenuOrder(0);
    } catch (err: any) {
      setError(err.message || 'Erreur d’enregistrement de la catégorie.');
    } finally {
      setMenuLoading(false);
    }
  };

  const handleSubMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subMenuParentId) {
      setError('Veuillez associer cette rubrique à un menu parent.');
      return;
    }
    setSubMenuLoading(true);
    setError(null);
    try {
      await saveSubMenu(subMenuId, {
        nom: subMenuNom,
        order: subMenuOrder,
        menuId: subMenuParentId,
      });
      setSubMenuId(undefined);
      setSubMenuNom('');
      setSubMenuOrder(0);
      setSubMenuParentId('');
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditSubMenu = (sub: SubMenuData) => {
    setSubMenuId(sub.id);
    setSubMenuNom(sub.nom);
    setSubMenuOrder(sub.order);
    setSubMenuParentId(sub.menuId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
          Gestion de la Structure (Menus &amp; Rubriques)
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Créez de nouvelles catégories éditoriales de niveau supérieur ou des sous-rubriques imbriquées, et ajustez leur ordonnancement d'affichage.
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl text-xs font-semibold text-rose-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Partie gauche : Arborescence des menus */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/20 border border-slate-800/80 rounded-xl p-5 shadow-2xl">
            <h2 className="text-xs font-black uppercase tracking-wider text-white border-b border-slate-800/60 pb-3 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-450" />
              Configuration des rubriques
            </h2>

            {menus.length === 0 ? (
              <p className="text-xs text-slate-550 text-center py-8">Aucun menu disponible. Remplissez le formulaire de droite pour commencer.</p>
            ) : (
              <div className="space-y-4">
                {menus.map((menu) => (
                  <div
                    key={menu.id}
                    className="border border-slate-800/80 rounded-xl p-4 bg-slate-950/20 hover:border-slate-700/40 transition-colors"
                  >
                    {/* Niveau 1 : Catégorie principale */}
                    <div className="flex justify-between items-center gap-4 border-b border-slate-800/40 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-emerald-400 font-extrabold flex items-center gap-1 select-none">
                          <ArrowUpDown className="w-3 h-3 text-slate-500" />
                          #{menu.order}
                        </span>
                        <span className="text-sm font-bold text-white uppercase tracking-wider">{menu.nom}</span>
                        <span className="text-[9px] text-slate-500 font-mono">({menu.slug})</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditMenu(menu)}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                          title="Modifier le menu"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Voulez-vous supprimer le menu "${menu.nom}" ? Cette action effacera également toutes ses rubriques filles et ses articles.`)) {
                              await deleteMenu(menu.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/15 rounded transition-colors cursor-pointer"
                          title="Supprimer le menu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Niveau 2 : Sous-rubriques */}
                    <div className="pl-6 space-y-2">
                      {menu.submenus.length === 0 ? (
                        <p className="text-[10px] text-slate-600 italic">Aucune rubrique enfant rattachée.</p>
                      ) : (
                        menu.submenus.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex justify-between items-center bg-slate-900/30 hover:bg-slate-900/50 border border-slate-850 px-3 py-2 rounded-lg text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <ChevronRight className="w-3.5 h-3.5 text-slate-655" />
                              <span className="text-[8px] font-mono bg-slate-950 px-1.5 py-0.5 rounded text-slate-450 select-none">
                                Position: {sub.order}
                              </span>
                              <span className="font-bold text-slate-350">{sub.nom}</span>
                              <span className="text-[9px] text-slate-550 font-mono">({sub.slug})</span>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleEditSubMenu(sub)}
                                className="p-1 text-slate-500 hover:text-cyan-455 transition-colors"
                                title="Modifier la rubrique"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm(`Voulez-vous supprimer la rubrique "${sub.nom}" ?`)) {
                                    await deleteSubMenu(sub.id);
                                  }
                                }}
                                className="p-1 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
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
          <div className="bg-slate-900/20 border border-slate-800/80 rounded-xl p-5 shadow-2xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-emerald-450 mb-4 border-b border-slate-800/60 pb-2">
              {menuId ? 'Éditer un Menu' : 'Nouveau Menu'}
            </h3>
            
            <form onSubmit={handleMenuSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Nom du menu
                </label>
                <input
                  type="text"
                  required
                  value={menuNom}
                  onChange={(e) => setMenuNom(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                  placeholder="Ex: Politique, Sport, Culture..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Index de tri
                </label>
                <input
                  type="number"
                  required
                  value={menuOrder}
                  onChange={(e) => setMenuOrder(parseInt(e.target.value) || 0)}
                  className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={menuLoading}
                  className="flex-grow flex justify-center items-center gap-1.5 py-2.5 px-4 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-600 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {menuLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" /> : <Plus className="w-3.5 h-3.5 text-slate-950" />}
                  {menuId ? 'Sauvegarder' : 'Ajouter'}
                </button>
                {menuId && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuId(undefined);
                      setMenuNom('');
                      setMenuOrder(0);
                    }}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-350 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Formulaire Sous-menu */}
          <div className="bg-slate-900/20 border border-slate-800/80 rounded-xl p-5 shadow-2xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-4 border-b border-slate-800/60 pb-2">
              {subMenuId ? 'Éditer une Rubrique' : 'Nouvelle Rubrique'}
            </h3>

            <form onSubmit={handleSubMenuSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Menu Parent
                </label>
                <select
                  required
                  value={subMenuParentId}
                  onChange={(e) => setSubMenuParentId(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-350 text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="">-- Choisir le menu parent --</option>
                  {menus.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Nom de la sous-rubrique
                </label>
                <input
                  type="text"
                  required
                  value={subMenuNom}
                  onChange={(e) => setSubMenuNom(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
                  placeholder="Ex: Ligue 1, NBA, Europe, France..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Index de tri
                </label>
                <input
                  type="number"
                  required
                  value={subMenuOrder}
                  onChange={(e) => setSubMenuOrder(parseInt(e.target.value) || 0)}
                  className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={subMenuLoading}
                  className="flex-grow flex justify-center items-center gap-1.5 py-2.5 px-4 rounded-lg text-xs font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-500 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {subMenuLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" /> : <Plus className="w-3.5 h-3.5 text-slate-950" />}
                  {subMenuId ? 'Sauvegarder' : 'Ajouter'}
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
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-350 text-xs font-bold rounded-lg transition-colors cursor-pointer"
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
