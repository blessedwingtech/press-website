import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomBytes } from 'crypto';
import { sendResetEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email requis.' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      // Message générique pour éviter le user enumeration
      return NextResponse.json(
        { message: 'Si un compte existe avec cet email, un lien de réinitialisation vous a été envoyé.' }
      );
    }

    // Générer un token aléatoire (32 octets hexadécimaux)
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // expire dans 1 heure

    await db.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    // Construire le lien de réinitialisation
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/reset-password/${resetToken}`;

    // Journalisation du lien (utile en développement)
    console.log('🔐 Lien de réinitialisation :', resetLink);

    // Envoi de l'email via Nodemailer
    await sendResetEmail(user.email, resetLink);

    return NextResponse.json({
      message: 'Si un compte existe avec cet email, un lien de réinitialisation vous a été envoyé.'
    });
  } catch (error) {
    console.error('Erreur forgot-password:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'envoi de l\'email.' },
      { status: 500 }
    );
  }
}