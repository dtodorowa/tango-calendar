// Runtime env access (dynamic, so a missing .env never breaks the build).
import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

export const supabaseUrl = publicEnv.PUBLIC_SUPABASE_URL ?? '';
export const supabaseAnonKey = publicEnv.PUBLIC_SUPABASE_ANON_KEY ?? '';
export const supabaseServiceKey = privateEnv.SUPABASE_SERVICE_ROLE_KEY ?? '';

/** True once a real Supabase project is wired up; until then the spike uses fixtures. */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
