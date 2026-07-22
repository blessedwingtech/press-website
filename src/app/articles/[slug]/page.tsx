import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import AdSlot from '@/components/AdSlot';
import Link from 'next/link';
import { Calendar, User, ArrowLeft, Eye } from 'lucide-react';
import ArticleMedia from '@/components/ArticleMedia';
import RatingSystem from '@/components/RatingSystem';
import ShareButton from '@/components/ShareButton';
import { cookies } from 'next/headers';
import ViewsTrigger from '@/components/ViewsTrigger';

import { Metadata, ResolvingMetadata } from 'next';

export const revalidate = 0; // Pas de cache pour faciliter l'édition temps réel

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata(
  { params }: ArticlePageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const article = await db.article.findUnique({
    where: { slug: params.slug },
    select: { titre: true, contenu: true, imagePrincipale: true, datePublication: true },
  });

  if (!article) {
    return {
      title: 'Article introuvable | PressTonik',
    };
  }

  const plainTextDescription = article.contenu.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...';
  
  // Format the image URL for social media cards
  let imageUrl = article.imagePrincipale;
  if (!imageUrl.startsWith('http')) {
    const siteUrl = process.env.NEXTAUTH_URL || 'https://press.bittonik.com';
    imageUrl = `${siteUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }

  return {
    title: `${article.titre} | PressTonik`,
    description: plainTextDescription,
    openGraph: {
      title: article.titre,
      description: plainTextDescription,
      url: `/articles/${params.slug}`,
      type: 'article',
      publishedTime: article.datePublication.toISOString(),
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.titre,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.titre,
      description: plainTextDescription,
      images: [imageUrl],
    },
  };
}

export default async function ArticleDetail({ params }: ArticlePageProps) {
  const article = await db.article.findUnique({
    where: { slug: params.slug },
    include: {
      auteur: { select: { id: true, name: true } },
      menu: true,
      submenu: true,
    },
  });

  if (!article) {
    notFound();
  }

  const viewsCount = article.views;

  // 2. Récupérer la réputation globale de l'auteur (somme ou moyenne de toutes ses étoiles)
  const authorArticles = await db.article.findMany({
    where: { auteurId: article.auteurId },
    select: { id: true },
  });
  const authorArticleIds = authorArticles.map((a) => a.id);

  const ratings = await db.rating.findMany({
    where: { articleId: { in: authorArticleIds } },
    select: { stars: true },
  });

  const totalVotesCount = ratings.length;
  const averageRating = totalVotesCount > 0 ? ratings.reduce((acc, r) => acc + r.stars, 0) / totalVotesCount : 0;

  // 3. Vérifier si l'utilisateur actuel (session anonyme via cookies) a déjà voté sur cet article précis
  const cookieStore = cookies();
  const sessionIdentifier = cookieStore.get('presstonik-session-id')?.value;
  let userVote = null;

  if (sessionIdentifier) {
    const existingRating = await db.rating.findUnique({
      where: {
        articleId_sessionIdentifier: {
          articleId: article.id,
          sessionIdentifier,
        },
      },
    });
    if (existingRating) {
      userVote = existingRating.stars;
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow w-full">
      <ViewsTrigger articleId={article.id} />
      {/* Publicité haute */}
      <AdSlot position="header" />

      {/* Fil d'Ariane & Bouton retour */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 my-4 text-[11px] text-slate-400">
        <Link
          href="/"
          className="flex items-center gap-1 hover:text-emerald-400 text-slate-350 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Retour à l'accueil
        </Link>
        
        <div className="flex items-center gap-1.5 font-bold tracking-wide uppercase">
          <Link href="/" className="hover:text-emerald-400 transition-colors">Accueil</Link>
          <span className="text-slate-600">/</span>
          <Link href={`/category/${article.menu.slug}`} className="hover:text-emerald-400 transition-colors">
            {article.menu.nom}
          </Link>
          {article.submenu && (
            <>
              <span className="text-slate-600">/</span>
              <Link href={`/category/${article.menu.slug}/${article.submenu.slug}`} className="hover:text-emerald-400 transition-colors">
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
          <div className="mb-6">
            <ArticleMedia src={article.imagePrincipale} alt={article.titre} mode="full" />
          </div>

          {/* Métadonnées de l'article */}
          <div className="border-b border-slate-800/80 pb-6 mb-6">
            <h1 className="text-xl sm:text-3xl font-black text-white leading-tight mb-4">
              {article.titre}
            </h1>
            
            <div className="flex flex-wrap items-center justify-between gap-4">
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
                <span className="flex items-center gap-1.5 font-medium">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span>{viewsCount} vue{viewsCount > 1 ? 's' : ''}</span>
                </span>
              </div>

              {/* Bouton de partage PressTonik */}
              <div>
                <ShareButton articleId={article.id} title={article.titre} url={`/articles/${article.slug}`} />
              </div>
            </div>

            {/* Système de notation des journalistes */}
            <div className="mt-5 pt-4 border-t border-slate-800/50">
              <RatingSystem
                articleId={article.id}
                initialAverage={averageRating}
                initialTotalCount={totalVotesCount}
                userVote={userVote}
              />
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
            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest block mb-2 text-center">
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
