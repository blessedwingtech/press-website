import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import AdSlot from '@/components/AdSlot';
import Link from 'next/link';
import { Calendar, User, ArrowLeft } from 'lucide-react';
// import Image from 'next/image';
import SafeImage from '@/components/SafeImage';

export const revalidate = 0; // Pas de cache pour faciliter l'édition temps réel

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export default async function ArticleDetail({ params }: ArticlePageProps) {
  const article = await db.article.findUnique({
    where: { slug: params.slug },
    include: {
      auteur: { select: { name: true } },
      menu: true,
      submenu: true,
    },
  });

  if (!article) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow w-full">
      {/* Publicité haute */}
      <AdSlot position="header" />

      {/* Fil d'Ariane & Bouton retour */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 my-4 text-[11px] text-slate-400">
        <Link
          href="/"
          className="flex items-center gap-1 hover:text-emerald-450 text-slate-350 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Retour à l'accueil
        </Link>
        
        <div className="flex items-center gap-1.5 font-bold tracking-wide uppercase">
          <Link href="/" className="hover:text-emerald-450 transition-colors">Accueil</Link>
          <span className="text-slate-650">/</span>
          <Link href={`/category/${article.menu.slug}`} className="hover:text-emerald-450 transition-colors">
            {article.menu.nom}
          </Link>
          {article.submenu && (
            <>
              <span className="text-slate-655">/</span>
              <Link href={`/category/${article.menu.slug}/${article.submenu.slug}`} className="hover:text-emerald-455 transition-colors">
                {article.submenu.nom}
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Corps de l'article (3/4 de la largeur) */}
        <div className="lg:col-span-3 bg-slate-900/30 border border-slate-800/80 rounded-xl p-5 sm:p-8 shadow-2xl">
          
          {/* Bannière d'illustration principale */}
          <div className="w-full h-64 sm:h-[400px] relative rounded-lg overflow-hidden border border-slate-800 bg-slate-955 mb-6">
            <SafeImage
              src={article.imagePrincipale}
              alt={article.titre}
              fill
              sizes="(max-w-768px) 100vw, 75vw"
              className="object-cover select-none"
              priority
            />
          </div>

          {/* Métadonnées de l'article */}
          <div className="border-b border-slate-800/80 pb-6 mb-6">
            <h1 className="text-xl sm:text-3xl font-black text-white leading-tight mb-4">
              {article.titre}
            </h1>
            
            <div className="flex flex-wrap gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <User className="w-4 h-4 text-emerald-400" />
                Par <span className="font-bold text-slate-200">{article.auteur.name}</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Le {new Date(article.datePublication).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* Contenu Rich Text */}
          <div
            className="prose prose-invert prose-emerald max-w-none text-slate-350 leading-relaxed text-sm sm:text-base space-y-4"
            dangerouslySetInnerHTML={{ __html: article.contenu }}
          />
        </div>

        {/* Colonne publicitaire latérale (1/4 de la largeur) */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <span className="text-[9px] font-extrabold text-slate-550 uppercase tracking-widest block mb-2 text-center">
              Partenaire
            </span>
            <AdSlot position="sidebar" />
          </div>
        </div>

      </div>

      {/* Publicité basse */}
      <AdSlot position="footer" />
    </div>
  );
}
