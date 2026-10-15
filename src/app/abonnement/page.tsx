import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import Link from 'next/link';
import {
  Crown,
  Check,
  ShieldCheck,
  Sparkles,
  Zap,
  EyeOff,
  BookOpen,
  Headphones,
  Award,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import SubscriptionCard from '@/components/SubscriptionCard';

export const metadata = {
  title: 'Abonnement PressTonik VIP & PRO | Journalisme Indépendant',
  description:
    'Rejoignez le cercle des membres VIP de PressTonik. Profitez d’une expérience sans publicité, des dossiers d’investigation exclusifs et soutenez la rédaction.',
};

export default async function AbonnementPage() {
  const session = await getServerSession(authOptions);

  let currentUser = null;
  if (session?.user?.email) {
    currentUser = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true, role: true },
    });
  }

  const isVip = currentUser?.role === 'reader_vip' || currentUser?.role === 'admin';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full space-y-16">
      {/* En-tête Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-widest">
          <Crown className="w-4 h-4 text-amber-400" /> Cercle Privilégié PressTonik
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Passez à la vitesse supérieure avec <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">PressTonik VIP</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-350 leading-relaxed">
          Accédez à une information vérifiée, approfondie et 100% libre de toute influence. Choisissez votre formule et profitez d'une expérience de lecture d'élite.
        </p>
      </div>

      {/* Bannière si déjà VIP */}
      {isVip && (
        <div className="bg-emerald-550/10 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-2 max-w-2xl mx-auto">
          <p className="text-emerald-400 font-black text-lg flex items-center justify-center gap-2">
            <Crown className="w-5 h-5 text-amber-400 fill-amber-400" /> Vous êtes déjà membre PressTonik VIP !
          </p>
          <p className="text-xs text-slate-350">
            Toutes les fonctionnalités avancées (navigation sans pub, enquêtes réservées) sont actives sur votre compte.
          </p>
          <div className="pt-2">
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
            >
              Gérer votre compte dans votre profil <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Grille des Formules (Client interactif avec switch USD / HTG) */}
      <SubscriptionCard currentUser={currentUser} />

      {/* Grille détaillée des fonctionnalités PRO / VIP */}
      <div className="space-y-8 pt-8">
        <div className="text-center space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
            Tout ce que débloque votre adhésion VIP
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Un abonnement conçu pour les décideurs, chercheurs, passionnés d'actualité et la diaspora.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="p-3 w-max rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <EyeOff className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Lecture 100% Sans Publicité
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dites adieu aux bannières publicitaires et aux distractions. Profitez d'un temps de chargement ultra-rapide et d'une clarté visuelle absolue.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="p-3 w-max rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Dossiers & Enquêtes Exclusives
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Accès illimité aux grandes enquêtes d'investigation, analyses économiques, décryptages géopolitiques et données de marché non publiées sur le flux général.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="p-3 w-max rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Badge VIP & Reconnaissance
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Votre statut VIP vous distingue avec un badge officiel doré sur votre profil, lors de la notation des articles et de vos interactions au sein de la communauté.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="p-3 w-max rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Headphones className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Synthèse Audio & Mode Zen
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Écoutez le résumé exécutif de vos articles préférés en mobilité. Parfait pour rester informé lors de vos déplacements ou dans les transports.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="p-3 w-max rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Alertes Flash & Veille WhatsApp/Email
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Recevez les alertes urgentes "Breaking News" avant le reste du public, accompagnées de synthèses contextuelles rédigées par nos correspondants.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="p-3 w-max rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Financement du Journalisme Éthique
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Votre abonnement finance directement le travail de terrain des journalistes haïtiens, leur sécurité et des outils technologiques de pointe.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ / Réassurance */}
      <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 sm:p-10 space-y-6">
        <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-teal-400" /> Questions Fréquemment Posées
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-350">
          <div className="space-y-1.5">
            <h4 className="font-bold text-white text-sm">Puis-je payer avec MonCash en Haïti ?</h4>
            <p className="text-slate-400 leading-relaxed">
              Oui ! Notre passerelle BitTonik Pay-Hub prend en charge MonCash en Gourdes (HTG). Vous pouvez également régler par Carte Bancaire (Visa/Mastercard) ou PayPal depuis n'importe quel pays.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-white text-sm">Puis-je annuler à tout moment ?</h4>
            <p className="text-slate-400 leading-relaxed">
              Absolument. Il n'y a aucun engagement de durée. Vous pouvez suspendre ou annuler votre abonnement en un clic depuis votre espace membre.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-white text-sm">Quand mes avantages sont-ils activés ?</h4>
            <p className="text-slate-400 leading-relaxed">
              Instantanément. Dès que le paiement est confirmé par Pay-Hub, notre webhook met à jour votre compte en temps réel et débloque le mode sans publicité.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-white text-sm">Besoin d'une facture pour votre entreprise ?</h4>
            <p className="text-slate-400 leading-relaxed">
              Chaque paiement génère un reçu numérique téléchargeable conforme aux normes professionnelles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
