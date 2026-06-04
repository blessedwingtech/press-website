export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD') // Supprimer les accents
    .replace(/[\u0300-\u036f]/g, '') // Nettoyer les diacritiques restants
    .replace(/[^a-z0-9 -]/g, '') // Supprimer les caractères spéciaux
    .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
    .replace(/-+/g, '-'); // Éviter les tirets doubles
}
