const ORGANIZER_SLUG = /^[a-z0-9-]{1,64}$/;

/** Guards untrusted input (URL params) before it reaches a query. */
export function isOrganizerSlug(value: string): boolean {
  return ORGANIZER_SLUG.test(value);
}

/** "Tangofreunde Saarbrücken e.V." -> "tangofreunde-saarbruecken-e-v" */
export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 56)
    .replace(/-+$/, '');
  return slug || 'organizer';
}
