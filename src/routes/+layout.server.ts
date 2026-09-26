import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
  // No database configured means the fixtures are showing; say so on every page.
  return { locale: locals.locale, demo: !locals.supabase };
};
