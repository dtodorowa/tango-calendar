<script lang="ts">
  import { getI18n } from '$lib/i18n/context';
  import type { Occurrence } from '$lib/types';
  import EmptyState from './EmptyState.svelte';
  import EventPreviewCard from './EventPreviewCard.svelte';
  import EventsMap, { type MapMarker } from './EventsMap.svelte';
  import MapListItem from './MapListItem.svelte';
  import { primaryStyle } from './category-style';

  type Props = { occurrences: Occurrence[] };
  let { occurrences }: Props = $props();

  const i18n = getI18n();

  type Selection = { eventId: string; start: string };
  let selection = $state<Selection | null>(null);

  // One pin per event series; the pin stands for its earliest occurrence in view.
  const firstByEvent = $derived.by(() => {
    const first = new Map<string, Occurrence>();
    for (const occurrence of occurrences) {
      if (!first.has(occurrence.eventId)) first.set(occurrence.eventId, occurrence);
    }
    return first;
  });

  const markers = $derived<MapMarker[]>(
    [...firstByEvent.values()].map((occurrence) => ({
      id: occurrence.eventId,
      lat: occurrence.venue.lat,
      lng: occurrence.venue.lng,
      label: occurrence.title[i18n.locale],
      dotClass: primaryStyle(occurrence.categories).dot
    }))
  );

  const selected = $derived.by(() => {
    if (!selection) return null;
    const { eventId, start } = selection;
    return (
      occurrences.find((o) => o.eventId === eventId && o.start === start) ??
      firstByEvent.get(eventId) ??
      null
    );
  });

  const otherDates = $derived(
    selected
      ? occurrences
          .filter((o) => o.eventId === selected.eventId && o.start !== selected.start)
          .map((o) => o.dateKey)
      : []
  );

  function selectEvent(eventId: string) {
    const first = firstByEvent.get(eventId);
    if (first) selection = { eventId, start: first.start };
  }
</script>

<div
  class="grid h-[calc(100dvh-15.5rem)] min-h-[26rem] gap-3 lg:h-auto lg:min-h-[32rem] lg:flex-1 lg:grid-cols-[22rem_minmax(0,1fr)]"
>
  <div class="hidden min-h-0 flex-col gap-2 lg:flex">
    <p class="text-sm text-muted-foreground">{i18n.t.eventCount(occurrences.length)}</p>
    <ul class="-mr-2 flex min-h-0 flex-col gap-2 overflow-y-auto pr-2 pb-2">
      {#each occurrences as occurrence (occurrence.eventId + occurrence.start)}
        <li>
          <MapListItem
            {occurrence}
            selected={selection?.eventId === occurrence.eventId &&
              selection.start === occurrence.start}
            onSelect={() => (selection = { eventId: occurrence.eventId, start: occurrence.start })}
          />
        </li>
      {:else}
        <li><EmptyState /></li>
      {/each}
    </ul>
  </div>

  <div class="surface relative isolate min-h-0 overflow-hidden">
    <EventsMap {markers} selectedId={selected?.eventId ?? null} onSelect={selectEvent} />

    {#if selected}
      <EventPreviewCard
        occurrence={selected}
        {otherDates}
        onClose={() => (selection = null)}
        class="absolute inset-x-2 bottom-2 z-[1000] max-h-[70%] overflow-y-auto lg:inset-x-auto lg:top-3 lg:right-14 lg:bottom-auto lg:w-80"
      />
    {:else if occurrences.length}
      <!-- Mobile: swipeable peek of the events; tapping one selects its pin. -->
      <ul
        class="absolute inset-x-0 bottom-2 z-[1000] flex snap-x snap-mandatory [scrollbar-width:none] gap-2 overflow-x-auto px-2 lg:hidden"
      >
        {#each occurrences as occurrence (occurrence.eventId + occurrence.start)}
          <li class="w-[85%] max-w-sm shrink-0 snap-center">
            <MapListItem
              {occurrence}
              selected={false}
              onSelect={() =>
                (selection = { eventId: occurrence.eventId, start: occurrence.start })}
              class="shadow-lg"
            />
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>
