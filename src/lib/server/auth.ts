import { error, redirect } from '@sveltejs/kit';
import type { User } from '@supabase/supabase-js';
import { listMemberships, type Membership } from './organizer';
import type { AppSupabaseClient } from './supabase';

export interface OrganizerContext {
  client: AppSupabaseClient;
  user: User;
  memberships: Membership[];
  orgIds: string[];
}

/**
 * For form actions, which don't get layout data: signed in, Supabase configured,
 * and the caller's memberships. RLS still guards every write; the org list only
 * gives friendlier errors.
 */
export async function requireOrganizer(locals: App.Locals, url: URL): Promise<OrganizerContext> {
  if (!locals.supabase) error(503, 'Supabase is not configured');
  const user = await locals.getUser();
  if (!user) redirect(303, `/login?next=${encodeURIComponent(url.pathname)}`);
  const memberships = await listMemberships(locals.supabase, user.id);
  return {
    client: locals.supabase,
    user,
    memberships,
    orgIds: memberships.map((membership) => membership.organization.id)
  };
}
