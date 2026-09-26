<script lang="ts">
  import CalendarDays from '@lucide/svelte/icons/calendar-days';
  import Clock from '@lucide/svelte/icons/clock';
  import Globe from '@lucide/svelte/icons/globe';
  import MapPin from '@lucide/svelte/icons/map-pin';
  import Users from '@lucide/svelte/icons/users';
  import X from '@lucide/svelte/icons/x';
  import { Button } from '$lib/components/ui/button';
  import { formatShortDate, formatTimeRange } from '$lib/format';
  import { getI18n } from '$lib/i18n/context';
  import type { Occurrence } from '$lib/types';
  import { cn } from '$lib/utils';
  import CategoryBadges from './CategoryBadges.svelte';
  import EventThumb from './EventThumb.svelte';
  import PriceTag from './PriceTag.svelte';
  import { eventHref, websiteLabel } from './links';

  type Props = {
    occurrence: Occurrence;
    /** Other dates of the same event in the current view. */
    otherDates: string[];
    onClose: () => void;
    class?: string;
  };
  let { occurrence, otherDates, onClose, class: className }: Props = $props();

  const i18n = getI18n();
  const locale = $derived(i18n.locale);
</script>

<article class={cn('surface flex flex-col gap-3 p-3 shadow-xl', className)}>
  <div class="flex gap-3">
    <EventThumb
      categories={occurrence.categories}
      photo={occurrence.heroPhoto}
      class="size-20 shrink-0 rounded-lg"
    />
    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <CategoryBadges categories={occurrence.categories} />
      <h3 class="font-display text-step1 leading-tight">{occurrence.title[locale]}</h3>
      <p class="flex items-center gap-1.5 text-sm text-muted-foreground">
        <CalendarDays size={14} class="shrink-0" />
        {formatShortDate(occurrence.dateKey, locale)}
      </p>
    </div>
    <Button variant="ghost" size="icon-sm" onclick={onClose} aria-label={i18n.t.close}>
      <X />
    </Button>
  </div>

  <ul class="flex flex-col gap-1.5 border-t pt-3 text-sm">
    <li class="flex items-start gap-2">
      <MapPin size={15} class="mt-0.5 shrink-0 text-muted-foreground" />
      <span>
        <span class="font-medium">{occurrence.venue.name}</span><br />
        <span class="text-muted-foreground">{occurrence.venue.address}</span>
      </span>
    </li>
    <li class="flex items-center gap-2">
      <Clock size={15} class="shrink-0 text-muted-foreground" />
      <span class="tabular-nums">{formatTimeRange(occurrence.start, occurrence.end, locale)}</span>
      <PriceTag price={occurrence.price} size="sm" class="ml-auto" />
    </li>
    <li class="flex items-center gap-2">
      <Users size={15} class="shrink-0 text-muted-foreground" />
      {occurrence.org.name}
    </li>
    {#if occurrence.org.website}
      <li class="flex items-center gap-2">
        <Globe size={15} class="shrink-0 text-muted-foreground" />
        <a
          href={occurrence.org.website}
          target="_blank"
          rel="noopener"
          class="truncate text-primary hover:underline"
        >
          {websiteLabel(occurrence.org.website)}
        </a>
      </li>
    {/if}
    {#if otherDates.length}
      <li class="text-xs text-muted-foreground">
        {i18n.t.alsoOn}
        {otherDates.map((key) => formatShortDate(key, locale)).join(', ')}
      </li>
    {/if}
  </ul>

  <Button href={eventHref(occurrence)} class="h-10 w-full">{i18n.t.viewDetails}</Button>
</article>
