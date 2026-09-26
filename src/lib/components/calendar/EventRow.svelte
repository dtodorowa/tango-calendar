<script lang="ts">
  import Globe from '@lucide/svelte/icons/globe';
  import Mail from '@lucide/svelte/icons/mail';
  import MapPin from '@lucide/svelte/icons/map-pin';
  import Phone from '@lucide/svelte/icons/phone';
  import { formatMonthShort, formatTime, formatTimeRange, formatWeekdayShort } from '$lib/format';
  import { getI18n } from '$lib/i18n/context';
  import type { Occurrence } from '$lib/types';
  import CategoryBadges from './CategoryBadges.svelte';
  import EventThumb from './EventThumb.svelte';
  import PriceTag from './PriceTag.svelte';
  import { eventHref, websiteLabel } from './links';

  type Props = { occurrence: Occurrence };
  let { occurrence }: Props = $props();

  const i18n = getI18n();
  const locale = $derived(i18n.locale);
  const org = $derived(occurrence.org);
</script>

<article
  class="surface group relative flex gap-3 p-2.5 transition-shadow hover:shadow-md md:grid md:grid-cols-[4rem_9rem_minmax(0,1fr)_6rem] md:items-center md:gap-5 md:p-3 xl:grid-cols-[4rem_9rem_minmax(0,1fr)_15rem_6rem]"
>
  <div class="hidden flex-col items-center text-center md:flex" aria-hidden="true">
    <span class="text-[0.6875rem] font-medium text-muted-foreground uppercase">
      {formatWeekdayShort(occurrence.dateKey, locale)}
    </span>
    <span class="font-display text-step2 leading-none">{occurrence.dateKey.slice(8)}</span>
    <span class="text-[0.6875rem] font-medium text-muted-foreground uppercase">
      {formatMonthShort(occurrence.dateKey, locale)}
    </span>
    <span class="mt-1 text-xs tabular-nums">{formatTime(occurrence.start, locale)}</span>
  </div>

  <EventThumb
    categories={occurrence.categories}
    photo={occurrence.heroPhoto}
    class="size-20 shrink-0 rounded-lg md:h-24 md:w-36"
  />

  <div class="flex min-w-0 flex-1 flex-col gap-1">
    <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span class="text-xs text-muted-foreground tabular-nums md:hidden">
        {formatTimeRange(occurrence.start, occurrence.end, locale)}
      </span>
      <CategoryBadges categories={occurrence.categories} class="md:order-2" />
      <h3
        class="w-full font-display text-[1.0625rem] leading-snug font-medium md:order-1 md:w-auto"
      >
        <a
          href={eventHref(occurrence)}
          class="after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none after:focus-visible:ring-3 after:focus-visible:ring-ring/50"
        >
          {occurrence.title[locale]}
        </a>
      </h3>
    </div>
    <p class="truncate text-sm font-medium">
      {occurrence.venue.name}<span class="text-muted-foreground md:hidden"
        >{` · ${occurrence.venue.city}`}</span
      >
    </p>
    <p class="hidden items-center gap-1 truncate text-sm text-muted-foreground md:flex">
      <MapPin size={14} class="shrink-0" />
      {occurrence.venue.address}
    </p>
    <div class="flex flex-wrap items-center gap-1.5">
      <PriceTag price={occurrence.price} size="sm" class="md:hidden" />
      {#if occurrence.note}
        <span class="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
          {occurrence.note[locale]}
        </span>
      {/if}
    </div>
  </div>

  <dl class="relative z-10 hidden min-w-0 flex-col gap-0.5 text-sm xl:flex">
    <dt class="sr-only">{i18n.t.organizer}</dt>
    <dd class="truncate font-medium">{org.name}</dd>
    {#if org.phone}
      <dt class="sr-only">{i18n.t.contactPhone}</dt>
      <dd class="flex items-center gap-1.5 truncate text-muted-foreground">
        <Phone size={13} class="shrink-0" />
        <a href="tel:{org.phone.replace(/\s/g, '')}" class="hover:text-foreground">{org.phone}</a>
      </dd>
    {/if}
    {#if org.email}
      <dt class="sr-only">{i18n.t.contactEmail}</dt>
      <dd class="flex items-center gap-1.5 truncate text-muted-foreground">
        <Mail size={13} class="shrink-0" />
        <a href="mailto:{org.email}" class="truncate hover:text-foreground">{org.email}</a>
      </dd>
    {/if}
    {#if org.website}
      <dt class="sr-only">{i18n.t.contactWebsite}</dt>
      <dd class="flex items-center gap-1.5 truncate text-muted-foreground">
        <Globe size={13} class="shrink-0" />
        <a href={org.website} rel="noopener" target="_blank" class="truncate hover:text-foreground">
          {websiteLabel(org.website)}
        </a>
      </dd>
    {/if}
  </dl>

  <PriceTag price={occurrence.price} class="hidden justify-self-end md:inline-flex" />
</article>
