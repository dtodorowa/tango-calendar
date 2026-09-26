<script lang="ts">
  import { formatShortDate, formatTime } from '$lib/format';
  import { getI18n } from '$lib/i18n/context';
  import type { Occurrence } from '$lib/types';
  import { cn } from '$lib/utils';
  import EventThumb from './EventThumb.svelte';
  import PriceTag from './PriceTag.svelte';
  import { CATEGORY_STYLE } from './category-style';

  type Props = {
    occurrence: Occurrence;
    selected: boolean;
    onSelect: () => void;
    class?: string;
  };
  let { occurrence, selected, onSelect, class: className }: Props = $props();

  const i18n = getI18n();
  const locale = $derived(i18n.locale);
</script>

<button
  type="button"
  onclick={onSelect}
  aria-pressed={selected}
  class={cn(
    'surface flex w-full gap-3 p-2.5 text-left transition hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
    selected && 'border-primary ring-2 ring-primary/20',
    className
  )}
>
  <EventThumb
    categories={occurrence.categories}
    photo={occurrence.heroPhoto}
    iconSize={20}
    class="size-16 shrink-0 rounded-lg"
  />
  <span class="flex min-w-0 flex-1 flex-col gap-0.5">
    <span class="flex items-center gap-1.5 text-xs text-muted-foreground">
      {#each occurrence.categories as category (category)}
        <span class={['size-1.5 rounded-full', CATEGORY_STYLE[category].dot]}></span>
      {/each}
      {occurrence.categories.map((category) => i18n.t.categories[category]).join(' & ')}
    </span>
    <span class="truncate font-display font-medium">{occurrence.title[locale]}</span>
    <span class="text-xs text-muted-foreground">
      {formatShortDate(occurrence.dateKey, locale)} ·
      <span class="tabular-nums">{formatTime(occurrence.start, locale)}</span>
    </span>
    <span class="flex items-center justify-between gap-2">
      <span class="truncate text-xs">{occurrence.venue.name}, {occurrence.venue.city}</span>
      <PriceTag price={occurrence.price} size="sm" />
    </span>
  </span>
</button>
