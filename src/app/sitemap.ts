import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export const revalidate = 3600; // Régénération du sitemap toutes les heures

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://press.bittonik.com';

  // 1. Pages statiques principales
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/latest`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/avis`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // 2. Catégories et Sous-catégories dynamiques
  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const menus = await db.menu.findMany({
      include: {
        submenus: true,
      },
    });

    categoryRoutes = menus.flatMap((menu) => {
      const mainCat = {
        url: `${baseUrl}/category/${menu.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      };

      const subCats = menu.submenus.map((sub) => ({
        url: `${baseUrl}/category/${menu.slug}/${sub.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      }));

      return [mainCat, ...subCats];
    });
  } catch (err) {
    console.error('Erreur récupération catégories sitemap:', err);
  }

  // 3. Articles publiés
  let articleRoutes: MetadataRoute.Sitemap = [];
  try {
    const articles = await db.article.findMany({
      where: {
        published: true,
      },
      select: {
        slug: true,
        datePublication: true,
      },
      orderBy: {
        datePublication: 'desc',
      },
      take: 1000,
    });

    articleRoutes = articles.map((article) => ({
      url: `${baseUrl}/articles/${article.slug}`,
      lastModified: article.datePublication,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    }));
  } catch (err) {
    console.error('Erreur récupération articles sitemap:', err);
  }

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
