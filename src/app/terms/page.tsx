import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Conditions d\'utilisation | PressTonik',
  description: 'Conditions générales d\'utilisation de la plateforme PressTonik.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour à l'accueil
        </Link>
      </div>
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl prose prose-invert prose-emerald max-w-none">
        <h1 className="text-3xl font-black text-white mb-8">Conditions Générales d'Utilisation (CGU)</h1>
        
        <p className="text-sm text-slate-400 mb-8">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-200">1. Présentation de la plateforme</h2>
          <p>
            PressTonik est une plateforme de presse rédactionnelle indépendante permettant à des journalistes et rédacteurs de publier des articles d'information générale, sportive et culturelle. La plateforme est éditée par Blessed Wing Technology.
          </p>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-bold text-slate-200">2. Accès aux services</h2>
          <p>
            L'accès aux articles publics est libre et gratuit. La création d'un compte (Journaliste, Lecteur Privilégié ou Annonceur) est soumise à validation par notre équipe d'administration. PressTonik se réserve le droit de refuser toute demande de création de compte sans justification.
          </p>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-bold text-slate-200">3. Responsabilité des Rédacteurs</h2>
          <p>
            Les journalistes et contributeurs sont seuls responsables du contenu qu'ils publient. Ils s'engagent à respecter les lois en vigueur, notamment en matière de droits d'auteur, de diffamation, et de respect de la vie privée. PressTonik se réserve le droit de supprimer tout article enfreignant ces règles ou étant signalé comme inapproprié.
          </p>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-bold text-slate-200">4. Propriété Intellectuelle</h2>
          <p>
            L'ensemble des éléments constituant la plateforme (design, code source, logos) appartient à Blessed Wing Technology. Les articles publiés demeurent la propriété intellectuelle de leurs auteurs respectifs, qui accordent à PressTonik une licence non exclusive de diffusion sur la plateforme.
          </p>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-bold text-slate-200">5. Modération et Sanctions</h2>
          <p>
            Les administrateurs se réservent le droit de suspendre ou bannir définitivement tout compte utilisateur (lecteur ou rédacteur) dont le comportement nuirait à la plateforme ou à sa communauté (spam, discours haineux, fausses informations).
          </p>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-bold text-slate-200">6. Modifications des CGU</h2>
          <p>
            PressTonik se réserve le droit de modifier les présentes conditions d'utilisation à tout moment. Les utilisateurs seront informés des modifications majeures. L'utilisation continue de la plateforme après modification vaut acceptation des nouvelles CGU.
          </p>
        </section>
      </div>
    </div>
  );
}
