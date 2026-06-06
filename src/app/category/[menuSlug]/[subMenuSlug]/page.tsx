import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import AdSlot from '@/components/AdSlot';
import Link from 'next/link';
import { Calendar, ChevronRight, BookOpen } from 'lucide-react';
// import Image from 'next/image';
import SafeImage from '@/components/SafeImage';

export const revalidate = 0; // Pas de cache

interface SubMenuPageProps {
  params: {
    menuSlug: string;
    subMenuSlug: string;
  };
  searchParams: {
    page?: string;
  };
}

export default async function SubMenuCategoryPage({ params, searchParams }: SubMenuPageProps) {
  const menu = await db.menu.findUnique({
    where: { slug: params.menuSlug },
  });

  if (!menu) {
    notFound();
  }

  const submenu = await db.subMenu.findUnique({
    where: { slug: params.subMenuSlug },
  });

  if (!submenu || submenu.menuId !== menu.id) {
    notFound();
  }

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

  // Filtrer par sous-catégorie et cross-publishing Actualités
  if (menu.slug === 'actualites') {
    where.OR = [
      { submenuId: submenu.id },
      { actualitesSubmenuId: submenu.id },
    ];
  } else {
    where.submenuId = submenu.id;
  }

  // Récupérer les articles associés à cette sous-catégorie spécifique avec pagination
  const [articles, totalCount] = await Promise.all([
    db.article.findMany({
      where,
      orderBy: { datePublication: 'desc' },
      take: limit,
      skip,
      include: {
        auteur: { select: { name: true } },
      },
    }),
    db.article.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow w-full">
      {/* Pub haute */}
      <AdSlot position="header" />

      {/* Fil d'Ariane */}
      <div className="flex items-center gap-1.5 my-4 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
        <Link href="/" className="hover:text-emerald-450 transition-colors">Accueil</Link>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <Link href={`/category/${menu.slug}`} className="hover:text-emerald-450 transition-colors">{menu.nom}</Link>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="text-slate-205">{submenu.nom}</span>
      </div>

      {/* En-tête de section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-white border-l-4 border-emerald-500 pl-3 uppercase">
          {menu.nom} &mdash; <span className="text-emerald-400">{submenu.nom}</span>
        </h1>
        <span className="text-xs text-slate-500 font-semibold">{totalCount} article(s) trouvé(s)</span>
      </div>

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Liste des articles */}
        <div className="lg:col-span-3">
          {articles.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/30 rounded-xl border border-slate-800/80">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-405 font-medium">Aucun article n'est encore disponible dans cette sous-rubrique.</p>
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
                      <SafeImage
                        src={article.imagePrincipale}
                        alt={article.titre}
                        fill
                        sizes="(max-w-768px) 100vw, 50vw"
                        className="object-cover transform group-hover:scale-103 transition-transform duration-350 select-none"
                        priority={false}
                      />
                    </Link>
                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-slate-450 flex items-center gap-1 mb-2 font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {new Date(article.datePublication).toLocaleDateString('fr-FR')}
                        </span>
                        <h2 className="text-base font-bold text-white hover:text-emerald-455 transition-colors line-clamp-2 leading-snug">
                          <Link href={`/articles/${article.slug}`}>{article.titre}</Link>
                        </h2>
                        <div
                          className="mt-3 text-xs text-slate-400 line-clamp-3 leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: article.contenu.replace(/<[^>]*>/g, '').substring(0, 160) + '...',
                          }}
                        />
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-855 flex justify-between items-center text-[10px] font-semibold text-slate-450">
                        <span>Par {article.auteur.name}</span>
                        <Link
                          href={`/articles/${article.slug}`}
                          className="text-emerald-400 hover:text-emerald-350 transition-colors font-extrabold"
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
                      href={`/category/${menu.slug}/${submenu.slug}?page=${page - 1}`}
                      className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-lg text-xs font-bold text-slate-350 hover:text-white transition"
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
                      href={`/category/${menu.slug}/${submenu.slug}?page=${page + 1}`}
                      className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-lg text-xs font-bold text-slate-355 hover:text-white transition"
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
            <span className="text-[9px] font-extrabold text-slate-555 uppercase tracking-widest block mb-2 text-center">
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
