import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import SafeImage from '@/components/SafeImage';
import {
  User,
  Calendar,
  Star,
  BookOpen,
  MessageCircle,
  ExternalLink,
  Crown,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import SupportBox from '@/components/SupportBox';
import JournalistNewsletterCard from '@/components/JournalistNewsletterCard';
import { Metadata } from 'next';

export const revalidate = 60;

interface AuthorPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const author = await db.user.findUnique({
    where: { id: params.id },
    select: { name: true, bio: true, profilePhoto: true },
  });

  if (!author) {
    return { title: 'Auteur introuvable | PressTonik' };
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'https://press.bittonik.com';
  const canonicalUrl = `${baseUrl}/auteurs/${params.id}`;
  const description = author.bio || `Découvrez tous les articles, enquêtes et analyses de ${author.name} sur PressTonik.`;

  return {
    title: `${author.name} - Journaliste Rédacteur`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${author.name} | PressTonik`,
      description,
      url: canonicalUrl,
      type: 'profile',
      images: author.profilePhoto ? [{ url: author.profilePhoto, alt: author.name }] : undefined,
    },
    twitter: {
      card: 'summary',
      title: `${author.name} | PressTonik`,
      description,
      images: author.profilePhoto ? [author.profilePhoto] : undefined,
    },
  };
}

export default async function AuthorProfilePage({ params }: AuthorPageProps) {
  const author = await db.user.findUnique({
    where: { id: params.id },
    include: {
      articles: {
        where: { published: true },
        orderBy: { datePublication: 'desc' },
        include: {
          menu: true,
          submenu: true,
        },
      },
    },
  });

  if (!author) {
    notFound();
  }

  // Calcul de la réputation de l'auteur
  const articleIds = author.articles.map((a) => a.id);
  const ratings = await db.rating.findMany({
    where: { articleId: { in: articleIds } },
    select: { stars: true },
  });

  const totalVotes = ratings.length;
  const avgRating = totalVotes > 0 ? (ratings.reduce((acc, r) => acc + r.stars, 0) / totalVotes).toFixed(1) : '0.0';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full space-y-10">
      {/* Bouton retour */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Retour à l'accueil
        </Link>
      </div>

      {/* En-tête Fiche Journaliste */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Photo */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-emerald-550/40 bg-slate-950 overflow-hidden shrink-0 flex items-center justify-center shadow-lg">
            {author.profilePhoto ? (
              <img src={author.profilePhoto} alt={author.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-slate-600" />
            )}
          </div>

          {/* Informations & Bio */}
          <div className="text-center sm:text-left flex-grow space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center sm:justify-start">
              <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
                {author.name}
              </h1>
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 w-max mx-auto sm:mx-0">
                Journaliste Vérifié
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-350 max-w-2xl leading-relaxed">
              {author.bio || "Journaliste indépendant contribuant à l'information libre et vérifiée sur PressTonik Ayiti."}
            </p>

            {author.twitter && (
              <p className="text-xs text-slate-400 font-mono">
                X/Twitter : <span className="text-cyan-400 font-bold">{author.twitter}</span>
              </p>
            )}

            {/* Statistiques Auteur */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <strong>{author.articles.length}</strong> article{author.articles.length > 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1.5 text-slate-300 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                <strong>{avgRating}</strong> / 5 ({totalVotes} avis)
              </span>
            </div>
          </div>
        </div>

        {/* Bouton Canal WhatsApp Personnel */}
        {author.whatsappChannel && (
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <span>Recevez les scoops et alertes de <strong>{author.name}</strong> directement sur WhatsApp :</span>
            </div>
            <a
              href={author.whatsappChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 shrink-0"
            >
              Rejoindre son canal <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Bloc de Soutien financier direct à l'auteur (85% Journaliste / 15% PressTonik) */}
      <SupportBox
        authorId={author.id}
        authorName={author.name}
      />

      {/* Carte d'Abonnement Newsletter de l'Auteur */}
      <JournalistNewsletterCard
        authorId={author.id}
        authorName={author.name}
        authorAvatar={author.profilePhoto}
        authorBio={author.bio}
        whatsappChannel={author.whatsappChannel}
      />

      {/* Liste des Articles Publiés par ce Journaliste */}
      <div className="space-y-6">
        <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          Articles & Enquêtes Rédigés ({author.articles.length})
        </h2>

        {author.articles.length === 0 ? (
          <p className="text-xs text-slate-500 py-8 text-center bg-slate-900/20 rounded-xl border border-slate-800">
            Aucun article public publié pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {author.articles.map((art) => (
              <Link
                key={art.id}
                href={`/articles/${art.slug}`}
                className="group bg-slate-900/30 border border-slate-800/80 hover:border-emerald-500/40 rounded-2xl p-4 flex flex-col justify-between space-y-4 transition-all shadow-lg hover:shadow-emerald-950/20"
              >
                <div className="space-y-3">
                  <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 relative">
                    <SafeImage
                      src={art.imagePrincipale}
                      alt={art.titre}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {art.isVip && (
                      <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        <Crown className="w-3 h-3 fill-slate-950" /> VIP
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                      {art.menu.nom} {art.submenu ? `• ${art.submenu.nom}` : ''}
                    </span>
                    <h3 className="font-extrabold text-white text-sm sm:text-base group-hover:text-emerald-350 transition-colors line-clamp-2">
                      {art.titre}
                    </h3>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(art.datePublication).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="text-emerald-400 font-bold group-hover:underline">
                    Lire l'article →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
