import { db } from '@/lib/db';
import AdSlot from '@/components/AdSlot';
import Link from 'next/link';
import { Calendar, User, ArrowRight, BookOpen, Clock } from 'lucide-react';
// import Image from 'next/image';
import SafeImage from '@/components/SafeImage';

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

  // Récupérer les 20 derniers articles
  const articles = await db.article.findMany({
    where,
    orderBy: { datePublication: 'desc' },
    take: 20,
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
        <h1 className="text-3xl font-black tracking-wider text-white border-l-4 border-emerald-500 pl-3 flex items-center gap-2 uppercase">
          <Clock className="w-8 h-8 text-emerald-400" />
          Les 20 Dernières Actualités
        </h1>
        <p className="text-xs text-slate-400 mt-2">
          Retrouvez les toutes dernières publications de notre équipe de journalistes en temps réel.
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800/80 max-w-4xl mx-auto">
          <BookOpen className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-350 text-base font-semibold">Aucun article récent n'a été publié pour le moment.</p>
          <p className="text-xs text-slate-500 mt-1">Revenez plus tard pour de nouvelles actualités.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Grille principale d'articles */}
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((article) => (
                <article
                  key={article.id}
                  className="flex flex-col bg-slate-900/40 rounded-xl overflow-hidden border border-slate-800 hover:border-slate-700/60 hover:shadow-2xl transition-all duration-300 group"
                >
                  <Link href={`/articles/${article.slug}`} className="block relative h-48 sm:h-52 overflow-hidden bg-slate-950">
                    <SafeImage
                      src={article.imagePrincipale}
                      alt={article.titre}
                      fill
                      sizes="(max-w-768px) 100vw, 33vw"
                      priority={false}
                      className="object-cover transform group-hover:scale-105 transition-transform duration-500 select-none"
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
