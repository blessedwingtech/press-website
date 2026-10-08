import crypto from 'crypto';

export interface PayHubCheckoutOptions {
  userId?: string;
  email?: string;
  fullName?: string;
  amount: number;
  currency?: 'USD' | 'HTG' | 'EUR';
  purpose: 'SUBSCRIPTION' | 'ONE_TIME' | 'DONATION' | 'PAYOUT';
  description: string;
  returnUrl: string;
  cancelUrl: string;
  metadata?: Record<string, any>;
}

export interface PayHubPayoutOptions {
  recipientId: string;
  email: string;
  amount: number;
  currency: 'USD' | 'HTG' | 'EUR';
  method: 'MONCASH' | 'PAYPAL' | 'BANK_TRANSFER' | 'STRIPE';
  methodDetails: Record<string, any>; // ex: { phone: "+509..." } pour MonCash
  note?: string;
}

const PAY_HUB_BASE_URL = process.env.NEXT_PUBLIC_PAY_HUB_URL || 'https://pay.bittonik.com';
const PAY_HUB_API_KEY = process.env.PAY_HUB_API_KEY || '';
const PAY_HUB_WEBHOOK_SECRET = process.env.PAY_HUB_WEBHOOK_SECRET || '';

/**
 * 1. Génère l'URL de redirection sécurisée vers Pay-Hub Checkout
 */
export function createPayHubCheckoutUrl(options: PayHubCheckoutOptions): string {
  const url = new URL(`${PAY_HUB_BASE_URL}/checkout`);

  url.searchParams.set('source', 'PRESSTONIK');
  url.searchParams.set('amount', options.amount.toString());
  url.searchParams.set('currency', options.currency || 'USD');
  url.searchParams.set('purpose', options.purpose);
  url.searchParams.set('description', options.description);
  url.searchParams.set('return_url', options.returnUrl);
  url.searchParams.set('cancel_url', options.cancelUrl);

  if (options.userId) url.searchParams.set('user_id', options.userId);
  if (options.email) url.searchParams.set('email', options.email);
  if (options.fullName) url.searchParams.set('full_name', options.fullName);

  if (options.metadata) {
    url.searchParams.set('metadata', JSON.stringify({
      source_site: 'PRESSTONIK',
      ...options.metadata,
    }));
  }

  return url.toString();
}

/**
 * 2. Vérifie la signature cryptographique HMAC-SHA256 d'un webhook entrant
 */
export function verifyPayHubSignature(payload: string, receivedSignature: string): boolean {
  if (!PAY_HUB_WEBHOOK_SECRET) {
    console.warn('[Pay-Hub] Attention : PAY_HUB_WEBHOOK_SECRET non configuré.');
    return false;
  }

  try {
    const computedSignature = crypto
      .createHmac('sha256', PAY_HUB_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    // Comparaison en temps constant pour éviter les attaques temporelles (timing attacks)
    return crypto.timingSafeEqual(
      Buffer.from(computedSignature, 'utf8'),
      Buffer.from(receivedSignature, 'utf8')
    );
  } catch (error) {
    console.error('[Pay-Hub] Erreur lors de la vérification de la signature:', error);
    return false;
  }
}

/**
 * 3. Déclenche une demande de reversement (Payout) pour un journaliste ou vendeur
 */
export async function createPayHubPayout(options: PayHubPayoutOptions) {
  if (!PAY_HUB_API_KEY) {
    throw new Error('PAY_HUB_API_KEY manquante pour ordonner un payout.');
  }

  const response = await fetch(`${PAY_HUB_BASE_URL}/api/payouts/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${PAY_HUB_API_KEY}`,
      'X-Source-Site': 'PRESSTONIK',
    },
    body: JSON.stringify(options),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Échec de la demande de reversement Pay-Hub.');
  }

  return data;
}
