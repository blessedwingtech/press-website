import ReviewWidget from '@/components/ReviewWidget';
import { MessageSquare } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Avis des Lecteurs | PressTonik',
  description: 'Découvrez ce que nos lecteurs pensent de la plateforme d\'actualités PressTonik.',
};

export default function AvisPage() {
  const hubUrl = process.env.NEXT_PUBLIC_AVIS_HUB_URL || 'https://avis.bittonik.com';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center justify-center gap-3">
          <MessageSquare className="w-8 h-8 text-emerald-500" />
          Avis <span className="text-emerald-500">PressTonik</span>
        </h1>
        <p className="mt-3 text-slate-400 text-lg font-medium max-w-xl mx-auto">
          Découvrez les retours de notre communauté de lecteurs ou partagez votre propre expérience avec notre plateforme d'actualités.
        </p>
      </div>

      <ReviewWidget currentSite="PRESSTONIK" hubUrl={hubUrl} />
    </div>
  );
}
