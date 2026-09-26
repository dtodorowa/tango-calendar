// See https://svelte.dev/docs/kit/types#app.d.ts
import type { User } from '@supabase/supabase-js';
import type { AppSupabaseClient } from '$lib/server/supabase';
import type { Locale } from '$lib/types';

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      locale: Locale;
      /** Null until Supabase env is configured; pages fall back to fixtures. */
      supabase: AppSupabaseClient | null;
      getUser: () => Promise<User | null>;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
