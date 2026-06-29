import { db } from '@/lib/db';
import { BookOpen, Users, Landmark, ListCollapse, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { toggleDemoDataVisibility } from './actions';

export const revalidate = 0; // Pas de cache

export default async function AdminDashboardOverview() {
  const articlesCount = await db.article.count();
  const usersCount = await db.user.count();
  const adsCount = await db.ad.count({ where: { active: true } });
  const menusCount = await db.menu.count();

  const journalistsCount = await db.user.count({ where: { role: 'journalist' } });
  const adminsCount = await db.user.count({ where: { role: 'admin' } });
  const readersCount = await db.user.count({ where: { role: 'reader' } });

  const latestArticles = await db.article.findMany({
    orderBy: { datePublication: 'desc' },
    take: 5,
    include: {
      auteur: { select: { name: true } },
      menu: true,
    },
  });

  // Récupérer le statut actuel de la visibilité des données de démonstration
  const demoSetting = await db.systemSetting.findUnique({
    where: { key: 'showDemoData' },
  });
  const showDemoData = demoSetting ? demoSetting.value === 'true' : true;

  async function handleToggleDemo() {
    'use server';
    await toggleDemoDataVisibility();
  }

  return (
    <div className="space-y-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
            Tableau de bord Administration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Surveillez les volumes éditoriaux, gérez les structures de rubriques, contrôlez la publicité et gérez les comptes.
          </p>
        </div>

        {/* Bouton Toggle Données Démo */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3.5 shadow-md">
          <div className="text-left shrink-0">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block">
              Données de démo (Seed)
            </span>
            <span className={`text-[10px] font-bold ${showDemoData ? 'text-emerald-400' : 'text-rose-455'}`}>
              {showDemoData ? 'Visibles sur le site' : 'Masquées'}
            </span>
          </div>

          <form action={handleToggleDemo}>
            <button
              type="submit"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wide cursor-pointer transition-colors ${
                showDemoData
                  ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                  : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 hover:bg-emerald-500/20'
              }`}
            >
              {showDemoData ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-rose-500" />
                  Masquer
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-emerald-500" />
                  Afficher
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Grille de cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4 shadow-lg">
          <div className="p-3.5 bg-emerald-500/10 rounded-lg text-emerald-450">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Articles</p>
            <p className="text-xl font-black text-white">{articlesCount}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4 shadow-lg">
          <div className="p-3.5 bg-cyan-500/10 rounded-lg text-cyan-455">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">Membres</p>
            <p className="text-xl font-black text-white">{usersCount}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4 shadow-lg">
          <div className="p-3.5 bg-amber-500/10 rounded-lg text-amber-450">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">Pubs Actives</p>
            <p className="text-xl font-black text-white">{adsCount}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4 shadow-lg">
          <div className="p-3.5 bg-indigo-500/10 rounded-lg text-indigo-400">
            <ListCollapse className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">Menus</p>
            <p className="text-xl font-black text-white">{menusCount}</p>
          </div>
        </div>
      </div>

      {/* Grille secondaire */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des derniers articles rédigés */}
        <div className="lg:col-span-2 bg-slate-900/20 border border-slate-800/80 rounded-xl p-5 shadow-2xl">
          <h2 className="text-xs font-black uppercase tracking-wider text-white border-b border-slate-800/60 pb-3 mb-4">
            Dernières publications de la rédaction
          </h2>
          {latestArticles.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">Aucun article enregistré.</p>
          ) : (
            <div className="space-y-4">
              {latestArticles.map((art: any) => (
                <div key={art.id} className="flex justify-between items-center gap-4 text-xs border-b border-slate-900 pb-3 last:border-0 last:pb-0">
                  <div className="truncate">
                    <p className="font-bold text-slate-200 truncate hover:text-emerald-450">
                      <Link href={`/articles/${art.slug}`} target="_blank">
                        {art.titre}
                      </Link>
                    </p>
                    <p className="text-[10px] text-slate-550 mt-0.5 font-medium">
                      Par <span className="text-slate-400 font-semibold">{art.auteur.name}</span> dans <span className="text-emerald-400 font-semibold">{art.menu.nom}</span>
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 font-mono font-medium">
                    {new Date(art.datePublication).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Répartition des utilisateurs par rôles */}
        <div className="lg:col-span-1 bg-slate-900/20 border border-slate-800/80 rounded-xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-white border-b border-slate-800/60 pb-3 mb-4">
              Répartition des profils
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Administrateurs
                </span>
                <span className="font-mono font-bold text-white bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                  {adminsCount}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  Journalistes
                </span>
                <span className="font-mono font-bold text-white bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                  {journalistsCount}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  Lecteurs
                </span>
                <span className="font-mono font-bold text-white bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                  {readersCount}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800/50 pt-4 mt-6 text-[10px] text-slate-500 font-semibold uppercase tracking-wider leading-relaxed">
            Pour modifier les rôles, éditer les informations, supprimer ou bannir un utilisateur, accédez à l'onglet{' '}
            <Link href="/admin/users" className="text-cyan-400 hover:text-cyan-350 underline">
              Utilisateurs
            </Link>.
          </div>
        </div>
      </div>
    </div>
  );
}
