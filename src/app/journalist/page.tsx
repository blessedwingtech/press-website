import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { Calendar, Plus, MessageSquarePlus, Trash2, PenTool } from 'lucide-react';
import Image from 'next/image';
import SafeImage from '@/components/SafeImage'; 
import DeleteArticleButton from '@/components/DeleteArticleButton';

export const revalidate = 0; // Charger les données dynamiquement

export default async function JournalistDashboard() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  // Récupérer les articles rédigés par l'utilisateur connecté
  const articles = await db.article.findMany({
    where: { auteurId: userId },
    orderBy: { datePublication: 'desc' },
    include: {
      menu: true,
      submenu: true,
    },
  });

   

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
            Mes Articles Rédigés
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gérez vos publications, modifiez vos contenus ou supprimez vos articles.
          </p>
        </div>

        <Link
          href="/journalist/articles/new"
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvel Article
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-xl border border-slate-800/80">
          <MessageSquarePlus className="w-12 h-12 text-slate-700 mx-auto mb-4 animate-pulse" />
          <h3 className="text-slate-300 font-bold mb-1">Aucun article rédigé</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Vous n'avez pas encore créé d'article. Cliquez sur le bouton ci-dessus pour composer votre premier article !
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/20 border border-slate-800/60 rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-450 uppercase tracking-widest font-black text-[10px]">
                  <th className="py-4 px-6">Illustration</th>
                  <th className="py-4 px-6">Titre de l'article</th>
                  <th className="py-4 px-6">Catégories</th>
                  <th className="py-4 px-6">Date de Publication</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-medium">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-slate-900/10 transition-colors">
                    <td className="py-4 px-6">
                      <div className="w-14 h-10 rounded-md overflow-hidden border border-slate-800 bg-slate-950 relative">
                        <Image
                          src={article.imagePrincipale}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover select-none"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      <Link
                        href={`/articles/${article.slug}`}
                        className="text-xs sm:text-sm font-bold text-white hover:text-emerald-450 line-clamp-1 hover:underline transition-colors"
                        target="_blank"
                      >
                        {article.titre}
                      </Link>
                      <span className="text-[10px] text-slate-500 font-mono block truncate mt-0.5">{article.slug}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1 items-center">
                        <span className="bg-slate-800 border border-slate-700/60 px-2 py-0.5 rounded text-[10px] font-bold text-slate-300">
                          {article.menu.nom}
                        </span>
                        {article.submenu && (
                          <span className="bg-slate-900 border border-slate-850 px-2 py-0.5 rounded text-[9px] font-semibold text-slate-450">
                            {article.submenu.nom}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(article.datePublication).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/journalist/articles/edit/${article.id}`}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-bold transition-colors text-[11px]"
                        >
                          <PenTool className="w-3.5 h-3.5 text-cyan-400" />
                          Modifier
                        </Link>
                        <DeleteArticleButton articleId={article.id} />
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
