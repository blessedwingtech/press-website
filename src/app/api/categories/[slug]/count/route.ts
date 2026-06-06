import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const revalidate = 0; // Desactiver le cache

interface RouteParams {
  params: {
    slug: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;

    const menu = await db.menu.findUnique({
      where: { slug },
    });

    if (!menu) {
      return NextResponse.json(
        { error: 'Catégorie introuvable.' },
        { status: 404 }
      );
    }

    // Récupérer le paramètre de démonstration
    const demoSetting = await db.systemSetting.findUnique({
      where: { key: 'showDemoData' },
    });
    const showDemo = demoSetting ? demoSetting.value === 'true' : true;

    const where: any = {};
    if (!showDemo) {
      where.isDemo = false;
    }

    // Si le menu demandé est "actualites", on compte aussi les articles cross-publiés
    if (slug === 'actualites') {
      where.OR = [
        { menuId: menu.id },
        { alsoInActualites: true },
      ];
    } else {
      where.menuId = menu.id;
    }

    const count = await db.article.count({ where });

    return NextResponse.json({
      category: menu.nom,
      slug,
      count,
    });
  } catch (error: any) {
    console.error('Error counting category articles:', error);
    return NextResponse.json(
      { error: 'Erreur lors du comptage des articles de la catégorie.' },
      { status: 500 }
    );
  }
}
