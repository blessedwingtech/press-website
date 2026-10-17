import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canAccessAiAssistant } from '@/lib/ai-access';
import ArticleForm from '@/components/ArticleForm';

export const revalidate = 0; // Pas de cache

export default async function NewArticlePage() {
  const session = await getServerSession(authOptions);

  // Récupérer toutes les catégories pour alimenter le sélecteur
  const menus = await db.menu.findMany({
    orderBy: { order: 'asc' },
    include: {
      submenus: { orderBy: { order: 'asc' } },
    },
  });

  const isPro = canAccessAiAssistant(session?.user as any);

  return <ArticleForm menus={menus} isPro={isPro} />;
}
