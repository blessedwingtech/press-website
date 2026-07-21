import nodemailer from 'nodemailer';

// 1. Transporteur Principal (Serveur Bittonik)
const primaryTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.bittonik.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE !== 'false', // true pour SSL sur port 465
  auth: {
    user: process.env.SMTP_USER || 'contact@bittonik.com',
    pass: process.env.SMTP_PASS || '', // Mot de passe du serveur mail.bittonik.com dans .env
  },
  tls: {
    rejectUnauthorized: false, // Autorise les certificats autosignés
  },
});

// 2. Transporteur de Secours (Serveur Gmail SMTP)
const fallbackUser = process.env.GMAIL_USER || process.env.EMAIL_HOST_USER || 'blessedwingtech@gmail.com';
const fallbackPass = process.env.GMAIL_APP_PASS || process.env.EMAIL_HOST_PASSWORD || '';

const fallbackTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: fallbackUser,
    pass: fallbackPass, // Mot de passe d'application de secours
  },
});

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Envoie un email avec basculement automatique vers Gmail en cas de panne du serveur principal.
 */
async function sendMailWithFailover(options: MailOptions) {
  const primaryFrom = `PressTonik <${process.env.SMTP_USER || 'contact@bittonik.com'}>`;
  const fallbackFrom = `PressTonik <${fallbackUser}>`;

  try {
    // Tentative via le serveur principal Bittonik
    console.log('📬 Tentative d\'envoi d\'e-mail via le serveur principal SMTP (Bittonik)...');
    const info = await primaryTransporter.sendMail({
      from: primaryFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log('✅ E-mail envoyé avec succès via Bittonik, ID :', info.messageId);
    return info;
  } catch (primaryError: any) {
    console.warn('⚠️ Échec de l\'envoi via le serveur principal Bittonik :', primaryError.message || primaryError);

    // Vérifier si le secours Gmail est configuré (avec GMAIL_* ou EMAIL_HOST_*)
    const isGmailConfigured = 
      (process.env.GMAIL_USER && process.env.GMAIL_APP_PASS) || 
      (process.env.EMAIL_HOST_USER && process.env.EMAIL_HOST_PASSWORD);

    if (!isGmailConfigured) {
      console.error('❌ Le serveur SMTP de secours Gmail n\'est pas configuré dans le fichier .env (EMAIL_HOST_USER / EMAIL_HOST_PASSWORD manquants).');
      throw primaryError; // Relancer l'erreur d'origine s'il n'y a pas de solution de secours
    }

    // Basculement sur Gmail
    try {
      console.log('🔄 Basculement automatique : Envoi de secours via Gmail SMTP...');
      const info = await fallbackTransporter.sendMail({
        from: fallbackFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      console.log('✅ E-mail de secours envoyé avec succès via Gmail, ID :', info.messageId);
      return info;
    } catch (fallbackError: any) {
      console.error('❌ Échec critique : L\'envoi principal ET le secours Gmail ont tous deux échoué.', fallbackError.message || fallbackError);
      throw new Error('Tous les serveurs de messagerie (Bittonik et Gmail) ont échoué à expédier le message.');
    }
  }
}

export async function sendResetEmail(to: string, link: string) {
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
      <h2>Réinitialisation de votre mot de passe</h2>
      <p>Bonjour,</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
      <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
      <p style="margin: 24px 0;">
        <a href="${link}" style="background-color: #7c3aed; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Réinitialiser mon mot de passe</a>
      </p>
      <p>Ce lien expire dans 1 heure.</p>
      <p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px;" />
      <p style="font-size: 11px; color: #64748b;">PressTonik - Portail haïtien d'information libre.</p>
    </div>
  `;
  return sendMailWithFailover({ to, subject: 'Réinitialisation de votre mot de passe - PressTonik', html });
}

export async function sendVerificationEmail(to: string, link: string) {
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
      <h2>Confirmez votre adresse email</h2>
      <p>Bonjour,</p>
      <p>Vous avez fait une demande de création de compte sur <strong>PressTonik</strong>.</p>
      <p>Pour confirmer votre demande et la soumettre à la validation de nos administrateurs, veuillez cliquer sur le bouton ci-dessous :</p>
      <p style="margin: 24px 0;">
        <a href="${link}" style="background-color: #7c3aed; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Confirmer mon email</a>
      </p>
      <p>Ou copiez-collez ce lien dans votre navigateur :</p>
      <p><a href="${link}">${link}</a></p>
      <p>Si vous n'êtes pas à l'origine de cette inscription, vous pouvez ignorer cet email.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px;" />
      <p style="font-size: 11px; color: #64748b;">PressTonik - Portail haïtien d'information libre.</p>
    </div>
  `;
  return sendMailWithFailover({ to, subject: 'Confirmation de votre demande d\'inscription - PressTonik', html });
}

export async function sendApprovalEmail(to: string, name: string, tempPass: string, loginLink: string) {
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
      <h2>Félicitations, ${name} !</h2>
      <p>Votre demande de compte a été approuvée par l'administration de <strong>PressTonik</strong>.</p>
      <p>Voici vos identifiants temporaires de connexion :</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Adresse Email :</td>
          <td style="padding: 8px; border: 1px solid #e2e8f0;">${to}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: bold;">Mot de passe temporaire :</td>
          <td style="padding: 8px; border: 1px solid #e2e8f0; font-family: monospace; font-size: 16px; color: #7c3aed; font-weight: bold;">${tempPass}</td>
        </tr>
      </table>
      <p style="color: #ef4444; font-weight: bold;">* Veuillez changer ce mot de passe dès votre première connexion pour assurer la sécurité de votre compte.</p>
      <p style="margin: 24px 0;">
        <a href="${loginLink}" style="background-color: #7c3aed; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Se connecter à mon espace</a>
      </p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px;" />
      <p style="font-size: 11px; color: #64748b;">PressTonik - Portail haïtien d'information libre.</p>
    </div>
  `;
  return sendMailWithFailover({ to, subject: 'Votre compte PressTonik a été approuvé ! 🎉', html });
}

export async function sendRejectionEmail(to: string, name: string) {
  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
      <h2>Bonjour ${name},</h2>
      <p>Nous vous remercions de l'intérêt porté à <strong>PressTonik</strong>.</p>
      <p>Après étude de votre dossier d'inscription, nous avons le regret de vous informer que votre demande de création de compte a été rejetée par l'administration.</p>
      <p>Vos données personnelles et de candidature ont été entièrement supprimées de nos bases conformément à notre charte de protection.</p>
      <p>Cordialement,</p>
      <p>L'équipe d'administration PressTonik.</p>
    </div>
  `;
  return sendMailWithFailover({ to, subject: 'Mise à jour concernant votre demande d\'inscription - PressTonik', html });
}
