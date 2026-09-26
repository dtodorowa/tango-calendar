import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// POST only, so a prefetch or a stray link can't sign someone out.
export const POST: RequestHandler = async ({ locals }) => {
  await locals.supabase?.auth.signOut();
  redirect(303, '/');
};
