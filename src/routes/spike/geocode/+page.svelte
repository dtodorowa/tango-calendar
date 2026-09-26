<script lang="ts">
  import VenueMap, { type MapPoint } from '$lib/components/VenueMap.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const points = $derived.by<MapPoint[]>(() =>
    data.result ? [{ lat: data.result.lat, lng: data.result.lng, label: data.result.display }] : []
  );
</script>

<svelte:head>
  <title>Geocode spike · Wann-der</title>
</svelte:head>

<main class="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12">
  <h1 class="text-step3 font-semibold">Geocode a venue address</h1>

  <form method="get" class="flex gap-2">
    <input
      name="q"
      value={data.query}
      placeholder="Nauwieserstraße, Saarbrücken"
      class="flex-1 rounded-full border border-border px-4 py-2"
    />
    <button class="rounded-full bg-primary px-4 py-2 text-white">Locate</button>
  </form>

  {#if data.query && !data.result}
    <p class="text-muted-foreground">No match for "{data.query}".</p>
  {/if}

  {#if data.result}
    <p class="text-[0.85rem] text-muted-foreground">
      {data.result.display}<br />
      <span class="font-mono">{data.result.lat.toFixed(5)}, {data.result.lng.toFixed(5)}</span>
    </p>
    <VenueMap {points} />
  {/if}
</main>
