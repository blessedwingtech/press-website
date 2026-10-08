import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { canAccessAiAssistant } from '@/lib/ai-access';
import { db } from '@/lib/db';
import AiAssistantClient from './AiAssistantClient';

export default async function AiAssistantPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !canAccessAiAssistant(session.user?.email)) {
    redirect('/journalist'); // Rediriger si accès non autorisé
  }

  // Récupérer les menus pour que l'IA sache dans quelle catégorie classer l'article
  const menus = await db.menu.findMany({
    include: {
      submenus: true
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <span className="bg-amber-500/20 text-amber-500 p-2 rounded-xl">🤖</span>
          Assistant Rédacteur IA
        </h1>
        <p className="text-slate-400 mt-2 max-w-2xl">
          Lancez une recherche automatique sur l'actualité chaude et laissez l'IA rédiger un brouillon complet. Vous gardez 100% du contrôle : les articles sont sauvegardés en tant que brouillons pour relecture.
        </p>
      </div>

      {/* Le composant client gérera l'interface interactive et les appels API */}
      <AiAssistantClient menus={menus} authorId={(session.user as any).id} />
    </div>
  );
}
