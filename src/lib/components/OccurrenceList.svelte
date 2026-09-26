<script lang="ts">
  import EventCard from './EventCard.svelte';
  import { groupByDay } from './calendar/group';
  import { formatLongDate } from '$lib/format';
  import type { Locale, Occurrence } from '$lib/types';

  type Props = { occurrences: Occurrence[]; locale: Locale };
  let { occurrences, locale }: Props = $props();

  const groups = $derived(groupByDay(occurrences));
</script>

{#if occurrences.length === 0}
  <p class="text-muted-foreground">No upcoming events.</p>
{:else}
  <div class="flex flex-col gap-6">
    {#each groups as [key, items] (key)}
      <section>
        <h2 class="mb-2 font-mono text-[0.8rem] text-muted-foreground uppercase">
          {formatLongDate(key, locale)}
        </h2>
        <div class="flex flex-col gap-3">
          {#each items as occurrence (occurrence.eventId + occurrence.start)}
            <EventCard {occurrence} {locale} />
          {/each}
        </div>
      </section>
    {/each}
  </div>
{/if}
