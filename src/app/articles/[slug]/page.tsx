import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import AdSlot from '@/components/AdSlot';
import Link from 'next/link';
import {
  Calendar,
  User,
  ArrowLeft,
  Eye,
  Crown,
  Lock,
  MessageCircle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import ArticleMedia from '@/components/ArticleMedia';
import RatingSystem from '@/components/RatingSystem';
import ShareButton from '@/components/ShareButton';
import { cookies } from 'next/headers';
import ViewsTrigger from '@/components/ViewsTrigger';
import SupportBox from '@/components/SupportBox';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

import { Metadata, ResolvingMetadata } from 'next';

export const revalidate = 60; // Cache ISR 60s avec revalidation automatique lors des modifications

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

// Extraction sécurisée d'accroche côté serveur pour protéger le contenu VIP
function getSafePreviewHtml(html: string, maxLen = 350): string {
  const clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  const pMatch = clean.match(/^(<p>[\s\S]*?<\/p>)/i);
  if (pMatch && pMatch[1].replace(/<[^>]+>/g, '').trim().length >= 120) {
    return pMatch[1];
  }
  const stripped = clean.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const truncated = stripped.slice(0, maxLen);
  return `<p>${truncated}...</p>`;
}

export async function generateMetadata(
  { params }: ArticlePageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const article = await db.article.findUnique({
    where: { slug: params.slug },
    select: {
      titre: true,
      contenu: true,
      imagePrincipale: true,
      datePublication: true,
      isVip: true,
    },
  });

  if (!article) {
    return {
      title: 'Article introuvable | PressTonik',
    };
  }

  const plainTextDescription = article.contenu.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...';

  const imageUrl = article.imagePrincipale.startsWith('http')
    ? article.imagePrincipale
    : `https://press.bittonik.com${article.imagePrincipale}`;

  return {
    title: `${article.isVip ? '🔒 [VIP] ' : ''}${article.titre} | PressTonik`,
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
  const session = await getServerSession(authOptions);

  const article = await db.article.findUnique({
    where: { slug: params.slug },
    include: {
      auteur: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
          bio: true,
          whatsappChannel: true,
          twitter: true,
        },
      },
      menu: true,
      submenu: true,
    },
  });

  if (!article) {
    notFound();
  }

  const viewsCount = article.views;

  // 1. Contrôle d'accès VIP sécurisé côté serveur
  const userRole = (session?.user as any)?.role;
  const isAuthor = session?.user?.id === article.auteurId;
  const isVipUser = userRole === 'reader_vip' || userRole === 'admin' || userRole === 'journalist' || isAuthor;
  const isPaywalled = article.isVip && !isVipUser;

  // Contenu servi : seulement l'aperçu si bloqué, l'intégralité si débloqué
  const displayedContent = isPaywalled
    ? getSafePreviewHtml(article.contenu)
    : article.contenu;

  // 2. Récupérer la réputation globale de l'auteur
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

  // 3. Vérifier si l'utilisateur actuel a déjà voté
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
          
          {/* Média d'illustration */}
          <div className="mb-6 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
            <ArticleMedia
              src={article.imagePrincipale}
              alt={article.titre}
              mode="full"
            />
          </div>

          {/* En-tête de l'article */}
          <div className="mb-8 border-b border-slate-800 pb-6 space-y-4">
            
            {/* Badge de catégorie et Badge VIP */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                {article.menu.nom}
              </span>

              {article.submenu && (
                <span className="bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-slate-700">
                  {article.submenu.nom}
                </span>
              )}

              {article.isVip && (
                <span className="bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  Enquête Exclusive VIP
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              {article.titre}
            </h1>
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <User className="w-4 h-4 text-emerald-400" />
                  Par{' '}
                  <Link
                    href={`/auteurs/${article.auteurId}`}
                    className="font-bold text-slate-200 hover:text-emerald-400 hover:underline transition-colors"
                  >
                    {article.auteur.name}
                  </Link>
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

          {/* Contenu Rich Text (complet ou aperçu si paywall actif) */}
          <div
            className="prose prose-invert prose-emerald max-w-none text-slate-350 leading-relaxed text-sm sm:text-base space-y-4"
            dangerouslySetInnerHTML={{ __html: displayedContent }}
          />

          {/* LE PAYWALL SÉCURISÉ CÔTÉ SERVEUR */}
          {isPaywalled && (
            <div className="relative mt-2 pt-14 pb-12 px-6 sm:px-10 rounded-2xl bg-gradient-to-t from-slate-950 via-slate-900 to-transparent border border-amber-550/30 text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-950/40">
                <Lock className="w-6 h-6" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                  Enquête d'Investigation Réservée
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Débloquez l'intégralité de cette enquête
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Ce travail approfondi de terrain est financé par nos abonnés. Rejoignez le cercle PressTonik VIP pour lire ce dossier complet, sans aucune publicité, et soutenir directement nos journalistes.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/abonnement"
                  className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2 transition-transform hover:scale-105"
                >
                  <Crown className="w-4 h-4 fill-slate-950" />
                  S'abonner dès 4.99 $ / 650 HTG
                </Link>
                {!session && (
                  <Link
                    href={`/login?callbackUrl=/articles/${article.slug}`}
                    className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs uppercase tracking-wider border border-slate-700 transition"
                  >
                    Déjà membre VIP ? Se connecter
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* CANAL WHATSAPP PERSONNEL DU JOURNALISTE INDÉPENDANT */}
          {article.auteur.whatsappChannel && (
            <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                    Canal WhatsApp de {article.auteur.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Suivez les scoops et alertes de terrain de ce journaliste indépendant en direct.
                  </p>
                </div>
              </div>
              <a
                href={article.auteur.whatsappChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shrink-0 text-center flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40 transition-all hover:scale-105"
              >
                Rejoindre son canal <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Bloc de Soutien / Pourboire pour l'auteur (85% Journaliste / 15% PressTonik) */}
          <SupportBox
            articleId={article.id}
            articleTitle={article.titre}
            authorName={article.auteur.name}
            authorId={article.auteurId}
          />

          {/* Mention de responsabilité légale de la presse indépendante */}
          <div className="mt-6 pt-4 border-t border-slate-800/60 text-[10px] text-slate-500 flex items-start gap-2 leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
            <span>
              Cet article d'investigation est publié sous la responsabilité éditoriale de son auteur indépendant dans le cadre de la charte de qualité et de déontologie de la plateforme <strong>PressTonik Ayiti</strong>.
            </span>
          </div>
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
