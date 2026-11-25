import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PenTool, ListFilter, FilePlus, Home, Award } from 'lucide-react';
import { canAccessAiAssistant } from '@/lib/ai-access';

export default async function JournalistLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  if (!session || ((session.user as any).role !== 'journalist' && (session.user as any).role !== 'admin')) {
    redirect('/');
  }

  return (
    <div className="flex-grow flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      {/* Barre latérale */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div>
            <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Console Rédaction
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 truncate">
              Auteur : <span className="text-emerald-600 dark:text-emerald-400 font-bold">{session.user?.name}</span>
            </p>
          </div>

          <nav className="space-y-1.5">
            <Link
              href="/journalist"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              <ListFilter className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
              Mes articles
            </Link>
            <Link
              href="/journalist/articles/new"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              <FilePlus className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              Écrire un article
            </Link>
            {canAccessAiAssistant(session.user as any) && (
              <Link
                href="/journalist/ai-assistant"
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-800 dark:hover:text-amber-200 transition-all border border-amber-300 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20"
              >
                <PenTool className="w-4 h-4 text-amber-500" />
                Carnet de Recherche IA
              </Link>
            )}
            <Link
              href="/journalist/verification"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              <Award className="w-4 h-4 text-amber-500" />
              Certification & Crédibilité
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all border-t border-slate-200 dark:border-slate-800/80 mt-4 pt-4"
            >
              <Home className="w-4 h-4 text-slate-400" />
              Retour au site
            </Link>
          </nav>
        </div>

        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-600 border-t border-slate-200 dark:border-slate-800/50 pt-4 mt-6 hidden md:block">
          PressTonik Presse v1.0
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-grow bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full text-slate-900 dark:text-slate-100">
        {children}
      </main>
    </div>
  );
}
