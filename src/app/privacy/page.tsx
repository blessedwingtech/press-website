import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export const revalidate = 3600; // Cache d'une heure pour cette page statique

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-blue-400 text-slate-400 transition-colors text-xs font-bold uppercase tracking-wider mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
      </Link>

      <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
          <Shield className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
              Politique de Confidentialité
            </h1>
            <p className="text-xs text-slate-450 mt-1">
              Dernière mise à jour : 21 juillet 2026
            </p>
          </div>
        </div>

        <div className="prose prose-invert prose-blue max-w-none text-slate-300 space-y-6 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-black text-white uppercase tracking-wider border-l-3 border-blue-500 pl-2">
              1. Introduction
            </h2>
            <p>
              Bienvenue sur **PressTonik**, le portail d'information libre en Haïti. Nous accordons une importance capitale à la confidentialité et à la sécurité de vos données personnelles. La présente politique décrit comment nous collectons, utilisons et protégeons vos données lorsque vous visitez notre site internet.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-white uppercase tracking-wider border-l-3 border-blue-500 pl-2">
              2. Données Collectées
            </h2>
            <p>
              Nous collectons des informations de différentes manières afin de vous fournir une expérience optimale et sécurisée :
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Données de navigation et Cookies :</strong> Nous utilisons des cookies techniques et des identifiants de session anonymes pour faire fonctionner des fonctionnalités interactives comme le système de vote (étoiles) et le compteur de vues uniques par article.
              </li>
              <li>
                <strong>Données des comptes membres :</strong> Si vous disposez d'un compte (Journaliste, Administrateur ou Lecteur enregistré), nous stockons votre nom, votre adresse email, votre mot de passe (chiffré de façon sécurisée via bcrypt) et vos rôles système.
              </li>
              <li>
                <strong>Adresse IP :</strong> Pour prévenir les fraudes de vote et de partage d'articles, notre système de sécurité enregistre temporairement votre adresse IP lors de vos évaluations et partages. Ces adresses IP sont uniquement visibles par l'administrateur système dans le journal d'audit de sécurité.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-white uppercase tracking-wider border-l-3 border-blue-500 pl-2">
              3. Utilisation des Données
            </h2>
            <p>
              Les données collectées sont utilisées pour :
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Assurer l'affichage et le bon tri des flux éditoriaux à la une.</li>
              <li>Limiter chaque session à un seul vote par publication pour garantir l'intégrité et la sincérité du score de popularité des journalistes.</li>
              <li>Consigner les modifications système dans le journal d'audit réservé aux administrateurs de PressTonik afin de suivre et de bloquer les activités malveillantes ou frauduleuses.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-white uppercase tracking-wider border-l-3 border-blue-500 pl-2">
              4. Partage et Stockage des Données
            </h2>
            <p>
              PressTonik ne vend, n'échange et ne transfère aucune donnée personnelle identifiable à des tiers. Toutes les données sont hébergées et stockées de manière confidentielle sur nos serveurs sécurisés.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-white uppercase tracking-wider border-l-3 border-blue-500 pl-2">
              5. Droits des Utilisateurs
            </h2>
            <p>
              Conformément aux réglementations relatives à la protection de la vie privée, vous disposez d'un droit d'accès, de rectification et de suppression des données vous concernant. Pour toute demande d'exercice de vos droits, vous pouvez contacter l'administration de PressTonik.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-white uppercase tracking-wider border-l-3 border-blue-500 pl-2">
              6. Consentement
            </h2>
            <p>
              En utilisant notre site internet, vous consentez à notre politique de confidentialité.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-slate-800/60">
            <p className="text-center text-sm text-slate-400">
              Vous souhaitez rejoindre notre équipe de rédacteurs ou avoir un espace de lecteur privilégié ?
            </p>
            <div className="flex justify-center">
              <Link
                href="/request-account"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md"
              >
                Demander un compte PressTonik
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
