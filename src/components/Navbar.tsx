'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Menu as MenuIcon, X, ChevronDown, User, Shield, PenTool, LogOut, LogIn } from 'lucide-react';

interface SubMenuData {
  id: string;
  nom: string;
  slug: string;
}

interface MenuData {
  id: string;
  nom: string;
  slug: string;
  submenus: SubMenuData[];
}

interface NavbarProps {
  menus: MenuData[];
}

export default function Navbar({ menus }: NavbarProps) {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const toggleDropdown = (menuId: string) => {
    if (activeDropdown === menuId) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(menuId);
    }
  };

  const userRole = (session?.user as any)?.role;

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                CHRONOS
              </span>
              <span className="text-xs uppercase bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-slate-300 font-semibold tracking-widest hidden sm:inline-block">
                Presse
              </span>
            </Link>
          </div>

          {/* Desktop Nav Menus */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-850 hover:text-emerald-400 transition-colors"
            >
              Accueil
            </Link>
            
            {menus.map((menu) => (
              <div key={menu.id} className="relative group">
                {menu.submenus.length > 0 ? (
                  <button
                    onClick={() => toggleDropdown(menu.id)}
                    className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-850 hover:text-emerald-400 transition-colors focus:outline-none"
                  >
                    {menu.nom}
                    <ChevronDown className="w-4 h-4 opacity-70 group-hover:rotate-180 transition-transform duration-200" />
                  </button>
                ) : (
                  <Link
                    href={`/category/${menu.slug}`}
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-850 hover:text-emerald-400 transition-colors"
                  >
                    {menu.nom}
                  </Link>
                )}

                {/* Submenus Dropdown */}
                {menu.submenus.length > 0 && (
                  <div className="absolute left-0 mt-1 w-48 rounded-md shadow-xl bg-slate-800 border border-slate-700 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <Link
                        href={`/category/${menu.slug}`}
                        className="block px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 hover:text-emerald-400 transition-colors"
                      >
                        Tout voir
                      </Link>
                      {menu.submenus.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/category/${menu.slug}/${sub.slug}`}
                          className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-emerald-400 transition-colors"
                        >
                          {sub.nom}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* User Profile / Dashboard links */}
          <div className="hidden md:flex items-center space-x-3">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-slate-800/50 hover:bg-slate-800 border border-slate-700 transition"
                >
                  <User className="w-4 h-4 text-emerald-400" />
                  <span className="truncate max-w-[120px]">{session.user?.name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-xl bg-slate-800 border border-slate-700 ring-1 ring-black ring-opacity-5 z-50">
                    <div className="px-4 py-2.5 border-b border-slate-700">
                      <p className="text-xs text-slate-400">Connecté en tant que</p>
                      <p className="text-sm font-medium text-white truncate">{session.user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {userRole}
                      </span>
                    </div>
                    <div className="py-1">
                      {userRole === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-rose-400" />
                          Espace Admin
                        </Link>
                      )}
                      {(userRole === 'journalist' || userRole === 'admin') && (
                        <Link
                          href="/journalist"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
                        >
                          <PenTool className="w-4 h-4 text-cyan-400" />
                          Espace Rédacteur
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          signOut({ callbackUrl: '/' });
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:bg-slate-700/50 hover:text-rose-350 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Connexion
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-855 hover:text-emerald-400 transition-colors"
            >
              Accueil
            </Link>

            {menus.map((menu) => (
              <div key={menu.id} className="space-y-1">
                {menu.submenus.length > 0 ? (
                  <>
                    <button
                      onClick={() => toggleDropdown(menu.id)}
                      className="w-full text-left flex justify-between items-center px-3 py-2 rounded-md text-base font-medium hover:bg-slate-855 hover:text-emerald-400"
                    >
                      {menu.nom}
                      <ChevronDown
                        className={`w-4 h-4 transform transition-transform duration-200 ${
                          activeDropdown === menu.id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {activeDropdown === menu.id && (
                      <div className="pl-4 space-y-1 bg-slate-950/40 rounded-md py-1">
                        <Link
                          href={`/category/${menu.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-1.5 rounded-md text-sm text-slate-400 hover:text-emerald-400"
                        >
                          Tout voir
                        </Link>
                        {menu.submenus.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/category/${menu.slug}/${sub.slug}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-1.5 rounded-md text-sm text-slate-400 hover:text-emerald-400"
                          >
                            {sub.nom}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={`/category/${menu.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-855 hover:text-emerald-400"
                  >
                    {menu.nom}
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 pb-3 border-t border-slate-800 px-4">
            {session ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 font-bold border border-slate-700">
                    {session.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-base font-medium text-white">{session.user?.name}</div>
                    <div className="text-sm font-medium text-slate-400">{session.user?.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  {userRole === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800"
                    >
                      Espace Admin
                    </Link>
                  )}
                  {(userRole === 'journalist' || userRole === 'admin') && (
                    <Link
                      href="/journalist"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-slate-200 hover:bg-slate-800"
                    >
                      Espace Rédacteur
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-rose-400 hover:bg-slate-850"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md text-base font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition"
              >
                <LogIn className="w-5 h-5" />
                Connexion
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
