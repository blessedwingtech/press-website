import { db } from './db';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { headers } from 'next/headers';

export async function logAction(action: string, details: string) {
  try {
    let userId: string | null = null;
    let ipAddress: string | null = null;

    // Tenter de récupérer la session utilisateur connecté
    try {
      const session = await getServerSession(authOptions);
      if (session?.user) {
        userId = (session.user as any).id || null;
      }
    } catch (e) {
      // Peut échouer hors contexte de requête Next.js, on ignore silencieusement
    }

    // Tenter de récupérer l'adresse IP depuis les en-têtes HTTP
    try {
      const headersList = headers();
      ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '127.0.0.1';
      if (ipAddress && ipAddress.includes(',')) {
        ipAddress = ipAddress.split(',')[0].trim();
      }
    } catch (e) {
      // Ignorer si appelé en dehors d'une requête HTTP
    }

    await db.auditLog.create({
      data: {
        action,
        details,
        userId,
        ipAddress,
      },
    });
  } catch (error) {
    console.error('Error logging audit action:', error);
  }
}
