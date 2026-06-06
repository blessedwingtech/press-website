import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const revalidate = 0; // Desactiver le cache pour charger les articles en temps réel

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1') || 1;
    const limit = parseInt(searchParams.get('limit') || '10') || 10;
    const skip = (page - 1) * limit;

    // Récupérer le paramètre de démonstration
    const demoSetting = await db.systemSetting.findUnique({
      where: { key: 'showDemoData' },
    });
    const showDemo = demoSetting ? demoSetting.value === 'true' : true;

    const where: any = {};
    if (!showDemo) {
      where.isDemo = false;
    }

    const [articles, total] = await Promise.all([
      db.article.findMany({
        where,
        orderBy: { datePublication: 'desc' },
        take: limit,
        skip,
        include: {
          auteur: { select: { name: true } },
          menu: { select: { id: true, nom: true, slug: true } },
          submenu: { select: { id: true, nom: true, slug: true } },
        },
      }),
      db.article.count({ where }),
    ]);

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching public articles:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des articles.' },
      { status: 500 }
    );
  }
}
