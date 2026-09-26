import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { blankEventValues } from '$lib/event-form';
import { saveEventAction } from '$lib/server/event-actions';
import { listVenues } from '$lib/server/organizer';
import { addDays, localDateKey } from '$lib/time';

export const load: PageServerLoad = async ({ locals, parent }) => {
  const { configured, memberships } = await parent();
  if (!configured || !locals.supabase) return { venues: [], values: null };
  if (memberships.length === 0) redirect(303, '/dashboard');

  const orgIds = memberships.map((membership) => membership.organization.id);
  const venues = await listVenues(locals.supabase, orgIds);
  const values = blankEventValues(orgIds[0], locals.locale, addDays(localDateKey(new Date()), 7));
  if (venues.some((venue) => venue.orgId === orgIds[0])) {
    values.venueMode = 'saved';
    values.venueId = venues.find((venue) => venue.orgId === orgIds[0])!.id;
  }
  return { venues, values };
};

export const actions: Actions = {
  default: (event) => saveEventAction(event, null)
};
