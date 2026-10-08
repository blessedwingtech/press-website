export function canAccessAiAssistant(email?: string | null): boolean {
  if (!email) return false;
  
  // LOGIQUE INTELLIGENTE : 
  // Pour l'instant, on se base sur une liste d'emails stricte.
  // Plus tard, il suffira de remplacer ce tableau par une vérification en BDD 
  // (ex: vérification d'un abonnement Premium ou d'un flag isPremium dans l'objet User).
  const allowedEmails = ['bentz@bittonik.com', 'kystanie@bittonik.com'];
  
  return allowedEmails.includes(email.toLowerCase());
}
