import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Scale, CheckCircle2, ShieldAlert, FileText, Sparkles, BookOpen, RefreshCw } from 'lucide-react';

export const metadata: Metadata = {
  title: "Charte Éditoriale & Déontologique | PressTonik",
  description:
    "Règles déontologiques, principes d'exactitude des faits, séparation des genres, anti-plagiat et transparence applicables à tous les rédacteurs de PressTonik.",
};

export default function ChartePage() {
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
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* En-tête */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest">
            <Scale className="w-3.5 h-3.5" /> Déontologie &amp; Éthique de l&apos;Information
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Charte d&apos;Indépendance et de Déontologie
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Les règles d&apos;or acceptées par chaque journaliste et auteur publiant sur la plateforme PressTonik.
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-slate-50 dark:bg-slate-950/50 p-5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-350 relative z-10">
          PressTonik accorde une totale liberté éditoriale à ses plumes. En contrepartie de cette liberté d&apos;expression sans comité de censure central, chaque auteur s&apos;engage solennellement à respecter les standards déontologiques fondamentaux ci-dessous.
        </div>

        {/* Les 6 Règles Déontologiques */}
        <div className="space-y-6 relative z-10">
          {/* Règle 1 */}
          <div className="space-y-2">
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Article 1. Rigueur factuelle et recoupement des sources
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-6 leading-relaxed">
              Toute allégation portant sur des faits réels doit faire l&apos;objet d&apos;une vérification sérieuse auprès d&apos;au moins deux sources concordantes ou de documents authentifiés. Les rumeurs de réseaux sociaux ne peuvent en aucun cas être publiées comme des faits établis.
            </p>
          </div>

          {/* Règle 2 */}
          <div className="space-y-2">
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-500 shrink-0" /> Article 2. Séparation stricte des faits et des opinions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-6 leading-relaxed">
              Le lecteur a le droit inaliénable de savoir ce qu&apos;il lit. Chaque article doit être étiqueté selon son genre réel (Actualité, Enquête, Reportage, Analyse, Opinion ou Communiqué). Les prises de position personnelles ou polémiques doivent être impérativement publiées sous le genre <strong>« Opinion / Tribune »</strong>.
            </p>
          </div>

          {/* Règle 3 */}
          <div className="space-y-2">
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-500 shrink-0" /> Article 3. Tolérance zéro contre le plagiat
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-6 leading-relaxed">
              Le copié-collé sans attribution de confrères journalistes ou de médias tiers est strictement prohibé. Toute citation ou reprise d&apos;information doit obligatoirement créditer le média ou l&apos;auteur d&apos;origine en insérant un hyperlien direct ou une mention explicite.
            </p>
          </div>

          {/* Règle 4 */}
          <div className="space-y-2">
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500 shrink-0" /> Article 4. Usage transparent de l&apos;Intelligence Artificielle
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-6 leading-relaxed">
              Les outils d&apos;assistance IA (synthèse, correction, veille documentaire) ne sont que des aides techniques. L&apos;auteur humain demeure juridiquement et moralement responsable de chaque mot publié. Il est formellement interdit de publier des textes entièrement générés par IA sans vérification minutieuse des affirmations.
            </p>
          </div>

          {/* Règle 5 */}
          <div className="space-y-2">
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" /> Article 5. Déclaration de liens d&apos;intérêts et de sponsors
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-6 leading-relaxed">
              Lorsqu&apos;un auteur écrit sur une entreprise, une organisation politique ou un projet dans lequel il possède un intérêt personnel, familial ou financier direct, il doit impérativement l&apos;indiquer en préambule. Tout contenu rémunéré doit porter l&apos;étiquette <strong>« Contenu partenaire / Sponsorisé »</strong>.
            </p>
          </div>

          {/* Règle 6 */}
          <div className="space-y-2">
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-500 shrink-0" /> Article 6. Droit de réponse et rectifications loyales
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-6 leading-relaxed">
              Si une inexactitude factuelle est démontrée, l&apos;auteur s&apos;engage à apporter la correction rapidement et à en mentionner la teneur avec transparence. Toute personne physique ou morale mise en cause dispose d&apos;un droit de réponse loyal conformément aux usages de la presse.
            </p>
          </div>
        </div>

        {/* Sanctions & Révocation */}
        <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-xl text-xs sm:text-sm text-rose-600 dark:text-rose-400 space-y-1.5 relative z-10">
          <strong className="block font-black uppercase tracking-wider">Conséquences en cas de violation grave</strong>
          <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
            Le non-respect délibéré de cette charte (notamment le plagiat caractérisé, la diffusion sciemment mensongère ou la diffamation sans preuves) entraîne la suspension immédiate du badge vérifié et, en cas de récidive, la révocation des droits de publication sur la plateforme.
          </p>
        </div>

        {/* Footer link */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs font-bold relative z-10">
          <Link
            href="/a-propos"
            className="text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            &larr; À propos de PressTonik
          </Link>
          <Link
            href="/"
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline"
          >
            Retour au site &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
