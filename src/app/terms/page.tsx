import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: "Conditions d'utilisation | PressTonik",
  description: "Conditions générales d'utilisation de la plateforme PressTonik.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour à l&apos;accueil
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl prose prose-invert prose-emerald max-w-none">
        <h1 className="text-3xl font-black text-white mb-8">
          Conditions Générales d&apos;Utilisation (CGU)
        </h1>

        <p className="text-sm text-slate-400 mb-8">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-200">1. Présentation de la plateforme</h2>
          <p>
            PressTonik est une plateforme de presse rédactionnelle indépendante permettant à des journalistes et rédacteurs de publier des articles d&apos;information générale, sportive, technologique et culturelle. La plateforme est éditée et propulsée par Blessed Wing Technology.
          </p>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-bold text-slate-200">2. Accès aux services et comptes</h2>
          <p>
            L&apos;accès à la consultation des articles publics est libre et gratuit. La création d&apos;un compte professionnel (Journaliste, Rédacteur, Annonceur) est soumise à validation préalable par notre équipe d&apos;administration. PressTonik se réserve le droit d&apos;approuver, restreindre ou révoquer les accès à sa discrétion afin de préserver l&apos;intégrité éditoriale du média.
          </p>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-bold text-slate-200">3. Responsabilité éditoriale & Déontologie</h2>
          <p>
            Les journalistes et contributeurs sont pleinement responsables des publications émises sous leur nom ou signature. Ils s&apos;engagent à respecter les règles fondamentales de déontologie journalistique, notamment en matière de vérification des faits, de citation des sources d&apos;origine, de respect de la vie privée et de conformité aux lois régissant le droit d&apos;auteur et la diffamation.
          </p>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-bold text-slate-200">4. Utilisation des Outils d&apos;Assistance IA</h2>
          <p>
            PressTonik met à la disposition de sa rédaction des outils avancés d&apos;assistance à la recherche et à la rédaction par Intelligence Artificielle. L&apos;utilisation de ces outils est régie par les principes suivants :
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li>
              <strong>Supervision humaine obligatoire :</strong> Tout contenu assisté par IA doit être obligatoirement relu, recoupé et validé par un journaliste accrédité avant sa publication publique.
            </li>
            <li>
              <strong>Attribution et sources :</strong> Les articles issus d&apos;une veille automatisée doivent systématiquement mentionner leurs sources et références tierces vérifiées.
            </li>
            <li>
              <strong>Protection contre la désinformation :</strong> L&apos;usage d&apos;outils automatisés pour diffuser sciemment des données erronées ou diffamatoires est formellement interdit et entraîne la révocation immédiate du compte auteur.
            </li>
          </ul>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-bold text-slate-200">5. Système d&apos;Avis et Interactions Lecteurs</h2>
          <p>
            Les lecteurs et utilisateurs peuvent noter les articles ou laisser des retours d&apos;expérience via notre module intégré d&apos;avis (Avis Hub). Les commentaires ou évaluations à caractère injurieux, haineux, diffamatoire ou commercial abusif feront l&apos;objet d&apos;une modération et suppression sans préavis.
          </p>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-bold text-slate-200">6. Propriété Intellectuelle</h2>
          <p>
            L&apos;infrastructure, l&apos;identité visuelle, les logos et le code source de PressTonik sont la propriété exclusive de Blessed Wing Technology. Les articles publiés demeurent la propriété de leurs auteurs ou ayants droit, qui concèdent à PressTonik une licence de diffusion numérique mondiale, non exclusive et gratuite sur ses supports.
          </p>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-bold text-slate-200">7. Modifications des CGU</h2>
          <p>
            PressTonik se réserve le droit de mettre à jour les présentes conditions à tout moment. La consultation et l&apos;utilisation continue de la plateforme valent acceptation pleine et entière des conditions révisées.
          </p>
        </section>
      </div>
    </div>
  );
}
