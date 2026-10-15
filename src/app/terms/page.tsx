import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, CreditCard, Award, Lock, Scale } from 'lucide-react';

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation & Charte Financière | PressTonik",
  description:
    "Conditions générales d'utilisation, charte des abonnements VIP, modèle de rémunération des journalistes (85/15) et modalités de reversement de la plateforme PressTonik.",
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
            <Scale className="w-3.5 h-3.5" /> Cadre Légal & Déontologique
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white">
            Conditions Générales d&apos;Utilisation & Charte Financière
          </h1>
          <p className="text-xs text-slate-400">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} • Applicable à l&apos;ensemble des lecteurs, abonnés et journalistes indépendants.
          </p>
        </div>

        {/* 1. Présentation */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
            1. Présentation & Statut de la Plateforme
          </h2>
          <p className="text-xs sm:text-sm text-slate-350 leading-relaxed">
            <strong>PressTonik</strong> est une plateforme technologique et éditoriale d&apos;information indépendante propulsée par <strong>Blessed Wing Technology</strong>. PressTonik fonctionne selon un modèle décentralisé : elle héberge et diffuse les travaux de journalistes, correspondants et analystes indépendants accrédités, tout en leur offrant des outils de diffusion, de monétisation et d&apos;analyse.
          </p>
        </section>

        {/* 2. Statut et Responsabilité des Journalistes */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
            2. Statut des Journalistes & Responsabilité Éditoriale
          </h2>
          <p className="text-xs sm:text-sm text-slate-350 leading-relaxed">
            Les journalistes et rédacteurs inscrits sur PressTonik agissent en qualité d&apos;<strong>auteurs et créateurs indépendants</strong>. Il n&apos;existe aucun lien de subordination salariale entre PressTonik et les journalistes indépendants. Chaque auteur conserve l&apos;entière responsabilité civile et pénale de ses écrits, enquêtes et propos diffusés.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-400">
            <li>Les journalistes s&apos;engagent à vérifier rigoureusement leurs faits et à citer leurs sources vérifiées.</li>
            <li>Tout propos diffamatoire, injurieux, portant atteinte à la sûreté ou incitant à la violence est strictement prohibé.</li>
            <li>PressTonik se réserve le droit de dépublier un article sans préavis en cas de signalement légitime ou de violation de la charte.</li>
          </ul>
        </section>

        {/* 3. Abonnements VIP & Paywall */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2 text-amber-400">
            <Lock className="w-4 h-4 text-amber-400" /> 3. Abonnements PressTonik VIP & Accès Exclusifs
          </h2>
          <p className="text-xs sm:text-sm text-slate-350 leading-relaxed">
            PressTonik propose une formule d&apos;adhésion payante <strong>PressTonik VIP / PRO</strong> (4.99 $ USD / mois ou 39.99 $ USD / an, ou équivalent en Gourdes Haïtiennes HTG via MonCash). Cet abonnement confère à l&apos;utilisateur :
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-400">
            <li>Une expérience de navigation intégrale <strong>sans aucune bannière publicitaire</strong>.</li>
            <li>L&apos;accès illimité aux <strong>dossiers d&apos;investigation exclusifs</strong> protégés par paywall.</li>
            <li>Un badge officiel VIP sur son profil et ses avis.</li>
            <li>L&apos;accès aux alertes d&apos;information prioritaires.</li>
          </ul>
          <p className="text-xs text-slate-400 mt-2">
            <strong>Résiliation :</strong> L&apos;abonné peut suspendre ou annuler son abonnement à tout moment sans frais ni pénalité depuis son espace profil ou via la passerelle Pay-Hub.
          </p>
        </section>

        {/* 4. Dons, Pourboires et Partage des Revenus 85% / 15% */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2 text-emerald-400">
            <Award className="w-4 h-4 text-emerald-400" /> 4. Pourboires & Rémunération des Journalistes (85% / 15%)
          </h2>
          <p className="text-xs sm:text-sm text-slate-350 leading-relaxed">
            Afin de financer un journalisme d&apos;investigation de qualité en Haïti et dans la Caraïbe, les lecteurs ont la possibilité de verser des pourboires et dons directs au journaliste auteur d&apos;un reportage via notre passerelle financière <strong>BitTonik Pay-Hub</strong>.
          </p>
          <div className="bg-slate-950/80 border border-emerald-500/30 p-4 rounded-xl text-xs space-y-2">
            <p className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Répartition contractuelle des fonds collectés :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Part Journaliste Auteur</span>
                <span className="text-2xl font-black text-emerald-400">85 %</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Reversé directement sur le solde disponible de l&apos;auteur.</p>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Frais Plateforme & Passerelle</span>
                <span className="text-2xl font-black text-slate-350">15 %</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Couvre les frais bancaires/télécoms, l&apos;infrastructure serveur et la sécurité.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Modalités de Retrait (Payouts Journalistes) */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-teal-400" /> 5. Modalités de Retrait des Fonds (Payouts)
          </h2>
          <p className="text-xs sm:text-sm text-slate-350 leading-relaxed">
            Les journalistes disposant d&apos;un solde positif peuvent solliciter un reversement (Payout) à tout moment depuis leur tableau de bord. PressTonik et BitTonik Pay-Hub mettent à disposition plusieurs canaux fluides et adaptés :
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-400">
            <li><strong>MonCash (Digicel Haïti - HTG) :</strong> Virement instantané vers le portefeuille mobile du journaliste.</li>
            <li><strong>PayPal (USD) :</strong> Virement électronique vers le compte PayPal vérifié de l&apos;auteur (idéal pour la diaspora et les correspondants internationaux).</li>
            <li><strong>Carte Bancaire / Débit (Stripe Payout) :</strong> Reversement direct vers la carte bancaire ou compte associé.</li>
            <li><strong>Virement Bancaire (SPIH / Wire) :</strong> Transfert vers les banques commerciales haïtiennes (Sogebank, Unibank, BUH, etc.) ou internationales.</li>
          </ul>
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong>Délais de traitement :</strong> Les demandes sont auditées et exécutées dans un délai de 24 à 48 heures ouvrées après vérification de conformité contre la fraude et le blanchiment d&apos;argent.
          </p>
        </section>

        {/* 6. Canaux WhatsApp & Communautés Personnelles */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
            6. Canaux WhatsApp & Réseaux Tiers des Journalistes
          </h2>
          <p className="text-xs sm:text-sm text-slate-350 leading-relaxed">
            PressTonik autorise ses journalistes à promouvoir leur propre canal ou groupe de discussion WhatsApp / Telegram sur leurs articles et leur fiche auteur. Ces canaux externes sont gérés sous la seule responsabilité du journaliste. PressTonik décline toute responsabilité quant aux échanges privés ou transactions non supervisées survenant en dehors de la plateforme officielle.
          </p>
        </section>

        {/* 7. Protection des Données & Paiements Sécurisés */}
        <section className="space-y-3">
          <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
            7. Sécurité des Transactions Financières
          </h2>
          <p className="text-xs sm:text-sm text-slate-350 leading-relaxed">
            Toutes les transactions financières (abonnements, pourboires, reversements) sont opérées par <strong>BitTonik Pay-Hub</strong> avec un chiffrement SSL/TLS de niveau bancaire et des signatures cryptographiques HMAC-SHA256. PressTonik ne stocke aucun numéro complet de carte bancaire, ni code PIN MonCash sur ses serveurs.
          </p>
        </section>

        {/* 8. Contact & Litiges */}
        <section className="space-y-3 border-t border-slate-800 pt-6">
          <h2 className="text-sm font-bold text-slate-350 uppercase tracking-wider">
            Contact & Service Juridique
          </h2>
          <p className="text-xs text-slate-400">
            Pour toute réclamation éditoriale, demande de droit de réponse ou question financière relative aux retraits, contactez la direction par email à <a href="mailto:contact@bittonik.com" className="text-emerald-400 hover:underline">contact@bittonik.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
