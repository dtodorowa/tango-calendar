import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireOrganizer } from '$lib/server/auth';
import { readOrganizerForm } from '$lib/server/forms';
import { finishImageChange, prepareImage, readImageChange } from '$lib/server/media';
import { createOrganization, listOrganizerEvents, updateOrganization } from '$lib/server/organizer';

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
    const form = await request.formData();
    const result = readOrganizerForm(form);
    if (!result.ok) return fail(400, result);
    let organizationId: string;
    try {
      organizationId = (await createOrganization(client, result.input)).id;
    } catch {
      return fail(500, {
        ok: false as const,
        values: result.values,
        errors: {},
        formError: 'generic' as const
      });
    }
    // The logo's folder is the org id, so it can only be stored once the org exists.
    // A failed logo doesn't undo the signup; it can be added from the profile page.
    const logo = await prepareImage(client, organizationId, 'logo', readImageChange(form, 'logo'));
    if (!('error' in logo) && logo.key) {
      try {
        await updateOrganization(client, organizationId, null, logo.key);
      } catch {
        await finishImageChange(client, 'logo', logo, null, false);
      }
    }
    redirect(303, '/dashboard/events/new');
  }
};
