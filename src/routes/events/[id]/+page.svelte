<script lang="ts">
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';
  import CalendarPlus from '@lucide/svelte/icons/calendar-plus';
  import ExternalLink from '@lucide/svelte/icons/external-link';
  import Globe from '@lucide/svelte/icons/globe';
  import Mail from '@lucide/svelte/icons/mail';
  import MapPin from '@lucide/svelte/icons/map-pin';
  import Phone from '@lucide/svelte/icons/phone';
  import { page } from '$app/state';
  import CategoryBadges from '$lib/components/calendar/CategoryBadges.svelte';
  import EventThumb from '$lib/components/calendar/EventThumb.svelte';
  import EventsMap from '$lib/components/calendar/EventsMap.svelte';
  import PriceTag from '$lib/components/calendar/PriceTag.svelte';
  import { primaryStyle } from '$lib/components/calendar/category-style';
  import { eventHref, osmHref, websiteLabel } from '$lib/components/calendar/links';
  import AppHeader from '$lib/components/layout/AppHeader.svelte';
  import SocialLinks from '$lib/components/social/SocialLinks.svelte';
  import { Button } from '$lib/components/ui/button';
  import { formatLongDate, formatShortDate, formatTimeRange } from '$lib/format';
  import { getI18n } from '$lib/i18n/context';
  import { SITE } from '$lib/site';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  const i18n = getI18n();
  const locale = $derived(i18n.locale);
  const event = $derived(data.event);
  const org = $derived(event.org);
  const venue = $derived(event.venue);
  const title = $derived(event.title[locale]);
  const description = $derived(event.description[locale]);

  const pageTitle = $derived(`${title} · ${SITE.fullName}`);
  const canonical = $derived(`${page.url.origin}/events/${event.id}`);

  // schema.org Event for rich results. `<` is escaped so the JSON can't close the tag.
  const jsonLd = $derived(
    data.selected
      ? JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: title,
          description: description || undefined,
          startDate: data.selected.start,
          endDate: data.selected.end,
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          eventStatus: 'https://schema.org/EventScheduled',
          location: {
            '@type': 'Place',
            name: venue.name,
            address: venue.address,
            geo: { '@type': 'GeoCoordinates', latitude: venue.lat, longitude: venue.lng }
          },
          organizer: {
            '@type': 'Organization',
            name: org.name,
            url: org.website ?? undefined,
            sameAs: org.socialLinks?.length ? org.socialLinks : undefined
          },
          offers:
            event.price.kind === 'fixed'
              ? { '@type': 'Offer', price: event.price.amount, priceCurrency: 'EUR' }
              : undefined
        }).replace(/</g, '\\u003c')
      : null
  );
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={description || i18n.t.siteDescription} />
  <link rel="canonical" href={canonical} />
  <meta property="og:title" content={title} />
  <meta property="og:type" content="event" />
  <meta property="og:url" content={canonical} />
  {#if jsonLd}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html `<script type="application/ld+json">${jsonLd}</script>`}
  {/if}
</svelte:head>

<AppHeader />

<main class="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-5 lg:px-6 lg:py-8">
  <a
    href="/"
    class="flex items-center gap-1.5 self-start text-sm text-muted-foreground hover:text-foreground"
  >
    <ArrowLeft size={16} />
    {i18n.t.backToCalendar}
  </a>

  <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
    <article class="flex flex-col gap-5">
      <EventThumb
        categories={event.categories}
        photo={event.heroPhoto}
        alt={title}
        iconSize={56}
        class="aspect-[2/1] w-full rounded-2xl"
      />

      <header class="flex flex-col gap-2">
        <CategoryBadges categories={event.categories} />
        <h1 class="font-display text-step3 leading-tight lg:text-step4">{title}</h1>
        {#if data.selected}
          <p class="text-step1 text-muted-foreground capitalize">
            {formatLongDate(data.selected.dateKey, locale)} ·
            <span class="tabular-nums">
              {formatTimeRange(data.selected.start, data.selected.end, locale)}
            </span>
          </p>
        {/if}
        <div class="flex flex-wrap items-center gap-2 pt-1">
          <PriceTag price={event.price} />
          {#if event.note}
            <span class="rounded-md bg-muted px-2.5 py-1 text-sm text-muted-foreground">
              {event.note[locale]}
            </span>
          {/if}
          {#each event.tags as tag (tag)}
            <span class="rounded-md border px-2.5 py-1 text-sm">{i18n.t.tags[tag]}</span>
          {/each}
        </div>
      </header>

      {#if description}
        <p class="max-w-prose text-step0 leading-relaxed whitespace-pre-line">{description}</p>
      {/if}

      <section class="flex flex-col gap-3">
        <h2 class="font-display text-step1">{i18n.t.upcomingDates}</h2>
        {#if data.upcoming.length === 0}
          <p class="text-sm text-muted-foreground">{i18n.t.noUpcomingDates}</p>
        {:else}
          <ul class="flex flex-wrap gap-2">
            {#each data.upcoming as occurrence (occurrence.start)}
              {@const isSelected = occurrence.start === data.selected?.start}
              <li>
                <a
                  href={eventHref(occurrence)}
                  data-sveltekit-noscroll
                  data-sveltekit-replacestate
                  aria-current={isSelected ? 'date' : undefined}
                  class={['chip', isSelected && ['ring-2', primaryStyle(event.categories).ring]]}
                >
                  {formatShortDate(occurrence.dateKey, locale)}
                </a>
              </li>
            {/each}
          </ul>
        {/if}
      </section>
    </article>

    <aside class="flex flex-col gap-4">
      <section class="surface flex flex-col gap-3 p-4">
        <h2 class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {i18n.t.venue}
        </h2>
        <p class="flex items-start gap-2 text-sm">
          <MapPin size={16} class="mt-0.5 shrink-0 text-muted-foreground" />
          <span>
            <span class="font-medium">{venue.name}</span><br />
            {venue.address}
          </span>
        </p>
        <div class="h-44 overflow-hidden rounded-lg border">
          <EventsMap
            markers={[
              {
                id: event.id,
                lat: venue.lat,
                lng: venue.lng,
                label: venue.name,
                dotClass: primaryStyle(event.categories).dot
              }
            ]}
            selectedId={null}
            onSelect={() => {}}
          />
        </div>
        <a
          href={osmHref(venue.lat, venue.lng)}
          target="_blank"
          rel="noopener"
          class="flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ExternalLink size={14} />
          {i18n.t.openInMap}
        </a>
      </section>

      <section class="surface flex flex-col gap-2 p-4 text-sm">
        <h2 class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {i18n.t.organizer}
        </h2>
        <p class="font-medium">{org.name}</p>
        {#if org.phone}
          <a
            href="tel:{org.phone.replace(/\s/g, '')}"
            class="flex items-center gap-2 hover:text-primary"
          >
            <Phone size={15} class="text-muted-foreground" />
            {org.phone}
          </a>
        {/if}
        {#if org.email}
          <a href="mailto:{org.email}" class="flex items-center gap-2 break-all hover:text-primary">
            <Mail size={15} class="shrink-0 text-muted-foreground" />
            {org.email}
          </a>
        {/if}
        {#if org.website}
          <a
            href={org.website}
            target="_blank"
            rel="noopener"
            class="flex items-center gap-2 hover:text-primary"
          >
            <Globe size={15} class="text-muted-foreground" />
            {websiteLabel(org.website)}
          </a>
        {/if}
        {#if org.socialLinks?.length}
          <SocialLinks links={org.socialLinks} class="pt-1" />
        {/if}
      </section>

      <Button
        href="/feed.ics?event={encodeURIComponent(event.id)}&lang={locale}"
        variant="outline"
        class="h-10 gap-2 bg-card"
      >
        <CalendarPlus />
        {i18n.t.addToCalendar}
      </Button>
    </aside>
  </div>
</main>
