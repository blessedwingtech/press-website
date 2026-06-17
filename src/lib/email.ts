import { Resend } from 'resend';

// Initialise Resend avec ta clé API
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResetEmail(to: string, link: string) {
  try {
    const { data, error } = await resend.emails.send({
      // ⚠️ Remplace par ton domaine vérifié ou utilise onboarding@resend.dev pour les tests
      from: 'PressTonik <onboarding@resend.dev>', 
      to: [to],
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <p>Bonjour,</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
        <p><a href="${link}">${link}</a></p>
        <p>Ce lien expire dans 1 heure.</p>
        <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
      `,
    });

    if (error) {
      console.error('❌ Erreur Resend :', error);
      throw new Error(error.message);
    }

    console.log('✅ Email envoyé avec Resend, ID :', data?.id);
    return data;
  } catch (error) {
    console.error('❌ Échec d\'envoi :', error);
    throw new Error('Impossible d\'envoyer l\'email de réinitialisation.');
  }
}

