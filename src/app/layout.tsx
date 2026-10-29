import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import NavbarWrapper from "@/components/NavbarWrapper";
import ReviewToast from "@/components/ReviewToast";
import ReviewCTA from "@/components/ReviewCTA";
import NavigationProgressBar from "@/components/NavigationProgressBar";
import { Suspense } from "react";
import Link from "next/link";
import { WebsiteAndOrgJsonLd } from "@/components/JsonLd";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = process.env.NEXTAUTH_URL || 'https://press.bittonik.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PressTonik | Actualités, Enquêtes & Presse Rédactionnelle en Continu",
    template: "%s | PressTonik",
  },
  description: "Plateforme indépendante de journalisme et de rédaction en temps réel. Enquêtes exclusives, actualités politiques, économiques, technologiques et sportives.",
  keywords: [
    "actualités",
    "presse en ligne",
    "journalisme indépendant",
    "enquêtes exclusives",
    "politique",
    "économie",
    "technologie",
    "sports",
    "PressTonik",
    "Haïti actualités",
    "international",
  ],
  authors: [{ name: "La Rédaction PressTonik", url: siteUrl }],
  creator: "Blessed Wing Technology & PressTonik",
  publisher: "PressTonik",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32', type: 'image/x-icon' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/icon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteUrl,
    siteName: 'PressTonik',
    title: 'PressTonik | Actualités, Enquêtes & Presse Rédactionnelle en Continu',
    description: 'Plateforme indépendante de journalisme et de rédaction en temps réel. Enquêtes exclusives, actualités politiques, économiques, technologiques et sportives.',
    images: [
      {
        url: '/icon.svg',
        width: 1200,
        height: 630,
        alt: 'PressTonik Presse Rédactionnelle',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PressTonik | Actualités, Enquêtes & Presse Rédactionnelle en Continu',
    description: 'Plateforme indépendante de journalisme et de rédaction en temps réel.',
    images: ['/icon.svg'],
  },
  alternates: {
    canonical: siteUrl,
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark scroll-smooth">
      <body
        className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased overflow-x-hidden`}
      >
        <WebsiteAndOrgJsonLd baseUrl={siteUrl} />
        <Suspense fallback={null}>
          <NavigationProgressBar />
        </Suspense>
        <SessionProvider>
          <NavbarWrapper />
          <main className="flex-grow flex flex-col min-w-0">
            {children}
          </main>
          <footer className="bg-slate-900 border-t border-slate-800 py-8 text-center text-xs text-slate-500 w-full">
            <div className="max-w-7xl mx-auto px-4 space-y-3">
              <p className="font-semibold text-slate-400"><strong>PressTonik</strong> Presse Rédactionnelle © {new Date().getFullYear()}</p>
              <p>Powered by <a href="https://bwt.bittonik.com" className="hover:text-blue-400">Blessed Wing Technology</a></p>
              <div className="pt-1 flex flex-wrap justify-center items-center gap-x-3 gap-y-2 text-[10px] uppercase font-bold tracking-wider">
                <Link href="/request-account" className="hover:text-emerald-400 transition-colors whitespace-nowrap">Demander un compte</Link>
                <span className="text-slate-700 hidden sm:inline">•</span>
                <Link href="/terms" className="hover:text-emerald-400 transition-colors whitespace-nowrap">Conditions d'utilisation</Link>
                <span className="text-slate-700 hidden sm:inline">•</span>
                <Link href="/privacy" className="hover:text-emerald-400 transition-colors whitespace-nowrap">Politique de confidentialité</Link>
                <span className="text-slate-700 hidden sm:inline">•</span>
                <Link href="/avis" className="hover:text-emerald-400 transition-colors whitespace-nowrap">Avis des lecteurs</Link>
                <span className="text-slate-700 hidden sm:inline">•</span>
                <Link href="/feed.xml" target="_blank" className="hover:text-emerald-400 transition-colors whitespace-nowrap">Flux RSS</Link>
                <span className="text-slate-700 hidden sm:inline">•</span>
                <ReviewCTA />
              </div>
            </div>
          </footer>
          <ReviewToast currentSite="PRESSTONIK" hubUrl={process.env.NEXT_PUBLIC_AVIS_HUB_URL || 'https://avis.bittonik.com'} intervalMinutes={3} />
        </SessionProvider>
      </body>
    </html>
  );
}
