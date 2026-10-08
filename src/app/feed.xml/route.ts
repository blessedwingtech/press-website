import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const revalidate = 900; // Rafraîchissement du flux RSS toutes les 15 minutes

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://press.bittonik.com';

  try {
    const articles = await db.article.findMany({
      where: {
        published: true,
      },
      include: {
        auteur: {
          select: { name: true, email: true },
        },
        menu: {
          select: { nom: true },
        },
      },
      orderBy: {
        datePublication: 'desc',
      },
      take: 50,
    });

    const itemsXml = articles
      .map((article) => {
        // Nettoyer les balises HTML pour la description courte RSS
        const cleanDescription = article.contenu
          .replace(/<[^>]*>?/gm, '')
          .substring(0, 300)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

        const cleanTitle = article.titre
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

        const articleUrl = `${baseUrl}/articles/${article.slug}`;

        let enclosure = '';
        if (article.imagePrincipale) {
          enclosure = `<enclosure url="${article.imagePrincipale}" type="image/jpeg" />`;
        }

        return `
    <item>
      <title><![CDATA[${article.titre}]]></title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${new Date(article.datePublication).toUTCString()}</pubDate>
      <description><![CDATA[${cleanDescription}...]]></description>
      <category><![CDATA[${article.menu.nom}]]></category>
      <dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/"><![CDATA[${article.auteur.name}]]></dc:creator>
      ${enclosure}
    </item>`;
      })
      .join('');

    const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>PressTonik - Actualités et Presse en Continu</title>
    <link>${baseUrl}</link>
    <description>Média d'actualités et de journalisme d'investigation propulsé par Blessed Wing Technology.</description>
    <language>fr-FR</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(rssXml.trim(), {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Erreur génération flux RSS:', error);
    return new NextResponse('Erreur génération flux RSS', { status: 500 });
  }
}
