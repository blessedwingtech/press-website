export type AiUserAccessInput = 
  | string 
  | { email?: string | null; isPro?: boolean | null; role?: string | null }
  | null
  | undefined;

export function canAccessAiAssistant(target?: AiUserAccessInput): boolean {
  if (!target) return false;

  const allowedEmails = ['bentz@bittonik.com', 'kystanie@bittonik.com'];

  if (typeof target === 'object') {
    if (target.isPro) return true;
    if (target.role === 'admin') return true;
    if (!target.email) return false;
    return allowedEmails.includes(target.email.toLowerCase());
  }

  return allowedEmails.includes(target.toLowerCase());
}

