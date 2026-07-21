'use server';

import { db } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { sendVerificationEmail } from '@/lib/email';
import { randomUUID } from 'crypto';
import { headers } from 'next/headers';

export async function submitAccountRequest(formData: {
  name: string;
  username: string;
  email: string;
  role: string;
  profilePhoto: string | null;
}) {
  try {
    const { name, username, email, role, profilePhoto } = formData;

    if (!name || !username || !email || !role) {
      return { success: false, error: 'Tous les champs obligatoires doivent être remplis.' };
    }

    // 1. Vérifier si l'utilisateur existe déjà dans User
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { name: username }
        ]
      }
    });

    if (existingUser) {
      return { success: false, error: 'Cette adresse email ou ce nom d\'utilisateur est déjà utilisé.' };
    }

    // 2. Vérifier si une demande est déjà en cours pour cet email ou nom d'utilisateur
    const existingRequest = await db.accountRequest.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username }
        ]
      }
    });

    if (existingRequest) {
      if (existingRequest.status === 'PENDING') {
        return { success: false, error: 'Une demande est déjà en cours de validation pour cette adresse ou ce nom d\'utilisateur.' };
      }
      if (existingRequest.status === 'CONFIRMED_EMAIL') {
        return { success: false, error: 'Votre email est déjà confirmé et en cours d\'examen par l\'administration.' };
      }
    }

    // 3. Générer un jeton de confirmation
    const token = randomUUID();

    // 4. Créer la demande dans la base de données
    // 4. Créer la demande dans la base de données
    const newRequest = await db.accountRequest.create({
      data: {
        name,
        username,
        email: email.toLowerCase(),
        role,
        profilePhoto,
        confirmationToken: token,
        status: 'PENDING'
      }
    });

    // 5. Récupérer l'hôte actuel pour construire le lien de confirmation
    let host = 'localhost:3000';
    try {
      const headersList = headers();
      host = headersList.get('host') || 'localhost:3000';
    } catch (e) {
      // Ignorer si appelé hors contexte http
    }

    const protocol = host.includes('localhost') ? 'http' : 'https';
    const confirmationLink = `${protocol}://${host}/api/request-account/verify?token=${token}`;

    try {
      // 6. Envoyer l'email de confirmation
      await sendVerificationEmail(email.toLowerCase(), confirmationLink);
    } catch (emailError: any) {
      // Rollback de la création en base de données si l'envoi d'email échoue
      await db.accountRequest.delete({
        where: { id: newRequest.id }
      });
      throw new Error(`Échec de l'envoi de l'e-mail : ${emailError.message || 'erreur serveur mail'}`);
    }

    // 7. Enregistrer l'audit log
    await logAction('ACCOUNT_REQUEST_SUBMIT', `Demande de compte créée par ${name} (${email}) - Rôle demandé : ${role}`);

    return { success: true };
  } catch (error: any) {
    console.error('Error submitting account request:', error);
    return { success: false, error: error.message || 'Une erreur interne est survenue.' };
  }
}
