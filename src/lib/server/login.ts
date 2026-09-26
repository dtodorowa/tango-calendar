// Shared by both ways of finishing a sign-in: the code form on /login and the
// email link on /auth/confirm.
import type { User } from '@supabase/supabase-js';
import type { Locale } from '$lib/types';
import type { AppSupabaseClient } from './supabase';

/** Where to go after the email link, set by the login form that sent it. */
export const NEXT_COOKIE = 'login_next';

/**
 * Remember the language for the next sign-in email. Best effort: a failure here
 * only means the next email falls back to the previous locale.
 */
export async function updateLocale(
  client: AppSupabaseClient,
  user: User | null | undefined,
  locale: Locale
): Promise<void> {
  if (user && user.user_metadata.locale !== locale) {
    await client.auth.updateUser({ data: { locale } });
  }
}
