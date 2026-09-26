<script lang="ts">
  import MapPin from '@lucide/svelte/icons/map-pin';
  import { formatTimeRange } from '$lib/format';
  import type { Locale, Occurrence } from '$lib/types';

  type Props = { occurrence: Occurrence; locale: Locale };
  let { occurrence, locale }: Props = $props();
</script>

<article class="flex gap-4 rounded-2xl border border-border bg-card p-4">
  <div class="flex flex-col gap-1">
    <span class="font-mono text-[0.8rem] text-muted-foreground">
      {formatTimeRange(occurrence.start, occurrence.end, locale)}
    </span>
    <h3 class="text-step1 font-semibold">{occurrence.title[locale]}</h3>
    <p class="text-step0 text-muted-foreground">{occurrence.description[locale]}</p>
    <p class="mt-1 flex items-center gap-1 text-[0.85rem] text-muted-foreground">
      <MapPin size={14} />
      {occurrence.venue.name}, {occurrence.venue.city}
    </p>
  </div>
  <span
    class="ml-auto h-fit rounded-full bg-primary-soft px-2 py-0.5 font-mono text-[0.7rem] text-primary uppercase"
  >
    {occurrence.categories.join(' · ')}
  </span>
</article>
