<script lang="ts">
  import OccurrenceList from '$lib/components/OccurrenceList.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>tkRaum (demo consumer) · server-rendered from Wann-der</title>
</svelte:head>

<!-- "tkRaum"-flavoured wrapper. The events below are server-rendered from the
     Wann-der API, so they live in THIS page's HTML (host-domain SEO). -->
<main class="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12">
  <header class="border-b border-border pb-4">
    <p class="font-mono text-[0.75rem] tracking-widest text-muted-foreground uppercase">tkRaum</p>
    <h1 class="text-step4 font-semibold">Was bei uns läuft</h1>
    <p class="text-[0.85rem] text-muted-foreground">
      Server-rendered from <span class="font-mono">GET /api/events?org=tango-saar</span>. No iframe,
      so these events are indexable as tkRaum's own content.
    </p>
  </header>

  <OccurrenceList occurrences={data.occurrences} locale="de" />
</main>
