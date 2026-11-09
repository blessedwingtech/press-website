/**
 * Utilitaire de formatage des dates au fuseau horaire officiel d'Haïti (America/Port-au-Prince)
 */

export const HAITI_TIMEZONE = 'America/Port-au-Prince';

export function formatArticleDate(
  date: Date | string | number,
  options?: {
    includeTime?: boolean;
    short?: boolean;
  }
): string {
  try {
    const d = typeof date === 'object' ? date : new Date(date);
    if (isNaN(d.getTime())) return '';

    const includeTime = options?.includeTime ?? false;
    const isShort = options?.short ?? false;

    if (includeTime) {
      return new Intl.DateTimeFormat('fr-FR', {
        timeZone: HAITI_TIMEZONE,
        day: 'numeric',
        month: isShort ? 'short' : 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    }

    return new Intl.DateTimeFormat('fr-FR', {
      timeZone: HAITI_TIMEZONE,
      day: 'numeric',
      month: isShort ? 'short' : 'long',
      year: 'numeric',
    }).format(d);
  } catch (e) {
    return String(date);
  }
}

/**
 * Formatage d'une date relative (ex: "Il y a 10 min", "Il y a 2 h", "Hier")
 */
export function formatRelativeTime(date: Date | string | number): string {
  try {
    const d = typeof date === 'object' ? date : new Date(date);
    if (isNaN(d.getTime())) return '';

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) {
      return "À l'instant";
    }
    if (diffMin < 60) {
      return `Il y a ${diffMin} min`;
    }
    if (diffHours < 24) {
      return `Il y a ${diffHours} h`;
    }
    if (diffDays === 1) {
      return 'Hier';
    }
    if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    }

    return formatArticleDate(d, { short: true });
  } catch {
    return formatArticleDate(date);
  }
}
