import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { listMemberships } from '$lib/server/organizer';

export const load: LayoutServerLoad = async ({ locals, url, depends }) => {
  depends('app:dashboard');
  if (!locals.supabase) return { configured: false as const, memberships: [], userEmail: null };

  const user = await locals.getUser();
  if (!user) redirect(303, `/login?next=${encodeURIComponent(url.pathname + url.search)}`);

  return {
    configured: true as const,
    memberships: await listMemberships(locals.supabase, user.id),
    userEmail: user.email ?? null
  };
};
