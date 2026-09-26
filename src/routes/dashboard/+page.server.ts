import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireOrganizer } from '$lib/server/auth';
import { readOrganizerForm } from '$lib/server/forms';
import { createOrganization, listOrganizerEvents } from '$lib/server/organizer';

export const load: PageServerLoad = async ({ locals, parent }) => {
  const { configured, memberships } = await parent();
  if (!configured || !locals.supabase) return { events: [] };

  const orgIds = memberships.map((membership) => membership.organization.id);
  const events = await listOrganizerEvents(locals.supabase, orgIds);
  return {
    events: events.map(({ entry, status }) => ({
      id: entry.series.id,
      status,
      title: entry.series.title,
      rrule: entry.series.rrule,
      firstDateKey: entry.series.dtstartLocal.slice(0, 10),
      categories: entry.series.categories,
      venue: `${entry.venue.name}, ${entry.venue.city}`,
      orgName: entry.org.name
    }))
  };
};

export const actions: Actions = {
  createOrganizer: async ({ request, locals, url }) => {
    const { client } = await requireOrganizer(locals, url);
    const result = await readOrganizerForm(request);
    if (!result.ok) return fail(400, result);
    try {
      await createOrganization(client, result.input);
    } catch {
      return fail(500, {
        ok: false as const,
        values: result.values,
        errors: {},
        formError: 'generic' as const
      });
    }
    redirect(303, '/dashboard/events/new');
  }
};
