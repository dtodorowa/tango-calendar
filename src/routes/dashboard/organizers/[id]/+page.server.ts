import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireOrganizer } from '$lib/server/auth';
import { readOrganizerForm } from '$lib/server/forms';
import { finishImageChange, prepareImage, readImageChange } from '$lib/server/media';
import { getLogoKey, updateOrganization } from '$lib/server/organizer';

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
    const form = await request.formData();
    const result = readOrganizerForm(form);
    if (!result.ok) return fail(400, result);

    const logo = await prepareImage(client, params.id, 'logo', readImageChange(form, 'logo'));
    if ('error' in logo) {
      return fail(400, { ok: false as const, values: result.values, errors: { logo: logo.error } });
    }

    let saved = false;
    try {
      const previousLogo = await getLogoKey(client, params.id);
      await updateOrganization(client, params.id, result.input, logo.key);
      saved = true;
      await finishImageChange(client, 'logo', logo, previousLogo, true);
    } catch {
      if (!saved) await finishImageChange(client, 'logo', logo, null, false);
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
