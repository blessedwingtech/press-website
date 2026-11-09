import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, CreditCard, Award, Lock, Scale, UserCheck, Sparkles, Globe, BellRing } from 'lucide-react';

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation & Charte Écosystème | PressTonik",
  description:
    "Conditions générales d'utilisation, charte des abonnements VIP, modèle de rémunération des journalistes (85/15), adhésion sécurisée et gouvernance de PressTonik au sein de Blessed Wing Technology.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour à l&apos;accueil
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl text-slate-300 space-y-8">
        <div className="border-b border-slate-800 pb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest">
            <Scale className="w-3.5 h-3.5" /> Cadre Juridique & Déontologique
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            Conditions Générales d&apos;Utilisation & Charte Écosystème
          </h1>
          <p className="text-xs text-slate-400">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} • Applicable à l&apos;ensemble des lecteurs, abonnés et journalistes indépendants.
          </p>
        </div>

        {/* 1. Présentation & Écosystème BWT */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" /> 1. Présentation & Intégration Écosystème (BWT)
          </h2>
          <p className="text-xs sm:text-sm text-slate-350 leading-relaxed">
            <strong>PressTonik</strong> (accessible via <code>https://press.bittonik.com</code>) est la plateforme technologique et éditoriale d&apos;investigation journalistique et d&apos;actualités en continu propulsée par <strong>Blessed Wing Technology (BWT)</strong>. PressTonik s&apos;inscrit au cœur d&apos;un écosystème numérique interconnecté comprenant 4 piliers technologiques :
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
              <span className="font-bold text-emerald-400 block mb-0.5">PressTonik</span>
              <p className="text-slate-400 text-[11px]">Journalisme d&apos;investigation, actualités en continu et analyses de fond.</p>
            </div>
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
              <span className="font-bold text-cyan-400 block mb-0.5">BitTonik</span>
              <p className="text-slate-400 text-[11px]">Réseau social créatif, challenges culturels et monétisation des créateurs.</p>
            </div>
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
              <span className="font-bold text-amber-400 block mb-0.5">ShopTonik</span>
              <p className="text-slate-400 text-[11px]">Boutique officielle, e-commerce et distribution des produits de créateurs.</p>
            </div>
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
              <span className="font-bold text-purple-400 block mb-0.5">MemoTonik</span>
              <p className="text-slate-400 text-[11px]">Espace cloud souverain de sauvegarde et partage sécurisé de médias et souvenirs.</p>
            </div>
          </div>
        </section>

        {/* 2. Processus d'inscription et Validation Administrateur Obligatoire */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2 text-teal-400">
            <UserCheck className="w-4 h-4 text-teal-400" /> 2. Accès Membre & Validation Manuelle Obligatoire
          </h2>
          <p className="text-xs sm:text-sm text-slate-350 leading-relaxed">
            Pour préserver la crédibilité de l&apos;information et prévenir les usurpations d&apos;identité, tout compte utilisateur (Rédacteur, Journaliste ou Lecteur VIP), qu&apos;il soit initié via formulaire classique ou via <strong>Google Sign-In</strong>, est soumis à un <strong>protocole strict de validation manuelle par l&apos;administration</strong> :
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-400">
            <li>L&apos;inscription par Google ne donne aucun accès immédiat sans agrément préalable : une demande certifiée est générée et examinée par le comité d&apos;administration.</li>
            <li>Dès validation, l&apos;utilisateur est notifié et peut se connecter en un clic avec son compte Google ou ses identifiants.</li>
            <li>PressTonik se réserve le droit souverain de rejeter ou de suspendre tout compte ne respectant pas les critères déontologiques de la plateforme.</li>
          </ul>
        </section>

        {/* 3. Statut et Responsabilité des Journalistes */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
            3. Statut des Journalistes & Déontologie Éditoriale
          </h2>
          <p className="text-xs sm:text-sm text-slate-350 leading-relaxed">
            Les journalistes et analystes publiant sur PressTonik agissent en qualité de <strong>créateurs et rédacteurs indépendants accrédités</strong>. Chaque auteur conserve l&apos;entière responsabilité morale, civile et juridique de ses écrits.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-400">
            <li>Engagement formel sur la vérification des sources, la probité intellectuelle et la lutte contre les fake news.</li>
            <li>Interdiction formelle de propos diffamatoires, d&apos;incitations à la haine ou d&apos;atteintes à la vie privée.</li>
            <li>Droit d&apos;intervention : PressTonik peut dépublier un article ou demander une rectification en cas de signalement fondé.</li>
          </ul>
        </section>

        {/* 4. Abonnements VIP & Confort de Lecture */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2 text-amber-400">
            <Lock className="w-4 h-4 text-amber-400" /> 4. Abonnements PressTonik VIP & Technologies de Lecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-350 leading-relaxed">
            PressTonik propose une adhésion premium <strong>VIP / PRO</strong> (4.99 $ USD / mois ou 39.99 $ USD / an, convertible en Gourdes HTG via MonCash) :
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-400">
            <li>Accès illimité aux <strong>grandes enquêtes exclusives</strong> protégées par le Paywall.</li>
            <li>Navigation épurée <strong>100% sans publicité</strong> (exclusion des bannières AdSense et annonceurs).</li>
            <li>Outils exclusifs : <strong>Synthèse Vocale Audio TTS</strong> (écoute des articles) et <strong>Mode Zen</strong> sans distraction.</li>
            <li>Affichage progressif fluide (« Lire la suite ») optimisé pour smartphone sans rupture de défilement.</li>
          </ul>
        </section>

        {/* 5. Pourboires et Partage des Revenus 85% / 15% */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2 text-emerald-400">
            <Award className="w-4 h-4 text-emerald-400" /> 5. Dons, Pourboires Directs & Rémunération Équitable (85% / 15%)
          </h2>
          <p className="text-xs sm:text-sm text-slate-350 leading-relaxed">
            Pour assurer l&apos;indépendance financière du journalisme en Haïti et dans la Caraïbe, chaque article dispose d&apos;un module de soutien direct permettant aux lecteurs de verser un pourboire à l&apos;auteur via <strong>BitTonik Pay-Hub</strong>.
          </p>
          <div className="bg-slate-950/80 border border-emerald-500/30 p-4 rounded-xl text-xs space-y-2">
            <p className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Clé de répartition contractuelle :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Part Journaliste</span>
                <span className="text-2xl font-black text-emerald-400">85 %</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Versé directement sur le solde disponible de l&apos;auteur.</p>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Frais Plateforme & Infrastructure</span>
                <span className="text-2xl font-black text-slate-350">15 %</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Couvre les frais de passerelle MonCash/Stripe, serveurs et sécurité.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Modalités de Retrait (Payouts) */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-teal-400" /> 6. Modalités de Retrait des Fonds (Payouts)
          </h2>
          <p className="text-xs sm:text-sm text-slate-350 leading-relaxed">
            Les journalistes accrédités peuvent demander un reversement dès que leur solde atteint le seuil minimal :
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-400">
            <li><strong>MonCash (Digicel Haïti - HTG) :</strong> Transfert direct sur portefeuille mobile.</li>
            <li><strong>Virement Bancaire (SPIH Haïti / Wire International) :</strong> Transfert vers Unibank, Sogebank, BUH ou banques internationales.</li>
            <li><strong>PayPal / Stripe Payout (USD) :</strong> Pour les correspondants basés dans la diaspora.</li>
          </ul>
          <p className="text-xs text-slate-400">
            Délai d&apos;exécution : 24 à 48 heures ouvrées après contrôle de conformité anti-fraude.
          </p>
        </section>

        {/* 7. Notifications Web Push & Hub d'Avis */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
            <BellRing className="w-4 h-4 text-cyan-400" /> 7. Alertes Flash Web Push & Hub d&apos;Avis Centralisé
          </h2>
          <p className="text-xs sm:text-sm text-slate-350 leading-relaxed">
            PressTonik utilise le protocole Web Push sécurisé (VAPID) pour informer en direct les abonnés des alertes majeures d&apos;actualité. Les évaluations et avis des lecteurs sont synchronisés avec la plateforme souveraine <strong>Avis-Hub</strong> (<code>avis.bittonik.com</code>) pour garantir l&apos;authenticité des retours publics.
          </p>
        </section>

        {/* 8. Contact & Service Juridique */}
        <section className="space-y-3 border-t border-slate-800 pt-6">
          <h2 className="text-sm font-bold text-slate-350 uppercase tracking-wider">
            Contact & Service Juridique BWT
          </h2>
          <p className="text-xs text-slate-400">
            Pour toute demande relative aux droits d&apos;auteur, droit de réponse ou partenariats institutionnels, écrivez à la direction : <a href="mailto:contact@bittonik.com" className="text-emerald-400 hover:underline">contact@bittonik.com</a> ou <a href="mailto:press@bittonik.com" className="text-emerald-400 hover:underline">press@bittonik.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
