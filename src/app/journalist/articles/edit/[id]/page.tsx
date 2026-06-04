import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import ArticleForm from '@/components/ArticleForm';

export const revalidate = 0; // Pas de cache

interface EditArticlePageProps {
  params: {
    id: string;
  };
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const article = await db.article.findUnique({
    where: { id: params.id },
  });

  if (!article) {
    notFound();
  }

  // Droits : Seul l'auteur de l'article ou l'administrateur peut modifier l'article
  const isAuthor = article.auteurId === (session.user as any).id;
  const isAdmin = (session.user as any).role === 'admin';
  if (!isAuthor && !isAdmin) {
    redirect('/journalist');
  }

  const menus = await db.menu.findMany({
    orderBy: { order: 'asc' },
    include: {
      submenus: { orderBy: { order: 'asc' } },
    },
  });

  return <ArticleForm menus={menus} initialData={article} />;
}
