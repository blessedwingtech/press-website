import { db } from '@/lib/db';
import ArticleForm from '@/components/ArticleForm';

export const revalidate = 0; // Pas de cache

export default async function NewArticlePage() {
  // Récupérer toutes les catégories pour alimenter le sélecteur
  const menus = await db.menu.findMany({
    orderBy: { order: 'asc' },
    include: {
      submenus: { orderBy: { order: 'asc' } },
    },
  });

  return <ArticleForm menus={menus} />;
}
