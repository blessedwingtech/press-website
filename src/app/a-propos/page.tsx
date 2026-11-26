import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Compass, Shield, Users, Sparkles, Scale, Globe, Feather, HeartHandshake } from 'lucide-react';

export const metadata: Metadata = {
  title: "À propos de PressTonik | Plateforme d'information & Outils pour Journalistes Indépendants",
  description:
    "Découvrez la mission de PressTonik : une plateforme technologique ouverte et souveraine dédiée aux journalistes indépendants, analystes et citoyens d'Haïti et de la diaspora.",
};

export default function AProposPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 flex-grow w-full space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Retour à l&apos;accueil
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xl dark:shadow-2xl text-slate-700 dark:text-slate-300 space-y-8 relative overflow-hidden">
        {/* Glow effects */}
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* En-tête */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-widest">
            <Compass className="w-3.5 h-3.5" /> Manifeste &amp; Raison d&apos;être
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
            À propos de PressTonik
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Une infrastructure d&apos;information libre, d&apos;expression citoyenne et d&apos;autonomie pour les plumes haïtiennes.
          </p>
        </div>

        {/* 1. Notre Mission */}
        <section className="space-y-3 relative z-10">
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-l-2 border-emerald-500 pl-3">
            <Feather className="w-4 h-4 text-emerald-500" /> 1. Une plateforme ouverte, non un média pyramidal
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-350">
            <strong>PressTonik</strong> a été pensée dès sa conception pour répondre à un défi majeur : offrir aux journalistes d&apos;investigation, analystes politiques, chroniqueurs culturels et reporters de terrain en Haïti et dans sa diaspora un <strong>espace souverain de publication directe</strong>, libéré des censures institutionnelles, des pressions politiques et des dépendances éditoriales hiérarchiques.
          </p>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-350">
            Contrairement aux rédactions classiques où un comité central décide arbitrairement de ce qui peut être dit, PressTonik fonctionne comme une <strong>plateforme d&apos;outils indépendants</strong> : chaque journaliste accrédité dispose d&apos;un accès direct à son espace de rédaction, conserve la pleine propriété de ses écrits et s&apos;exprime sous sa propre responsabilité intellectuelle et déontologique.
          </p>
        </section>

        {/* 2. Les Piliers fondamentaux */}
        <section className="space-y-4 relative z-10">
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider border-l-2 border-emerald-500 pl-3">
            2. Nos Principes Fondateurs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                <Shield className="w-4 h-4 text-emerald-500" /> Souveraineté &amp; Sécurité des Auteurs
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Dans le contexte délicat d&apos;Haïti, nous ne collectons aucune pièce d&apos;identité sensible susceptible d&apos;exposer les reporters à des représailles. La signature sous nom de plume est respectée et garantie.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                <Scale className="w-4 h-4 text-cyan-500" /> Transparence des Genres Éditoriaux
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Chaque publication est étiquetée selon sa vraie nature : reportage, enquête, analyse, tribune d&apos;opinion ou communiqué officiel. Les faits et les opinions ne sont jamais confondus.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                <HeartHandshake className="w-4 h-4 text-amber-500" /> Modèle Équitable (85 % Auteur)
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Les journalistes et enquêteurs méritent d&apos;être rémunérés dignement pour leur rigueur. Les dons et abonnements des lecteurs sont reversés à 85 % directement à l&apos;auteur.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                <Sparkles className="w-4 h-4 text-purple-500" /> Outils Technologiques &amp; IA Éthique
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Mise à disposition de carnets de recherche modernes pour assister le reporter dans le recoupement de sources publiques et la détection d&apos;angles d&apos;enquête, dans le respect de la charte anti-plagiat.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Infrastructure & Rôle de Blessed Wing Technology */}
        <section className="space-y-3 relative z-10 bg-slate-50 dark:bg-slate-950/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-500" /> 3. Rôle de Blessed Wing Technology (BWT)
          </h2>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            L&apos;infrastructure technique, l&apos;hébergement, la sécurité des données et le développement continu de PressTonik sont assurés par <strong>Blessed Wing Technology (BWT)</strong>. 
          </p>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            BWT agit exclusivement en tant qu&apos;opérateur technique et garant de l&apos;infrastructure numérique. L&apos;entreprise n&apos;interfère pas dans les prises de position, analyses ou enquêtes publiées par les journalistes indépendants de la communauté.
          </p>
        </section>

        {/* Liens de bas de page */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 text-xs font-bold relative z-10">
          <Link
            href="/charte"
            className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            Consulter notre Charte Éditoriale &amp; Déontologique &rarr;
          </Link>
          <Link
            href="/request-account"
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline flex items-center gap-1"
          >
            Rejoindre PressTonik comme Rédacteur &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
