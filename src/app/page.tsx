import { db } from '@/lib/db';
import AdSlot from '@/components/AdSlot';
import Link from 'next/link';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
// import Image from 'next/image';
import SafeImage from '@/components/SafeImage';

export const revalidate = 0; // Désactiver le cache pour charger les ajouts en temps réel

interface HomeProps {
  searchParams: {
    page?: string;
  };
}

export default async function Home({ searchParams }: HomeProps) {
  const page = parseInt(searchParams.page || '1') || 1;
  const limit = 6;
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

  // Récupérer les derniers articles avec pagination
  const latestArticles = await db.article.findMany({
    where,
    orderBy: { datePublication: 'desc' },
    take: limit,
    skip,
    include: {
      auteur: { select: { name: true } },
      menu: true,
      submenu: true,
    },
  });

  const totalLatest = await db.article.count({ where });
  const totalPages = Math.ceil(totalLatest / limit);

  // Récupérer les catégories (menus) avec leurs articles respectifs
  const categories = await db.menu.findMany({
    include: {
      articles: {
        where, // Appliquer le filtre de démo
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

  // Filtrer les catégories qui possèdent au moins un article pour ne pas encombrer l'accueil
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
              <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase hidden sm:inline">
                Dernières parutions ({totalLatest} au total)
              </span>
            </div>

            {latestArticles.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/50 rounded-xl border border-slate-800/80">
                <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">Aucun article n'a été publié pour le moment.</p>
                <p className="text-xs text-slate-500 mt-1">Connectez-vous en tant que rédacteur pour composer le premier article.</p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {latestArticles.map((article) => (
                    <article
                      key={article.id}
                      className="flex flex-col bg-slate-900/40 rounded-xl overflow-hidden border border-slate-800 hover:border-slate-700/60 hover:shadow-2xl transition-all duration-300 group"
                    >
                      <Link href={`/articles/${article.slug}`} className="block relative h-48 sm:h-52 overflow-hidden bg-slate-955">
                        <SafeImage
                          src={article.imagePrincipale}
                          alt={article.titre}
                          fill
                          sizes="(max-w-768px) 100vw, 50vw"
                          className="object-cover transform group-hover:scale-105 transition-transform duration-500 select-none"
                          priority={false}
                        />
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-20">
                          <span className="bg-emerald-500 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded shadow-lg tracking-wider">
                            {article.menu.nom}
                          </span>
                          {article.submenu && (
                            <span className="bg-slate-950/80 backdrop-blur-sm text-slate-200 border border-slate-800 font-bold text-[9px] uppercase px-2 py-0.5 rounded shadow-lg tracking-wider">
                              {article.submenu.nom}
                            </span>
                          )}
                        </div>
                      </Link>
                      <div className="p-5 flex-grow flex flex-col justify-between">
                        <div>
                          <span className="text-[11px] text-slate-450 flex items-center gap-1 mb-2 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {new Date(article.datePublication).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                          <h2 className="text-base font-bold text-white hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                            <Link href={`/articles/${article.slug}`}>
                              {article.titre}
                            </Link>
                          </h2>
                          <div
                            className="mt-3 text-xs text-slate-400 line-clamp-3 leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: article.contenu.replace(/<[^>]*>/g, '').substring(0, 160) + '...',
                            }}
                          />
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-800/80 flex justify-between items-center text-[11px]">
                          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            {article.auteur.name}
                          </span>
                          <Link
                            href={`/articles/${article.slug}`}
                            className="text-emerald-400 hover:text-emerald-300 font-extrabold flex items-center gap-0.5 hover:translate-x-0.5 transition-all"
                          >
                            Lire l'article <ArrowRight className="w-3.5 h-3.5" />
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
                <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2 uppercase">
                  <span className="h-5 w-1 bg-cyan-400 rounded-full inline-block" />
                  {cat.nom}
                </h2>
                <Link
                  href={`/category/${cat.slug}`}
                  className="text-xs text-cyan-450 hover:text-cyan-400 font-extrabold flex items-center gap-0.5 transition-colors"
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
                    <Link href={`/articles/${article.slug}`} className="block relative h-36 overflow-hidden bg-slate-950">
                      <SafeImage
                        src={article.imagePrincipale}
                        alt={article.titre}
                        fill
                        sizes="(max-w-768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-102 transition-transform duration-300 select-none"
                        priority={false}
                      />
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

        {/* Colonne latérale (1/4 de la largeur) */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-6">
            
            {/* Widget Publicitaire Latéral */}
            <div>
              <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block mb-2 text-center">
                Partenaire
              </span>
              <AdSlot position="sidebar" />
            </div>

            {/* Widget d'information */}
            <div className="bg-gradient-to-br from-slate-900/60 to-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg">
              <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest mb-3">
                À propos de PressTonik
              </h3>
              <p className="text-[11px] text-slate-450 leading-relaxed font-medium">
                PressTonik est une plateforme de presse rédactionnelle généraliste et sportive en temps réel. Nos journalistes fournissent des analyses objectives sur la politique, la santé, le sport, la culture et l'économie mondiale.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800/50 text-center">
                <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  100% Libre &amp; Public
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Emplacement publicitaire bas */}
      <AdSlot position="footer" />
    </div>
  );
}
