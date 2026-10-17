import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { canAccessAiAssistant } from '@/lib/ai-access';
import { db } from '@/lib/db';
import AiAssistantClient from './AiAssistantClient';

export default async function AiAssistantPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !canAccessAiAssistant(session.user as any)) {
    redirect('/journalist'); // Rediriger si accès non autorisé
  }

  // Récupérer les menus pour le contexte
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
          Carnet de Recherche & Sourcing IA
        </h1>
        <p className="text-slate-400 mt-2 max-w-2xl">
          Espace d'investigation documentaire séparé réservé aux journalistes PRO. Recoupez les faits chauds, analysez les chronologies et vérifiez les sources officielles sans jamais déléguer l'écriture de vos articles.
        </p>
      </div>

      {/* Le composant client gérera l'interface interactive et les appels API */}
      <AiAssistantClient menus={menus} authorId={(session.user as any).id} />
    </div>
  );
}
