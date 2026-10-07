import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { eventSource, listOccurrences, rollingWindow } from '$lib/server/data';
import { isOrganizerSlug } from '$lib/slug';

// Half a year ahead: long enough to show workshops and festivals announced early.
const UPCOMING_DAYS = 182;

export const load: PageServerLoad = async ({ params, locals, depends }) => {
  depends('app:organizer');

  if (!isOrganizerSlug(params.slug)) error(404, 'Organizer not found');
  const source = eventSource(locals);

  const [organization, upcoming] = await Promise.all([
    source.getOrganization(params.slug),
    listOccurrences(source, { ...rollingWindow(UPCOMING_DAYS), orgSlug: params.slug })
  ]);
  if (!organization) error(404, 'Organizer not found');

  return { organization, upcoming };
};
