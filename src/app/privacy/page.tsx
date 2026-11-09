import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, Bell, Database } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Politique de Confidentialité & Protection des Données | PressTonik",
  description:
    "Transparence sur le traitement de vos données personnelles, authentification Google, cookies AdSense, notifications Web Push et sécurité sur PressTonik.",
};

export const revalidate = 3600; // Cache d'une heure

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-emerald-400 text-slate-400 transition-colors text-xs font-bold uppercase tracking-wider mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Retour à l&apos;accueil
      </Link>

      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8 text-slate-300">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
          <Shield className="w-8 h-8 text-emerald-400" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
              Politique de Confidentialité
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} • Conforme aux standards internationaux de protection de la vie privée.
            </p>
          </div>
        </div>

        <div className="space-y-6 text-sm leading-relaxed">
          {/* 1. Introduction */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider border-l-2 border-emerald-500 pl-3">
              1. Engagement de Confidentialité
            </h2>
            <p>
              Propulsée par <strong>Blessed Wing Technology (BWT)</strong>, la plateforme <strong>PressTonik</strong> accorde la plus haute priorité à la protection de la vie privée de ses lecteurs, journalistes et abonnés. Cette charte détaille en toute transparence la collecte, l&apos;usage et la protection de vos informations personnelles.
            </p>
          </section>

          {/* 2. Données Collectées */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider border-l-2 border-emerald-500 pl-3">
              2. Nature des Données Collectées
            </h2>
            <p>
              Nous limitons rigoureusement la collecte aux seules données strictement nécessaires au bon fonctionnement de nos services :
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <strong>Authentification Google & Comptes :</strong> Lorsque vous vous inscrivez via Google ou par formulaire, nous collectons votre nom, votre adresse email certifiée et votre photo de profil. Les mots de passe sont hachés de manière irréversible via l&apos;algorithme <code>bcrypt</code>.
              </li>
              <li>
                <strong>Cookies Techniques & Session :</strong> Utilisés pour mémoriser votre connexion, vos préférences de lecture en Mode Zen, et pour empêcher les votes multiples sur les articles.
              </li>
              <li>
                <strong>Cookies Publicitaires (Google AdSense) :</strong> Des régies partenaires tierces, dont Google AdSense, peuvent déposer des cookies pour diffuser des annonces pertinentes et mesurer leur performance. Les abonnés VIP bénéficient d&apos;une désactivation totale de toute publicité.
              </li>
              <li>
                <strong>Notifications Web Push (VAPID) :</strong> Si vous activez les alertes d&apos;actualité, un jeton cryptographique anonyme est conservé pour vous envoyer les dépêches urgentes. Vous pouvez vous désabonner à tout instant dans les paramètres de votre navigateur.
              </li>
              <li>
                <strong>Adresses IP & Sécurité Anti-fraude :</strong> Une empreinte technique chiffrée de votre adresse IP est temporairement enregistrée lors des votes ou dons pour prévenir les manipulations et attaques malveillantes.
              </li>
            </ul>
          </section>

          {/* 3. Hébergement Sécurisé Cloud & Médias */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider border-l-2 border-emerald-500 pl-3">
              3. Hébergement & Sécurité des Données
            </h2>
            <p>
              Les ressources multimédias et images d&apos;articles sont stockées sur l&apos;infrastructure sécurisée <strong>Cloudflare R2</strong>, garantissant un chiffrement au repos et en transit. Toutes les communications sur PressTonik sont protégées par le protocole HTTPS/TLS 1.3 de pointe.
            </p>
          </section>

          {/* 4. Non-commercialisation des données */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider border-l-2 border-emerald-500 pl-3">
              4. Zéro Revente de Données
            </h2>
            <p>
              PressTonik ne vend, ne loue, ni ne transfère aucune donnée personnelle identifiable à des courtiers en données ou des tiers à des fins de prospection commerciale non consentie.
            </p>
          </section>

          {/* 5. Vos Droits */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider border-l-2 border-emerald-500 pl-3">
              5. Exercice de vos Droits (Accès & Suppression)
            </h2>
            <p>
              Vous disposez à tout moment d&apos;un droit d&apos;accès, de rectification et de suppression définitive de votre compte et des données associées. Pour exercer ce droit, adressez un message à <a href="mailto:contact@bittonik.com" className="text-emerald-400 hover:underline">contact@bittonik.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
