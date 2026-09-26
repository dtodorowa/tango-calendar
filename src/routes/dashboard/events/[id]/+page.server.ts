import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { expandSeries } from '$lib/recurrence';
import { requireOrganizer } from '$lib/server/auth';
import { saveEventAction } from '$lib/server/event-actions';
import { removeImage } from '$lib/server/media';
import {
  cancelOccurrence,
  deleteEvent,
  getEditableEvent,
  listVenues,
  restoreOccurrence
} from '$lib/server/organizer';
import { addDays, localDateKey } from '$lib/time';

const UPCOMING_DAYS = 84;
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

export const load: PageServerLoad = async ({ locals, params, parent, url, depends }) => {
  depends('app:dashboard-event');
  const { configured, memberships } = await parent();
  if (!configured || !locals.supabase) error(503, 'Supabase is not configured');

  const orgIds = memberships.map((membership) => membership.organization.id);
  const [editable, venues] = await Promise.all([
    getEditableEvent(locals.supabase, params.id, orgIds),
    listVenues(locals.supabase, orgIds)
  ]);
  if (!editable) error(404, 'Event not found');

  // Expand with only the "moved" overrides so cancelled dates still show up here,
  // flagged, and can be restored.
  const { series, overrides } = editable.entry;
  const todayKey = localDateKey(new Date());
  const cancelled = new Set(overrides.filter((o) => o.status === 'cancelled').map((o) => o.date));
  const dates = expandSeries(
    series,
    overrides.filter((o) => o.status === 'moved'),
    todayKey,
    addDays(todayKey, UPCOMING_DAYS)
  ).map((occurrence) => ({
    dateKey: occurrence.dateKey,
    start: occurrence.start.toISOString(),
    cancelled: cancelled.has(occurrence.dateKey)
  }));

  return {
    eventId: series.id,
    status: series.status,
    values: editable.values,
    photo: series.heroPhoto ?? null,
    venues,
    dates,
    saved: url.searchParams.has('saved'),
    photoFailed: url.searchParams.has('photoFailed')
  };
};

async function overrideAction(
  event: Parameters<Actions[string]>[0],
  apply: typeof cancelOccurrence
) {
  const { client, orgIds } = await requireOrganizer(event.locals, event.url);
  const date = String((await event.request.formData()).get('date') ?? '');
  if (!DATE_KEY.test(date)) return fail(400, { overrideError: true });
  if (!(await getEditableEvent(client, event.params.id!, orgIds))) error(404, 'Event not found');
  await apply(client, event.params.id!, date);
  return { overrideDone: date };
}

export const actions: Actions = {
  save: (event) => saveEventAction(event, event.params.id),

  cancelDate: (event) => overrideAction(event, cancelOccurrence),
  restoreDate: (event) => overrideAction(event, restoreOccurrence),

  delete: async ({ locals, params, url }) => {
    const { client, orgIds } = await requireOrganizer(locals, url);
    const existing = await getEditableEvent(client, params.id, orgIds);
    if (!existing) error(404, 'Event not found');
    await deleteEvent(client, params.id);
    await removeImage(client, existing.heroPhotoKey, 'events');
    redirect(303, '/dashboard');
  }
};
