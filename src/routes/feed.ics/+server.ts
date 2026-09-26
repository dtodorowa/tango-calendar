import type { RequestHandler } from './$types';
import { buildIcsFeed, type IcsEventInput } from '$lib/ics';
import { eventSource } from '$lib/server/data';
import { DEFAULT_LOCALE, isLocale } from '$lib/types';

// The .ics feed: subscribe to everything, one organizer (?org=slug) or add a
// single event (?event=id). Recurrence travels as RRULE, cancellations as EXDATE.
export const GET: RequestHandler = async ({ url, locals }) => {
  const langParam = url.searchParams.get('lang');
  const locale = isLocale(langParam) ? langParam : DEFAULT_LOCALE;
  const orgSlug = url.searchParams.get('org') ?? undefined;
  const eventId = url.searchParams.get('event');

  const inputs: IcsEventInput[] = (await eventSource(locals).listPublishedSeries(orgSlug))
    .filter(({ series }) => !eventId || series.id === eventId)
    .map(({ series, venue, overrides }) => ({
      series,
      overrides,
      venueLabel: `${venue.name}, ${venue.address}`,
      locale
    }));

  const filename = eventId ? `${eventId}.ics` : 'saarlorlux-tango.ics';
  return new Response(buildIcsFeed(inputs, new Date()), {
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': `inline; filename="${filename.replace(/[^\w.-]/g, '')}"`,
      'access-control-allow-origin': '*'
    }
  });
};
