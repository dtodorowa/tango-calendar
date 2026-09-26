// The save path shared by "new event" and "edit event".
import { fail, redirect, type RequestEvent } from '@sveltejs/kit';
import { buildSchedule, readEventForm, type EventFormValues } from '$lib/event-form';
import type { ErrorCode } from '$lib/i18n/dashboard';
import { LOCALES } from '$lib/types';
import { eventSchema, toFieldErrors, type EventInput, type FieldErrors } from '$lib/validation';
import { requireOrganizer } from './auth';
import { geocode } from './geocode';
import { createVenue, getEditableEvent, listVenues, saveEvent } from './organizer';

export interface EventFormFailure {
  values: EventFormValues;
  errors: FieldErrors;
  formError?: ErrorCode;
}

function failure(
  status: number,
  values: EventFormValues,
  errors: FieldErrors,
  formError?: ErrorCode
) {
  return fail(status, { values, errors, formError } satisfies EventFormFailure);
}

function translationsOf(input: EventInput) {
  return LOCALES.flatMap((locale) => {
    const { title, description, note } = input.translations[locale];
    return title ? [{ locale, title, description: description ?? '', note: note ?? '' }] : [];
  });
}

export async function saveEventAction(event: RequestEvent, eventId: string | null) {
  const { client, orgIds } = await requireOrganizer(event.locals, event.url);
  const values = readEventForm(await event.request.formData());

  const parsed = eventSchema.safeParse(values);
  if (!parsed.success) return failure(400, values, toFieldErrors(parsed.error));
  const input = parsed.data;
  if (!orgIds.includes(input.orgId)) return failure(403, values, {}, 'generic');

  let existingRrule: string | null = null;
  if (eventId) {
    const existing = await getEditableEvent(client, eventId, orgIds);
    if (!existing) return failure(404, values, {}, 'generic');
    existingRrule = existing.entry.series.rrule;
  }

  const scheduled = buildSchedule(input, existingRrule);
  if ('error' in scheduled) return failure(400, values, { [scheduled.field]: scheduled.error });

  let venueId = input.venueId;
  if (input.venueMode === 'new') {
    const found = await geocode(
      `${input.venueAddress}, ${input.venueCity}`,
      event.fetch,
      input.venueCountry
    );
    if (!found) return failure(400, values, { venueAddress: 'addressNotFound' });
    venueId = await createVenue(client, {
      orgId: input.orgId,
      name: input.venueName,
      address: `${input.venueAddress}, ${input.venueCity}`,
      city: input.venueCity,
      country: input.venueCountry,
      lat: found.lat,
      lng: found.lng
    });
  } else {
    const venues = await listVenues(client, [input.orgId]);
    if (!venues.some((venue) => venue.id === venueId)) {
      return failure(400, values, { venueId: 'required' });
    }
  }

  let savedId: string;
  try {
    savedId = await saveEvent(client, eventId, {
      orgId: input.orgId,
      venueId,
      categories: input.categories,
      tags: input.tags,
      status: input.publish ? 'published' : 'draft',
      rrule: scheduled.schedule.rrule,
      dtstartLocal: scheduled.schedule.dtstartLocal,
      durationMinutes: scheduled.schedule.durationMinutes,
      priceKind: input.priceKind,
      priceAmount: input.priceKind === 'fixed' ? input.priceAmount : null,
      sourceLang: input.sourceLang,
      translations: translationsOf(input)
    });
  } catch {
    return failure(500, values, {}, 'generic');
  }

  redirect(303, `/dashboard/events/${savedId}?saved=1`);
}
