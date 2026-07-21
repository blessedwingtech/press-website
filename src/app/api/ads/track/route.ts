import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adId, type } = body;

    if (!adId || !['impression', 'click'].includes(type)) {
      return NextResponse.json({ error: 'Paramètres manquants ou invalides.' }, { status: 400 });
    }

    if (type === 'impression') {
      await db.ad.update({
        where: { id: adId },
        data: { impressions: { increment: 1 } },
      });
    } else if (type === 'click') {
      await db.ad.update({
        where: { id: adId },
        data: { clicks: { increment: 1 } },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error tracking ad metrics:', error);
    return NextResponse.json({ error: error.message || 'Une erreur interne est survenue.' }, { status: 500 });
  }
}
