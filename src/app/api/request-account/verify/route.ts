import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { sendApprovalEmail } from '@/lib/email';
import * as bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return new NextResponse('Jeton de confirmation manquant.', { status: 400 });
    }

    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.url.startsWith('https') ? 'https' : 'http';

    // 1. Rechercher la demande de compte
    const accountRequest = await db.accountRequest.findUnique({
      where: { confirmationToken: token }
    });

    if (!accountRequest) {
      return new NextResponse('Demande d\'inscription introuvable ou jeton expiré.', { status: 404 });
    }

    // 2. Si c'est un compte LECTEUR (reader) et NON une demande de promotion:
    // Activation INSTANTANÉE !
    if (accountRequest.role === 'reader' && !accountRequest.isPromotion) {
      // Vérifier si un compte avec cet email existe déjà
      const existingUser = await db.user.findUnique({
        where: { email: accountRequest.email }
      });

      let tempPass = '';
      if (!existingUser) {
        // Générer un mot de passe temporaire robuste
        tempPass = Math.random().toString(36).substring(2, 10) + 'A1!';
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(tempPass, salt);

        // Créer l'utilisateur dans la base de données
        await db.user.create({
          data: {
            name: accountRequest.name,
            email: accountRequest.email,
            password: hashedPassword,
            role: 'reader',
            status: 'active',
            profilePhoto: accountRequest.profilePhoto || null,
          }
        });

        // Envoyer l'email d'activation immédiate avec les identifiants
        await sendApprovalEmail(
          accountRequest.email,
          accountRequest.name,
          tempPass,
          `${protocol}://${host}/login`
        );
      }

      // Supprimer la demande de compte traitée
      await db.accountRequest.delete({
        where: { id: accountRequest.id }
      });

      // Audit log
      await logAction(
        'ACCOUNT_READER_INSTANT_ACTIVATED',
        `Compte Lecteur activé instantanément pour ${accountRequest.name} (${accountRequest.email}) suite à la confirmation de son adresse email.`
      );

      // Rediriger vers la page de confirmation avec type=instant
      return NextResponse.redirect(`${protocol}://${host}/request-account/confirmed?type=instant`);
    }

    // 3. Si c'est un compte RÉDACTEUR (journalist) ou une promotion :
    // Confirmation de l'email et passage au statut d'examen par la rédaction/admin
    if (accountRequest.status === 'PENDING') {
      await db.accountRequest.update({
        where: { id: accountRequest.id },
        data: { status: 'CONFIRMED_EMAIL' }
      });

      await logAction(
        'ACCOUNT_REQUEST_EMAIL_CONFIRMED',
        `Email de la demande de ${accountRequest.role === 'journalist' ? 'Rédacteur' : 'Lecteur'} de ${accountRequest.name} (${accountRequest.email}) confirmé avec succès. En attente de validation admin.`
      );
    }

    // Rediriger vers la page de confirmation avec type=review
    return NextResponse.redirect(`${protocol}://${host}/request-account/confirmed?type=review`);
  } catch (error) {
    console.error('Error verifying account request email:', error);
    return new NextResponse('Une erreur interne est survenue lors de la vérification.', { status: 500 });
  }
}
