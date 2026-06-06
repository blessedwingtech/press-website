import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Shield, Home, Menu as MenuIcon, Landmark, Users, LayoutDashboard } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="flex-grow flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      {/* Barre latérale Admin */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div>
            <h2 className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-rose-500" />
              Administration
            </h2>
            <p className="text-xs text-slate-400 mt-1 truncate">
              Admin : <span className="text-rose-455 font-bold">{session.user?.name}</span>
            </p>
          </div>

          <nav className="space-y-1.5">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-350 hover:bg-slate-800 hover:text-white transition-all"
            >
              <LayoutDashboard className="w-4 h-4 text-rose-400" />
              Vue d'ensemble
            </Link>
            <Link
              href="/admin/menus"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-350 hover:bg-slate-800 hover:text-white transition-all"
            >
              <MenuIcon className="w-4 h-4 text-emerald-400" />
              Menus &amp; Rubriques
            </Link>
            <Link
              href="/admin/ads"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-350 hover:bg-slate-800 hover:text-white transition-all"
            >
              <Landmark className="w-4 h-4 text-amber-400" />
              Publicités
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-350 hover:bg-slate-800 hover:text-white transition-all"
            >
              <Users className="w-4 h-4 text-cyan-400" />
              Utilisateurs
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-350 hover:bg-slate-850 hover:text-white transition-all border-t border-slate-800/80 mt-4 pt-4"
            >
              <Home className="w-4 h-4 text-slate-500" />
              Retour au site
            </Link>
          </nav>
        </div>

        <div className="text-[10px] font-bold text-slate-550 border-t border-slate-800/50 pt-4 mt-6 hidden md:block">
          PressTonik Admin v1.0
        </div>
      </aside>

      {/* Zone de contenu de travail */}
      <main className="flex-grow bg-slate-950 p-6 sm:p-8 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}
