import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== 'journalist' && (session.user as any).role !== 'admin')) {
      return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const perPage = parseInt(searchParams.get('per_page') || '6') || 6;

    if (!query) {
      return NextResponse.json({ error: 'Terme de recherche manquant.' }, { status: 400 });
    }

    const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY?.trim();
    if (!UNSPLASH_ACCESS_KEY) {
      return NextResponse.json({ error: 'Clé API Unsplash non configurée.' }, { status: 500 });
    }

    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=${perPage}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
      cache: 'no-store',
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.errors?.[0] || 'Erreur Unsplash' }, { status: res.status });
    }

    const images = (data.results || []).map((img: any) => ({
      id: img.id,
      url: img.urls.regular,
      thumb: img.urls.small,
      alt: img.alt_description || img.description || query,
      photographer: img.user.name,
      photographerUrl: img.user.links.html,
    }));

    return NextResponse.json({ images });
  } catch (error: any) {
    console.error('Erreur Unsplash search API:', error);
    return NextResponse.json({ error: 'Erreur interne lors de la recherche Unsplash.' }, { status: 500 });
  }
}
