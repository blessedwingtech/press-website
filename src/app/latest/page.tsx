import { db } from '@/lib/db';
import AdSlot from '@/components/AdSlot';
import Link from 'next/link';
import { Calendar, User, ArrowRight, BookOpen, Clock } from 'lucide-react';
import SafeImage from '@/components/SafeImage';
import ArticleMedia from '@/components/ArticleMedia';

export const revalidate = 0; // Desactiver le cache pour charger en temps réel

export default async function LatestArticlesPage() {
  // Récupérer le paramètre de démonstration
  const demoSetting = await db.systemSetting.findUnique({
    where: { key: 'showDemoData' },
  });
  const showDemo = demoSetting ? demoSetting.value === 'true' : true;

  const where: any = {};
  if (!showDemo) {
    where.isDemo = false;
  }

  // Récupérer les 24 derniers articles (multiple de 3 pour la grille)
  const articles = await db.article.findMany({
    where,
    orderBy: { datePublication: 'desc' },
    take: 24,
    include: {
      auteur: { select: { name: true } },
      menu: true,
      submenu: true,
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow w-full">
      {/* Emplacement publicitaire haut */}
      <AdSlot position="header" />

      {/* En-tête */}
      <div className="my-6 border-b border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-white border-l-4 border-emerald-500 pl-3 flex items-center gap-2 uppercase">
          <Clock className="w-7 h-7 text-emerald-400 shrink-0" />
          Les 24 Dernières Actualités
        </h1>
        <p className="text-xs text-slate-400 mt-2">
          Retrouvez les toutes dernières publications de notre équipe de journalistes en temps réel.
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800/80 max-w-4xl mx-auto">
          <BookOpen className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-300 text-base font-semibold">Aucun article récent n'a été publié pour le moment.</p>
          <p className="text-xs text-slate-500 mt-1">Revenez plus tard pour de nouvelles actualités.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Grille principale d'articles */}
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {articles.map((article) => (
                <article
                  key={article.id}
                  className="flex flex-col bg-slate-900/40 rounded-xl overflow-hidden border border-slate-800 hover:border-slate-700/60 hover:shadow-xl transition-all duration-300 group"
                >
                  <Link href={`/articles/${article.slug}`} className="block relative h-40 overflow-hidden bg-slate-950">
                    <ArticleMedia src={article.imagePrincipale} alt={article.titre} mode="preview" />
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1 z-20">
                      <span className="bg-emerald-500 text-white font-black text-[9px] uppercase px-2 py-0.5 rounded shadow-md tracking-wider">
                        {article.menu.nom}
                      </span>
                      {article.submenu && (
                        <span className="bg-slate-950/80 backdrop-blur-sm text-slate-200 border border-slate-800 font-bold text-[8px] uppercase px-1.5 py-0.5 rounded shadow-md tracking-wider">
                          {article.submenu.nom}
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-2 font-medium">
                        <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                        {new Date(article.datePublication).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <h2 className="text-sm font-bold text-white hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                        <Link href={`/articles/${article.slug}`}>
                          {article.titre}
                        </Link>
                      </h2>
                      <div
                        className="mt-2.5 text-[11px] text-slate-400 line-clamp-2 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: article.contenu.replace(/<[^>]*>/g, '').substring(0, 130) + '...',
                        }}
                      />
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 flex items-center gap-1 font-medium truncate pr-2">
                        <User className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{article.auteur.name}</span>
                      </span>
                      <Link
                        href={`/articles/${article.slug}`}
                        className="text-emerald-400 hover:text-emerald-300 font-extrabold flex items-center gap-0.5 hover:translate-x-0.5 transition-all shrink-0"
                      >
                        Lire <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Colonne latérale */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              <div>
                <span className="text-[9px] font-extrabold text-slate-550 uppercase tracking-widest block mb-2 text-center">
                  Partenaire
                </span>
                <AdSlot position="sidebar" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emplacement publicitaire bas */}
      <AdSlot position="footer" />
    </div>
  );
}
