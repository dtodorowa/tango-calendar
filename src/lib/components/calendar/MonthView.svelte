<script lang="ts">
  import { untrack } from 'svelte';
  import { formatLongDate, weekdayHeaders } from '$lib/format';
  import { getI18n } from '$lib/i18n/context';
  import type { GridDay } from '$lib/time';
  import { CATEGORIES, type Occurrence } from '$lib/types';
  import { cn } from '$lib/utils';
  import CategoryLegend from './CategoryLegend.svelte';
  import EmptyState from './EmptyState.svelte';
  import EventRow from './EventRow.svelte';
  import MonthEventChip from './MonthEventChip.svelte';
  import { primaryStyle } from './category-style';
  import { groupByDay } from './group';

  type Props = {
    weeks: GridDay[][];
    occurrences: Occurrence[];
    todayKey: string;
    /** Link to the list view showing only one day, for "+n more". */
    dayListHref: (dateKey: string) => string;
  };
  let { weeks, occurrences, todayKey, dayListHref }: Props = $props();

  const MAX_CHIPS = 3;

  const i18n = getI18n();
  const byDay = $derived(groupByDay(occurrences));
  const headers = $derived(weekdayHeaders(i18n.locale));

  function initialSelection(): string {
    const inMonth = weeks.flat().filter((day) => day.inMonth);
    if (inMonth.some((day) => day.key === todayKey)) return todayKey;
    return inMonth.find((day) => byDay.has(day.key))?.key ?? inMonth[0].key;
  }

  // Mobile only: which day's agenda shows under the compact grid.
  let selectedKey = $state(untrack(initialSelection));
  const selectedItems = $derived(byDay.get(selectedKey) ?? []);
</script>

<div class="flex flex-col gap-4">
  <CategoryLegend categories={CATEGORIES} class="hidden md:flex md:justify-end" />

  <div class="surface overflow-hidden">
    <div class="grid grid-cols-7 border-b bg-muted/40">
      {#each headers as header, index (index)}
        <div
          class="py-2 text-center text-[0.6875rem] font-medium text-muted-foreground uppercase md:text-xs"
        >
          {header}
        </div>
      {/each}
    </div>

    <div class="grid grid-cols-7">
      {#each weeks as week, weekIndex (weekIndex)}
        {#each week as day (day.key)}
          {@const items = byDay.get(day.key) ?? []}
          {@const isToday = day.key === todayKey}
          <div
            class={cn(
              'flex min-h-14 flex-col border-r border-b p-1 last:border-r-0 md:min-h-32 md:gap-1 md:p-1.5 [&:nth-child(7n)]:border-r-0',
              !day.inMonth && 'bg-muted/30'
            )}
          >
            <button
              type="button"
              aria-label={i18n.t.selectDay(formatLongDate(day.key, i18n.locale))}
              aria-pressed={selectedKey === day.key}
              onclick={() => (selectedKey = day.key)}
              class={cn(
                'mx-auto flex flex-col items-center gap-1 rounded-lg px-1 py-0.5 md:pointer-events-none md:mx-0 md:items-start',
                selectedKey === day.key && 'bg-primary-soft md:bg-transparent'
              )}
            >
              <span
                class={cn(
                  'grid size-7 place-items-center rounded-full text-sm tabular-nums',
                  !day.inMonth && 'text-muted-foreground/60',
                  isToday && 'bg-foreground font-semibold text-background'
                )}
              >
                {day.day}
              </span>
              <span class="flex h-1.5 gap-0.5 md:hidden">
                {#each items.slice(0, MAX_CHIPS) as occurrence (occurrence.eventId + occurrence.start)}
                  <span class={['size-1.5 rounded-full', primaryStyle(occurrence.categories).dot]}
                  ></span>
                {/each}
              </span>
            </button>

            <div class="hidden flex-col gap-1 md:flex">
              {#each items.slice(0, MAX_CHIPS) as occurrence (occurrence.eventId + occurrence.start)}
                <MonthEventChip {occurrence} />
              {/each}
              {#if items.length > MAX_CHIPS}
                <a
                  href={dayListHref(day.key)}
                  class="px-1 text-xs font-medium text-primary hover:underline"
                >
                  {i18n.t.moreEvents(items.length - MAX_CHIPS)}
                </a>
              {/if}
            </div>
          </div>
        {/each}
      {/each}
    </div>
  </div>

  <section class="flex flex-col gap-2 md:hidden" aria-live="polite">
    <h2 class="text-sm font-semibold">
      {i18n.t.eventsOnDay(formatLongDate(selectedKey, i18n.locale))}
    </h2>
    {#if selectedItems.length === 0}
      <EmptyState />
    {:else}
      {#each selectedItems as occurrence (occurrence.eventId + occurrence.start)}
        <EventRow {occurrence} />
      {/each}
    {/if}
  </section>
</div>
