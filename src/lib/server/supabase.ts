// Per-request Supabase client for SSR. Uses the anon key, so every query runs
// under RLS as the signed-in user (or anon). The service-role key is never used
// here; see AGENTS.md > Multi-tenant and RLS.
import { createServerClient } from '@supabase/ssr';
import type { Cookies } from '@sveltejs/kit';
import type { Database } from '$lib/database.types';
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from './env';

export type AppSupabaseClient = ReturnType<typeof createServerClient<Database>>;

export function createRequestClient(cookies: Cookies): AppSupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookies.getAll(),
      setAll: (toSet) => {
        for (const { name, value, options } of toSet) {
          cookies.set(name, value, { ...options, path: '/' });
        }
      }
    }
  });
}
