import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return new NextResponse('Jeton de confirmation manquant.', { status: 400 });
    }

    // 1. Rechercher la demande de compte
    const accountRequest = await db.accountRequest.findUnique({
      where: { confirmationToken: token }
    });

    if (!accountRequest) {
      return new NextResponse('Demande d\'inscription introuvable ou jeton invalide.', { status: 404 });
    }

    // 2. Mettre à jour le statut à CONFIRMED_EMAIL
    if (accountRequest.status === 'PENDING') {
      await db.accountRequest.update({
        where: { id: accountRequest.id },
        data: { status: 'CONFIRMED_EMAIL' }
      });

      // 3. Logger l'action d'audit
      await logAction(
        'ACCOUNT_REQUEST_EMAIL_CONFIRMED',
        `Email de la demande de compte de ${accountRequest.name} (${accountRequest.email}) confirmé avec succès.`
      );
    }

    // 4. Rediriger l'utilisateur vers une page de confirmation graphique et conviviale
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.url.startsWith('https') ? 'https' : 'http';
    return NextResponse.redirect(`${protocol}://${host}/request-account/confirmed`);
  } catch (error) {
    console.error('Error verifying account request email:', error);
    return new NextResponse('Une erreur interne est survenue.', { status: 500 });
  }
}
