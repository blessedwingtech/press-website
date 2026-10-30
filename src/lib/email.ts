import nodemailer from 'nodemailer';

// 1. Transporteur Principal (Serveur Bittonik)
const primaryUser = process.env.SMTP_USER || 'press@bittonik.com';
const primaryTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.bittonik.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE !== 'false', // true pour SSL sur port 465
  auth: {
    user: primaryUser,
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
    pass: fallbackPass, // Mot de passe d'application de secours Google (16 caractères)
  },
});

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  fromName?: string;
  replyTo?: string;
  unsubscribeUrl?: string;
}

/**
 * Envoie un email avec basculement automatique vers Gmail en cas de panne du serveur principal.
 */
async function sendMailWithFailover(options: MailOptions) {
  const fromDisplayName = options.fromName ? `${options.fromName} via PressTonik` : 'PressTonik';
  const primaryFrom = `"${fromDisplayName}" <${primaryUser}>`;
  const fallbackFrom = `"${fromDisplayName}" <${fallbackUser}>`;

  const extraHeaders: Record<string, string> = {};
  if (options.unsubscribeUrl) {
    extraHeaders['List-Unsubscribe'] = `<${options.unsubscribeUrl}>`;
    extraHeaders['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
  }

  try {
    // Tentative via le serveur principal Bittonik
    console.log(`📬 [SMTP Bittonik] Envoi à ${options.to} : "${options.subject}"...`);
    const info = await primaryTransporter.sendMail({
      from: primaryFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo || primaryUser,
      headers: extraHeaders,
    });
    console.log('✅ [SMTP Bittonik] E-mail envoyé avec succès, ID :', info.messageId);
    return info;
  } catch (primaryError: any) {
    console.warn('⚠️ Échec de l\'envoi via le serveur principal Bittonik :', primaryError.message || primaryError);

    // Vérifier si le secours Gmail est configuré
    const isGmailConfigured = Boolean(fallbackUser && fallbackPass);

    if (!isGmailConfigured) {
      console.error('❌ Le serveur SMTP de secours Gmail n\'est pas configuré dans le fichier .env (GMAIL_USER / GMAIL_APP_PASS manquants).');
      throw primaryError;
    }

    // Basculement sur Gmail
    try {
      console.log('🔄 Basculement automatique : Envoi de secours via Gmail SMTP...');
      const info = await fallbackTransporter.sendMail({
        from: fallbackFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
        replyTo: options.replyTo || fallbackUser,
        headers: extraHeaders,
      });
      console.log('✅ [SMTP Gmail Fallback] E-mail de secours envoyé avec succès, ID :', info.messageId);
      return info;
    } catch (fallbackError: any) {
      console.error('❌ Échec critique : L\'envoi principal Bittonik ET le secours Gmail ont tous deux échoué.', fallbackError.message || fallbackError);
      throw new Error('Tous les serveurs de messagerie (Bittonik et Gmail) ont échoué à expédier le message.');
    }
  }
}

export async function sendResetEmail(to: string, link: string) {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; background: #0f172a; color: #e2e8f0; border-radius: 12px; max-width: 560px; margin: 0 auto;">
      <h2 style="color: #ffffff; margin-bottom: 12px;">Réinitialisation de votre mot de passe</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #94a3b8;">Bonjour,</p>
      <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">Vous avez demandé la réinitialisation de votre mot de passe sur <strong>PressTonik</strong>.</p>
      <p style="margin: 24px 0;">
        <a href="${link}" style="background-color: #10b981; color: #020617; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Réinitialiser mon mot de passe</a>
      </p>
      <p style="font-size: 12px; color: #64748b;">Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.</p>
      <hr style="border: 0; border-top: 1px solid #1e293b; margin-top: 30px;" />
      <p style="font-size: 11px; color: #475569;">PressTonik - Plateforme d'information et de presse rédactionnelle.</p>
    </div>
  `;
  return sendMailWithFailover({ to, subject: 'Réinitialisation de votre mot de passe - PressTonik', html });
}

export async function sendVerificationEmail(to: string, link: string) {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; background: #0f172a; color: #e2e8f0; border-radius: 12px; max-width: 560px; margin: 0 auto;">
      <h2 style="color: #ffffff; margin-bottom: 12px;">Confirmez votre adresse email</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">Vous avez fait une demande de création de compte sur <strong>PressTonik</strong>.</p>
      <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">Pour confirmer votre demande et la soumettre à la validation de nos administrateurs, veuillez cliquer sur le bouton ci-dessous :</p>
      <p style="margin: 24px 0;">
        <a href="${link}" style="background-color: #10b981; color: #020617; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Confirmer mon email</a>
      </p>
      <p style="font-size: 12px; color: #64748b;">Si le bouton ne fonctionne pas, copiez-collez ce lien : <a href="${link}" style="color: #10b981;">${link}</a></p>
      <hr style="border: 0; border-top: 1px solid #1e293b; margin-top: 30px;" />
      <p style="font-size: 11px; color: #475569;">PressTonik - Portail d'information libre.</p>
    </div>
  `;
  return sendMailWithFailover({ to, subject: 'Confirmation de votre demande d\'inscription - PressTonik', html });
}

export async function sendApprovalEmail(to: string, name: string, tempPass: string, loginLink: string) {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; background: #0f172a; color: #e2e8f0; border-radius: 12px; max-width: 560px; margin: 0 auto;">
      <h2 style="color: #ffffff; margin-bottom: 12px;">Félicitations, ${name} ! 🎉</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">Votre demande de compte a été approuvée par l'administration de <strong>PressTonik</strong>.</p>
      <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">Voici vos identifiants temporaires de connexion :</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #020617; border-radius: 8px; overflow: hidden;">
        <tr>
          <td style="padding: 10px 14px; border-bottom: 1px solid #1e293b; color: #94a3b8; font-size: 13px;">Adresse Email :</td>
          <td style="padding: 10px 14px; border-bottom: 1px solid #1e293b; color: #ffffff; font-weight: bold; font-size: 13px;">${to}</td>
        </tr>
        <tr>
          <td style="padding: 10px 14px; color: #94a3b8; font-size: 13px;">Mot de passe temporaire :</td>
          <td style="padding: 10px 14px; font-family: monospace; font-size: 15px; color: #10b981; font-weight: bold;">${tempPass}</td>
        </tr>
      </table>
      <p style="color: #f59e0b; font-size: 12px;">* Veuillez changer ce mot de passe dès votre première connexion pour assurer la sécurité de votre compte.</p>
      <p style="margin: 24px 0;">
        <a href="${loginLink}" style="background-color: #10b981; color: #020617; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Se connecter à mon espace</a>
      </p>
      <hr style="border: 0; border-top: 1px solid #1e293b; margin-top: 30px;" />
      <p style="font-size: 11px; color: #475569;">PressTonik - Portail d'information libre.</p>
    </div>
  `;
  return sendMailWithFailover({ to, subject: 'Votre compte PressTonik a été approuvé ! 🎉', html });
}

export async function sendRejectionEmail(to: string, name: string) {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; background: #0f172a; color: #e2e8f0; border-radius: 12px; max-width: 560px; margin: 0 auto;">
      <h2 style="color: #ffffff; margin-bottom: 12px;">Bonjour ${name},</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">Nous vous remercions de l'intérêt porté à <strong>PressTonik</strong>.</p>
      <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">Après étude de votre dossier d'inscription, nous avons le regret de vous informer que votre demande de création de compte n'a pas pu être retenue.</p>
      <p style="font-size: 12px; color: #64748b;">Vos données personnelles ont été supprimées de nos bases conformément à notre charte de protection.</p>
      <hr style="border: 0; border-top: 1px solid #1e293b; margin-top: 30px;" />
      <p style="font-size: 11px; color: #475569;">L'équipe d'administration PressTonik.</p>
    </div>
  `;
  return sendMailWithFailover({ to, subject: 'Mise à jour concernant votre demande d\'inscription - PressTonik', html });
}

// 3. Nouveaux emails pour la Newsletter des Journalistes PRO
interface WelcomeNewsletterParams {
  to: string;
  authorName: string;
  authorEmail?: string;
  authorBio?: string;
  authorPhoto?: string;
  frequency: string;
  unsubscribeUrl: string;
}

export async function sendNewsletterWelcomeEmail(params: WelcomeNewsletterParams) {
  const isAuthorSpecific = Boolean(params.authorName && params.authorName !== 'PressTonik');
  const frequencyLabel = params.frequency === 'INSTANT' ? 'Alertes instantanées' : 'Récapitulatif hebdomadaire';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 28px; background: #020617; color: #e2e8f0; border-radius: 16px; max-width: 580px; margin: 0 auto; border: 1px solid #1e293b;">
      <div style="border-bottom: 1px solid #1e293b; padding-bottom: 18px; margin-bottom: 20px;">
        <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #10b981;">PressTonik &bull; Lettre d'information</span>
        <h1 style="color: #ffffff; font-size: 20px; font-weight: 900; margin: 6px 0 0 0;">
          ${isAuthorSpecific ? `Abonnement confirmé : La plume de ${params.authorName}` : 'Bienvenue dans la Newsletter PressTonik'}
        </h1>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
        Bonjour,
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
        ${isAuthorSpecific 
          ? `Vous êtes désormais abonné(e) aux écrits et enquêtes exclusives de <strong>${params.authorName}</strong>.` 
          : 'Vous êtes désormais inscrit(e) aux alertes et analyses de la rédaction de PressTonik.'}
      </p>

      <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 16px; margin: 20px 0;">
        <span style="display: block; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #94a3b8; margin-bottom: 4px;">Fréquence choisie :</span>
        <span style="font-size: 14px; font-weight: bold; color: #f59e0b;">${frequencyLabel}</span>
      </div>

      <p style="font-size: 13px; line-height: 1.6; color: #94a3b8;">
        Chaque parution vous sera transmise avec le plus grand soin. Vous pouvez répondre directement à cet email pour échanger avec le journaliste.
      </p>

      <hr style="border: 0; border-top: 1px solid #1e293b; margin: 28px 0 16px 0;" />
      <div style="font-size: 11px; color: #64748b; line-height: 1.5; text-align: center;">
        <p>PressTonik &bull; Presse Rédactionnelle Indépendante</p>
        <p>Pour vous désabonner en 1 clic : <a href="${params.unsubscribeUrl}" style="color: #ef4444; text-decoration: underline;">Se désinscrire de cette newsletter</a></p>
      </div>
    </div>
  `;

  return sendMailWithFailover({
    to: params.to,
    subject: isAuthorSpecific ? `Bienvenue dans la newsletter de ${params.authorName} ! ✍️` : 'Bienvenue dans la newsletter PressTonik ! 📰',
    html,
    fromName: isAuthorSpecific ? `${params.authorName} (PressTonik)` : 'PressTonik',
    replyTo: params.authorEmail,
    unsubscribeUrl: params.unsubscribeUrl,
  });
}

interface ArticleAlertParams {
  to: string;
  authorName: string;
  authorEmail?: string;
  articleTitle: string;
  articleSlug: string;
  articlePreview: string;
  articleImage?: string;
  unsubscribeUrl: string;
}

export async function sendNewsletterArticleAlertEmail(params: ArticleAlertParams) {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://press.bittonik.com';
  const articleUrl = `${baseUrl}/articles/${params.articleSlug}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 28px; background: #020617; color: #e2e8f0; border-radius: 16px; max-width: 580px; margin: 0 auto; border: 1px solid #1e293b;">
      <div style="border-bottom: 1px solid #1e293b; padding-bottom: 14px; margin-bottom: 18px;">
        <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #f59e0b;">Nouvelle parution &bull; ${params.authorName}</span>
      </div>

      <h1 style="color: #ffffff; font-size: 22px; font-weight: 900; line-height: 1.35; margin: 0 0 16px 0;">
        ${params.articleTitle}
      </h1>

      ${params.articleImage ? `
        <div style="margin: 18px 0; border-radius: 10px; overflow: hidden; border: 1px solid #1e293b;">
          <img src="${params.articleImage}" alt="${params.articleTitle}" style="width: 100%; height: auto; display: block;" />
        </div>
      ` : ''}

      <div style="font-size: 14px; line-height: 1.7; color: #cbd5e1; margin-bottom: 24px;">
        ${params.articlePreview}
      </div>

      <div style="margin: 28px 0;">
        <a href="${articleUrl}" style="background-color: #10b981; color: #020617; padding: 13px 26px; border-radius: 10px; text-decoration: none; font-weight: 800; font-size: 14px; display: inline-block;">
          Lire l'article complet &rarr;
        </a>
      </div>

      <hr style="border: 0; border-top: 1px solid #1e293b; margin: 28px 0 16px 0;" />
      <div style="font-size: 11px; color: #64748b; line-height: 1.5; text-align: center;">
        <p>Vous recevez cet email car vous êtes abonné(e) à la plume de <strong>${params.authorName}</strong> sur PressTonik.</p>
        <p>Pour vous désabonner en 1 clic : <a href="${params.unsubscribeUrl}" style="color: #ef4444; text-decoration: underline;">Se désabonner</a></p>
      </div>
    </div>
  `;

  return sendMailWithFailover({
    to: params.to,
    subject: `[${params.authorName}] ${params.articleTitle}`,
    html,
    fromName: `${params.authorName} (PressTonik)`,
    replyTo: params.authorEmail,
    unsubscribeUrl: params.unsubscribeUrl,
  });
}

interface NewSubscriberNotificationParams {
  journalistEmail: string;
  journalistName: string;
  subscriberEmail: string;
  frequency: string;
  totalSubscribersCount: number;
}

/**
 * Notifie le journaliste lorsqu'un nouveau lecteur s'abonne à sa newsletter.
 */
export async function sendNewSubscriberAlertToJournalist(params: NewSubscriberNotificationParams) {
  const frequencyLabel = params.frequency === 'INSTANT' ? 'Alertes instantanées à chaque publication' : 'Récapitulatif hebdomadaire';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 28px; background: #020617; color: #e2e8f0; border-radius: 16px; max-width: 580px; margin: 0 auto; border: 1px solid #1e293b;">
      <div style="border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 20px;">
        <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #10b981;">PressTonik &bull; Espace Journaliste</span>
        <h1 style="color: #ffffff; font-size: 22px; font-weight: 900; margin: 6px 0 0 0;">
          Nouveau lecteur abonné à votre plume ! ✍️
        </h1>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
        Bonjour <strong>${params.journalistName}</strong>,
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
        Un nouveau lecteur vient de s'abonner pour suivre vos enquêtes et parutions exclusives sur PressTonik.
      </p>

      <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 18px; margin: 22px 0;">
        <div style="margin-bottom: 10px;">
          <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #94a3b8; display: block;">Abonné :</span>
          <span style="font-size: 15px; font-weight: bold; color: #38bdf8;">${params.subscriberEmail}</span>
        </div>
        <div>
          <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #94a3b8; display: block;">Préférence choisie :</span>
          <span style="font-size: 13px; font-weight: 600; color: #f59e0b;">${frequencyLabel}</span>
        </div>
      </div>

      <p style="font-size: 13px; color: #94a3b8; line-height: 1.6;">
        📊 Vous comptez désormais un total de <strong>${params.totalSubscribersCount}</strong> abonné(s) direct(s).
      </p>

      <div style="margin: 26px 0;">
        <a href="https://press.bittonik.com/journalist/articles" style="background-color: #10b981; color: #020617; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block;">
          Accéder à mon espace rédaction &rarr;
        </a>
      </div>

      <hr style="border: 0; border-top: 1px solid #1e293b; margin: 28px 0 16px 0;" />
      <p style="font-size: 11px; color: #475569; text-align: center;">PressTonik &bull; Portail et Réseau de Presse Indépendante.</p>
    </div>
  `;

  return sendMailWithFailover({
    to: params.journalistEmail,
    subject: `[PressTonik] Nouvel abonné à vos parutions ! (${params.subscriberEmail})`,
    html,
    fromName: 'PressTonik Notifications',
  });
}
