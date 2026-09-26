import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireOrganizer } from '$lib/server/auth';
import { readOrganizerForm } from '$lib/server/forms';
import { updateOrganization } from '$lib/server/organizer';

export const load: PageServerLoad = async ({ params, parent }) => {
  const { memberships } = await parent();
  const membership = memberships.find((m) => m.organization.id === params.id);
  if (!membership) error(404, 'Organizer not found');
  return { organization: membership.organization };
};

export const actions: Actions = {
  default: async ({ request, locals, params, url }) => {
    const { client, orgIds } = await requireOrganizer(locals, url);
    if (!orgIds.includes(params.id)) error(404, 'Organizer not found');
    const result = await readOrganizerForm(request);
    if (!result.ok) return fail(400, result);
    try {
      await updateOrganization(client, params.id, result.input);
    } catch {
      return fail(500, {
        ok: false as const,
        values: result.values,
        errors: {},
        formError: 'generic' as const
      });
    }
    redirect(303, '/dashboard');
  }
};
