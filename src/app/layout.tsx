import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import NavbarWrapper from "@/components/NavbarWrapper";
import ReviewToast from "@/components/ReviewToast";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PressTonik | Actualités & Presse Rédactionnelle",
  description: "Plateforme indépendante de journalisme et de rédaction sportive et généraliste en temps réel.",
  icons: {
    icon: '/icon.svg',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark scroll-smooth">
      <body
        className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased`}
      >
        <SessionProvider>
          <NavbarWrapper />
          <main className="flex-grow flex flex-col">
            {children}
          </main>
          <footer className="bg-slate-900 border-t border-slate-800 py-8 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 space-y-2">
              <p className="font-semibold text-slate-400"><strong>PressTonik</strong> Presse Rédactionnelle © {new Date().getFullYear()}</p>
              <p>Powered by <a href="https://bwt.bittonik.com" className="hover:text-blue-400">Blessed Wing Technology</a></p>
              <div className="pt-2 flex justify-center gap-4 text-[10px] uppercase font-bold tracking-wider">
                <Link href="/request-account" className="hover:text-emerald-400 transition-colors">Demander un compte</Link>
                <span className="text-slate-700">•</span>
                <Link href="/terms" className="hover:text-emerald-400 transition-colors">Conditions d'utilisation</Link>
                <span className="text-slate-700">•</span>
                <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Politique de confidentialité</Link>
                <span className="text-slate-700">•</span>
                <Link href="/avis" className="hover:text-emerald-400 transition-colors">Avis des lecteurs</Link>
                <span className="text-slate-700">•</span>
                <a href={`${process.env.NEXT_PUBLIC_AVIS_HUB_URL || 'https://avis.bittonik.com'}?source=PRESSTONIK`} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 font-extrabold transition-colors">Donner votre avis</a>
              </div>
            </div>
          </footer>
          <ReviewToast currentSite="PRESSTONIK" hubUrl={process.env.NEXT_PUBLIC_AVIS_HUB_URL || 'https://avis.bittonik.com'} intervalMinutes={3} />
        </SessionProvider>
      </body>
    </html>
  );
}
