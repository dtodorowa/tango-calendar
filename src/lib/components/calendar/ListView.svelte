<script lang="ts">
  import { formatLongDate } from '$lib/format';
  import { getI18n } from '$lib/i18n/context';
  import type { Occurrence } from '$lib/types';
  import DayStrip from './DayStrip.svelte';
  import EmptyState from './EmptyState.svelte';
  import EventRow from './EventRow.svelte';
  import { dayAnchorId, groupByDay } from './group';

  type Props = {
    occurrences: Occurrence[];
    stripDays: string[];
    todayKey: string;
  };
  let { occurrences, stripDays, todayKey }: Props = $props();

  const i18n = getI18n();
  const groups = $derived(groupByDay(occurrences));
  const daysWithEvents = $derived(new Set(groups.keys()));
</script>

<div class="flex flex-col gap-4">
  <DayStrip days={stripDays} {daysWithEvents} {todayKey} />

  {#if occurrences.length === 0}
    <EmptyState />
  {:else}
    <div class="flex flex-col gap-5 md:gap-3">
      {#each groups as [key, items] (key)}
        <section id={dayAnchorId(key)} class="flex scroll-mt-40 flex-col gap-2 md:gap-3">
          <h2
            class="sticky top-0 z-20 -mx-4 bg-background/95 px-4 py-1.5 text-sm font-semibold backdrop-blur md:sr-only"
          >
            {formatLongDate(key, i18n.locale)}
          </h2>
          {#each items as occurrence (occurrence.eventId + occurrence.start)}
            <EventRow {occurrence} />
          {/each}
        </section>
      {/each}
    </div>
    <p class="py-2 text-center text-sm text-muted-foreground">
      {i18n.t.eventCount(occurrences.length)}
    </p>
  {/if}
</div>
