import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import NavbarWrapper from "@/components/NavbarWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PressTonik | Actualités & Presse Rédactionnelle",
  description: "Plateforme indépendante de journalisme et de rédaction sportive et généraliste en temps réel.",
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
            <div className="max-w-7xl mx-auto px-4">
              <p className="font-semibold text-slate-400 mb-2"><strong>PressTonik</strong> Presse Rédactionnelle © {new Date().getFullYear()}</p>
              <p>Powered by <a href="https://bwt.bittonik.com" >Blessed Wing Technology</a> </p>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
