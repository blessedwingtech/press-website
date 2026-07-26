import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Mail,
  Shield,
  Calendar,
  BookOpen,
  Eye,
  Star,
  ArrowRight,
  UserCheck,
  LayoutDashboard,
  PenTool,
  TrendingUp,
  ExternalLink,
  MousePointerClick
} from 'lucide-react';

export const revalidate = 0; // Pas de cache pour afficher les statistiques à jour

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  // Récupérer les informations de l'utilisateur en base
  const user = await db.user.findUnique({
    where: { email: session.user.email! }
  });

  if (!user) {
    redirect('/login');
  }

  // Traduction des rôles
  const roleTranslations: Record<string, { label: string; color: string; bg: string; border: string }> = {
    admin: {
      label: 'Administrateur',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20'
    },
    journalist: {
      label: 'Journaliste Rédacteur',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20'
    },
    reader: {
      label: 'Lecteur Privilégié',
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
      border: 'border-teal-500/20'
    }
  };

  const currentRole = roleTranslations[user.role] || {
    label: user.role,
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20'
  };

  // 1. Statistiques spécifiques pour les journalistes
  let stats = {
    articles: 0,
    views: 0,
    rating: '0.0',
    ratingsCount: 0
  };

  if (user.role === 'journalist') {
    stats.articles = await db.article.count({
      where: { auteurId: user.id }
    });

    const viewsAggregate = await db.article.aggregate({
      where: { auteurId: user.id },
      _sum: { views: true }
    });
    stats.views = viewsAggregate._sum.views ?? 0;

    const journalistArticles = await db.article.findMany({
      where: { auteurId: user.id },
      select: { id: true }
    });
    const articleIds = journalistArticles.map((a) => a.id);

    const ratings = await db.rating.findMany({
      where: { articleId: { in: articleIds } },
      select: { stars: true }
    });
    stats.ratingsCount = ratings.length;

    if (ratings.length > 0) {
      const sum = ratings.reduce((acc, r) => acc + r.stars, 0);
      stats.rating = (sum / ratings.length).toFixed(1);
    }
  }

  // 2. Récupérer les campagnes publicitaires de l'utilisateur (s'il en possède)
  const userAds = await db.ad.findMany({
    where: { ownerId: user.id },
    orderBy: { titre: 'asc' }
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full space-y-8">
      {/* Profil Global */}
      <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-8">
        {/* Glow effects */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* En-tête du profil */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-800 relative z-10">
          <div className="w-24 h-24 rounded-2xl border-2 border-slate-800 bg-slate-950 overflow-hidden flex items-center justify-center relative shrink-0">
            {user.profilePhoto ? (
              <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-slate-700" />
            )}
          </div>

          <div className="text-center sm:text-left flex-grow space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 justify-center sm:justify-start">
              <h1 className="text-2xl font-black text-white uppercase tracking-wider">{user.name}</h1>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${currentRole.bg} ${currentRole.color} ${currentRole.border} w-max mx-auto sm:mx-0`}>
                {currentRole.label}
              </span>
            </div>
            <p className="text-sm text-slate-400 flex items-center gap-1.5 justify-center sm:justify-start">
              <Mail className="w-4 h-4 text-teal-400" /> {user.email}
            </p>
          </div>
        </div>

        {/* Section Statistiques Journaliste */}
        {user.role === 'journalist' && (
          <div className="space-y-4 relative z-10">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <PenTool className="w-4 h-4 text-amber-400" /> Vos Performances Rédactionnelles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950/60 border border-slate-800/80 p-5 rounded-xl text-center space-y-1">
                <BookOpen className="w-6 h-6 text-teal-400 mx-auto" />
                <p className="text-2xl font-black text-white">{stats.articles}</p>
                <p className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider">Articles Écrits</p>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/80 p-5 rounded-xl text-center space-y-1">
                <Eye className="w-6 h-6 text-blue-400 mx-auto" />
                <p className="text-2xl font-black text-white">{stats.views}</p>
                <p className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider">Lectures uniques</p>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/80 p-5 rounded-xl text-center space-y-1">
                <Star className="w-6 h-6 text-amber-400 fill-amber-400/25 mx-auto" />
                <p className="text-2xl font-black text-white">{stats.rating} <span className="text-xs text-slate-500">/ 5</span></p>
                <p className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider">Note Moyenne ({stats.ratingsCount} votes)</p>
              </div>
            </div>
          </div>
        )}

        {/* Métadonnées du compte */}
        <div className="bg-slate-950/40 border border-slate-800/80 p-5 rounded-xl text-xs sm:text-sm text-slate-300 space-y-3 relative z-10">
          <div className="flex justify-between items-center py-1.5 border-b border-slate-800/40">
            <span className="text-slate-400 flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]"><Calendar className="w-4 h-4 text-teal-400" /> Date d'inscription</span>
            <span className="text-white font-semibold">
              {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
          <div className="flex justify-between items-center py-1.5">
            <span className="text-slate-400 flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]"><UserCheck className="w-4 h-4 text-teal-400" /> Statut du compte</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              {user.status === 'active' ? 'Actif' : 'Banni / Restreint'}
            </span>
          </div>
        </div>

        {/* Liens de redirection selon le rôle */}
        <div className="pt-4 flex flex-col sm:flex-row gap-4 relative z-10">
          {user.role === 'admin' && (
            <Link
              href="/admin"
              className="flex-grow flex justify-center items-center gap-1.5 py-3 px-4 rounded-xl text-sm font-bold bg-teal-500 hover:bg-teal-600 text-white transition-all shadow-lg"
            >
              <Shield className="w-4 h-4" /> Accéder à la console Admin <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          {user.role === 'journalist' && (
            <Link
              href="/journalist"
              className="flex-grow flex justify-center items-center gap-1.5 py-3 px-4 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-lg"
            >
              <LayoutDashboard className="w-4 h-4" /> Espace Rédacteur <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          <Link
            href="/"
            className="flex-grow flex justify-center items-center gap-1.5 py-3 px-4 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-all border border-slate-700"
          >
            Retourner à l'accueil
          </Link>
        </div>
      </div>

      {/* Section des Campagnes Publicitaires (si applicable) */}
      {userAds.length > 0 && (
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden space-y-6">
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-white border-b border-slate-800/60 pb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              Vos Campagnes Sponsorisées & Publicités
            </h2>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Retrouvez ci-dessous l'affichage et les statistiques de clics de vos annonces sponsorisées diffusées sur PressTonik Ayiti.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userAds.map((ad) => (
              <div key={ad.id} className="border border-slate-800 bg-slate-950/40 rounded-xl overflow-hidden flex flex-col justify-between p-4 space-y-4">
                <div className="space-y-3">
                  <div className="w-full h-24 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 relative">
                    <img src={ad.imageUrl} alt={ad.titre} className="w-full h-full object-cover" />
                    <span className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-sm text-[8px] font-black uppercase px-2 py-0.5 rounded border border-slate-800 text-amber-400">
                      {ad.position}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-xs sm:text-sm">{ad.titre}</h3>
                    <a
                      href={ad.lien}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-teal-400 hover:underline flex items-center gap-1 mt-1 font-semibold"
                    >
                      {ad.lien} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-900 text-center">
                  <div className="space-y-0.5">
                    <p className="text-slate-500 uppercase tracking-widest text-[7px] font-black">Impressions</p>
                    <p className="text-white font-black text-sm">{ad.impressions}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-slate-500 uppercase tracking-widest text-[7px] font-black">Clics</p>
                    <p className="text-white font-black text-sm">{ad.clicks}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-slate-500 uppercase tracking-widest text-[7px] font-black">CTR (Taux)</p>
                    <p className="text-amber-500 font-extrabold font-mono text-sm">
                      {ad.impressions > 0 ? `${((ad.clicks / ad.impressions) * 100).toFixed(1)}%` : '0.0%'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">État :</span>
                  {ad.active ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase tracking-widest text-[8px]">En diffusion</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-500 font-bold uppercase tracking-widest text-[8px]">En pause</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
