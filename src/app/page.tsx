import { db } from '@/lib/db';
import Link from 'next/link';
import { Calendar, User, ArrowRight, BookOpen, Eye } from 'lucide-react';
import ArticleMedia from '@/components/ArticleMedia';
import AdSlot from '@/components/AdSlot';

export const revalidate = 0; // Désactiver le cache pour charger les ajouts en temps réel

interface HomeProps {
  searchParams: {
    page?: string;
  };
}

export default async function Home({ searchParams }: HomeProps) {
  const page = parseInt(searchParams.page || '1') || 1;
  const limit = 9;
  const skip = (page - 1) * limit;

  // Récupérer le paramètre de démonstration
  const demoSetting = await db.systemSetting.findUnique({
    where: { key: 'showDemoData' },
  });
  const showDemo = demoSetting ? demoSetting.value === 'true' : true;

  const where: any = {};
  if (!showDemo) {
    where.isDemo = false;
  }

  // Algorithme "À LA UNE" :
  // 1. Chercher d'abord les articles des dernières 24 heures
  const time24hAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const where24h = {
    ...where,
    datePublication: { gte: time24hAgo },
  };

  let feedArticles = await db.article.findMany({
    where: where24h,
    include: {
      auteur: {
        select: {
          id: true,
          name: true,
          articles: {
            select: {
              ratings: {
                select: {
                  stars: true,
                },
              },
            },
          },
        },
      },
      ratings: { select: { stars: true } },
      menu: true,
      submenu: true,
    },
  });

  let isFallback = false;

  // 2. Repli (Fallback) si aucun article dans les 24h : charger les articles récents globaux
  if (feedArticles.length === 0) {
    isFallback = true;
    feedArticles = await db.article.findMany({
      where,
      include: {
        auteur: {
          select: {
            id: true,
            name: true,
            articles: {
              select: {
                ratings: {
                  select: {
                    stars: true,
                  },
                },
              },
            },
          },
        },
        ratings: { select: { stars: true } },
        menu: true,
        submenu: true,
      },
    });
  }

  // 3. Calculer la réputation globale de chaque journaliste (auteur)
  const sortedArticles = feedArticles.map((article) => {
    const authorRatings = article.auteur.articles.flatMap((art) =>
      art.ratings.map((r) => r.stars)
    );
    const totalStarsSum = authorRatings.reduce((acc, val) => acc + val, 0);
    const authorAverageRating = authorRatings.length > 0 ? totalStarsSum / authorRatings.length : 0;

    return {
      ...article,
      authorAverageRating,
    };
  });

  // 4. Trier par réputation de l'auteur DESC, puis par vues DESC, puis par date publication DESC
  sortedArticles.sort((a, b) => {
    if (b.authorAverageRating !== a.authorAverageRating) {
      return b.authorAverageRating - a.authorAverageRating;
    }
    if (b.views !== a.views) {
      return b.views - a.views;
    }
    return new Date(b.datePublication).getTime() - new Date(a.datePublication).getTime();
  });

  // 5. Paginer les articles triés en mémoire
  const totalLatest = sortedArticles.length;
  const paginatedArticles = sortedArticles.slice(skip, skip + limit);
  const totalPages = Math.ceil(totalLatest / limit);

  // Récupérer les catégories (menus) avec leurs articles respectifs pour les flux secondaires
  const categories = await db.menu.findMany({
    include: {
      articles: {
        where,
        orderBy: { datePublication: 'desc' },
        take: 3,
        include: {
          auteur: { select: { name: true } },
          submenu: true,
        },
      },
    },
    orderBy: { order: 'asc' },
  });

  const activeCategories = categories.filter((cat) => cat.articles.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow w-full">
      {/* Emplacement publicitaire haut */}
      <AdSlot position="header" />

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
        
        {/* Zone de contenu principale (3/4 de la largeur) */}
        <div className="lg:col-span-3 space-y-10">
          
          {/* Section: À la une */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-extrabold tracking-tight text-white border-l-4 border-emerald-500 pl-3">
                À LA UNE
              </h1>
              <span className="text-xs bg-slate-900 border border-slate-800 px-3 py-1 rounded text-slate-400 font-bold uppercase tracking-wider">
                {isFallback ? 'Archives Presse' : 'Sélection 24h'}
              </span>
            </div>

            {paginatedArticles.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/50 rounded-xl border border-slate-800/80">
                <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">Aucun article n'a été publié pour le moment.</p>
                <p className="text-xs text-slate-500 mt-1">Connectez-vous en tant que rédacteur pour composer le premier article.</p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {paginatedArticles.map((article) => (
                    <article
                      key={article.id}
                      className="flex flex-col bg-slate-900/40 rounded-xl overflow-hidden border border-slate-800 hover:border-slate-700/60 hover:shadow-2xl transition-all duration-300 group"
                    >
                      <Link href={`/articles/${article.slug}`} className="block relative h-40 overflow-hidden bg-slate-955">
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
                          <span className="text-[10px] text-slate-450 flex items-center justify-between gap-1 mb-2 font-medium">
                            <span className="flex items-center gap-1 truncate">
                              <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                              {new Date(article.datePublication).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            <span className="flex items-center gap-1 text-slate-500 shrink-0">
                              <Eye className="w-3 h-3 text-cyan-500/80" />
                              {article.views}
                            </span>
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
                        <div className="mt-3 pt-3 border-t border-slate-800/80 flex justify-between items-center text-[10px]">
                          <span className="text-slate-400 flex items-center gap-1 font-medium truncate pr-1">
                            <User className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="truncate">{article.auteur.name}</span>
                            {article.authorAverageRating > 0 && (
                              <span className="text-amber-400 font-extrabold flex items-center gap-0.5 bg-amber-950/25 px-1 py-0.5 rounded border border-amber-500/10 shrink-0">
                                ★ {article.authorAverageRating.toFixed(1)}
                              </span>
                            )}
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

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-8 pt-6 border-t border-slate-800/80">
                    {page > 1 ? (
                      <Link
                        href={`/?page=${page - 1}`}
                        className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-lg text-xs font-bold text-slate-350 hover:text-white transition"
                      >
                        Précédent
                      </Link>
                    ) : (
                      <span className="px-3.5 py-1.5 bg-slate-950 border border-slate-900 text-slate-600 rounded-lg text-xs font-bold select-none cursor-not-allowed">
                        Précédent
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-semibold">
                      Page {page} sur {totalPages}
                    </span>
                    {page < totalPages ? (
                      <Link
                        href={`/?page=${page + 1}`}
                        className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-lg text-xs font-bold text-slate-350 hover:text-white transition"
                      >
                        Suivant
                      </Link>
                    ) : (
                      <span className="px-3.5 py-1.5 bg-slate-950 border border-slate-900 text-slate-600 rounded-lg text-xs font-bold select-none cursor-not-allowed">
                        Suivant
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Section: Flux par catégories */}
          {activeCategories.map((cat) => (
            <section key={cat.id} className="pt-2">
              <div className="flex justify-between items-center mb-6 border-b border-slate-800/80 pb-3">
                <h2 className="text-lg font-black tracking-wider text-white border-l-4 border-cyan-500 pl-3 uppercase">
                  {cat.nom}
                </h2>
                <Link
                  href={`/category/${cat.slug}`}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  Tout voir <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {cat.articles.map((article) => (
                  <div
                    key={article.id}
                    className="bg-slate-900/20 rounded-xl overflow-hidden border border-slate-800 hover:border-slate-750/60 hover:shadow-xl transition-all duration-300 flex flex-col group"
                  >
                    <Link href={`/articles/${article.slug}`} className="block relative h-36 overflow-hidden bg-slate-955">
                      <ArticleMedia src={article.imagePrincipale} alt={article.titre} mode="preview" />
                      {article.submenu && (
                        <span className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-sm text-slate-200 border border-slate-800/60 text-[8px] font-bold uppercase px-2 py-0.5 rounded tracking-wide shadow-md">
                          {article.submenu.nom}
                        </span>
                      )}
                    </Link>
                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] text-slate-550 block mb-1 font-semibold">
                          {new Date(article.datePublication).toLocaleDateString('fr-FR')}
                        </span>
                        <h3 className="text-xs font-bold text-white hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">
                          <Link href={`/articles/${article.slug}`}>{article.titre}</Link>
                        </h3>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-800/50 truncate font-medium">
                        Par {article.auteur.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

        </div>

        {/* Colonne publicitaire latérale droite */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-5 shadow-xl">
            <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase mb-4 pb-2 border-b border-slate-800">
              Espace Publicitaire
            </h3>
            <AdSlot position="left-sidebar" />
          </div>
          
          <div className="sticky top-20">
            <AdSlot position="sidebar" />
          </div>
        </div>

      </div>

      {/* Publicité basse */}
      <AdSlot position="footer" />
    </div>
  );
}
