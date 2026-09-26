<script lang="ts">
  import { formatTime } from '$lib/format';
  import { getI18n } from '$lib/i18n/context';
  import type { Occurrence } from '$lib/types';
  import EventThumb from './EventThumb.svelte';
  import PriceTag from './PriceTag.svelte';
  import { primaryStyle } from './category-style';
  import { eventHref } from './links';

  type Props = { occurrence: Occurrence };
  let { occurrence }: Props = $props();

  const i18n = getI18n();
  const style = $derived(primaryStyle(occurrence.categories));
</script>

<a
  href={eventHref(occurrence)}
  class={[
    'flex gap-2 rounded-lg p-1.5 text-left transition hover:brightness-[0.97] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
    style.surface
  ]}
>
  <EventThumb
    categories={occurrence.categories}
    photo={occurrence.heroPhoto}
    iconSize={16}
    class="hidden size-10 shrink-0 rounded-md bg-card/60 2xl:grid"
  />
  <span class="flex min-w-0 flex-1 flex-col gap-0.5">
    <span class="line-clamp-2 text-xs leading-tight font-semibold">
      {occurrence.title[i18n.locale]}
    </span>
    <span class="truncate text-[0.6875rem] text-foreground/70">
      <span class="tabular-nums">{formatTime(occurrence.start, i18n.locale)}</span>
      · {occurrence.venue.city}
    </span>
    <PriceTag price={occurrence.price} size="sm" class="self-end bg-card/70 px-1 text-[0.625rem]" />
  </span>
</a>
