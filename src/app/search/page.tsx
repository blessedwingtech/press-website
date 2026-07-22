import { db } from '@/lib/db';
import AdSlot from '@/components/AdSlot';
import Link from 'next/link';
import { Calendar, Search, BookOpen } from 'lucide-react';
import ArticleMedia from '@/components/ArticleMedia';

export const revalidate = 0; // Pas de cache

interface SearchPageProps {
  searchParams: {
    q?: string;
    page?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const page = parseInt(searchParams.page || '1') || 1;
  const limit = 12;
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

  // Filtrer par recherche (Titre, Contenu, ou Nom de l'Auteur)
  if (query.trim() !== '') {
    where.OR = [
      { titre: { contains: query } },
      { contenu: { contains: query } },
      { auteur: { name: { contains: query } } },
    ];
  }

  // Récupérer les résultats
  let articles: any[] = [];
  let totalCount = 0;

  if (query.trim() !== '') {
    [articles, totalCount] = await Promise.all([
      db.article.findMany({
        where,
        orderBy: { datePublication: 'desc' },
        take: limit,
        skip,
        include: {
          auteur: { select: { name: true } },
          menu: true,
          submenu: true,
        },
      }),
      db.article.count({ where }),
    ]);
  }

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow w-full">
      {/* Pub haute */}
      <AdSlot position="header" />

      {/* En-tête de recherche */}
      <div className="flex flex-col mb-8 mt-4 bg-slate-900/30 p-6 rounded-xl border border-slate-800/80 shadow-sm">
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2 mb-2">
          <Search className="w-6 h-6 text-teal-400" />
          Recherche
        </h1>
        {query ? (
          <p className="text-slate-400">
            Résultats pour la recherche : <span className="text-white font-bold">"{query}"</span>
          </p>
        ) : (
          <p className="text-slate-400">Veuillez entrer un terme de recherche dans la barre de navigation.</p>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-white border-l-4 border-teal-500 pl-3 uppercase">
          Articles correspondants
        </h2>
        <span className="text-xs text-slate-500 font-semibold">{totalCount} résultat(s)</span>
      </div>

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Liste des articles */}
        <div className="lg:col-span-3">
          {articles.length === 0 && query ? (
            <div className="text-center py-16 bg-slate-900/30 rounded-xl border border-slate-800/80">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-405 font-medium">Aucun article ne correspond à votre recherche.</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/30 rounded-xl border border-slate-800/80">
              <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-405 font-medium">Utilisez la barre de recherche pour trouver des articles.</p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map((article) => (
                  <div
                    key={article.id}
                    className="flex flex-col bg-slate-900/40 rounded-xl overflow-hidden border border-slate-800 hover:border-slate-700/60 transition-all duration-300 group"
                  >
                    <Link href={`/articles/${article.slug}`} className="block relative h-48 overflow-hidden bg-slate-955">
                      <ArticleMedia src={article.imagePrincipale} alt={article.titre} mode="preview" />
                      <span className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-sm text-slate-200 border border-slate-800/60 text-[8px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider shadow-md">
                        {article.menu.nom}
                      </span>
                    </Link>
                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-slate-450 flex items-center gap-1 mb-2 font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {new Date(article.datePublication).toLocaleDateString('fr-FR')}
                        </span>
                        <h2 className="text-base font-bold text-white hover:text-teal-450 transition-colors line-clamp-2 leading-snug">
                          <Link href={`/articles/${article.slug}`}>{article.titre}</Link>
                        </h2>
                        <div
                          className="mt-3 text-xs text-slate-400 line-clamp-3 leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: article.contenu.replace(/<[^>]*>/g, '').substring(0, 160) + '...',
                          }}
                        />
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-850 flex justify-between items-center text-[10px] font-semibold text-slate-450">
                        <span>Par {article.auteur.name}</span>
                        <Link
                          href={`/articles/${article.slug}`}
                          className="text-teal-400 hover:text-teal-350 transition-colors font-extrabold"
                        >
                          Lire l'article
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8 pt-6 border-t border-slate-800/80">
                  {page > 1 ? (
                    <Link
                      href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
                      className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-teal-500/50 rounded-lg text-xs font-bold text-slate-350 hover:text-white transition"
                    >
                      Précédent
                    </Link>
                  ) : (
                    <span className="px-3.5 py-1.5 bg-slate-955 border border-slate-900 text-slate-600 rounded-lg text-xs font-bold select-none cursor-not-allowed">
                      Précédent
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-semibold">
                    Page {page} sur {totalPages}
                  </span>
                  {page < totalPages ? (
                    <Link
                      href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                      className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-teal-500/50 rounded-lg text-xs font-bold text-slate-350 hover:text-white transition"
                    >
                      Suivant
                    </Link>
                  ) : (
                    <span className="px-3.5 py-1.5 bg-slate-955 border border-slate-900 text-slate-600 rounded-lg text-xs font-bold select-none cursor-not-allowed">
                      Suivant
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <span className="text-[9px] font-extrabold text-slate-550 uppercase tracking-widest block mb-2 text-center">
              Partenaire
            </span>
            <AdSlot position="sidebar" />
          </div>
        </div>

      </div>

      {/* Pub basse */}
      <AdSlot position="footer" />
    </div>
  );
}
