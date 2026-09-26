<script lang="ts">
  import { onMount } from 'svelte';
  import OccurrenceList from '$lib/components/OccurrenceList.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  // Auto-height handshake: report our content height to the host so it can size the
  // iframe. The host listens for `wannder:embed:height`. See /demo/embed-host.
  onMount(() => {
    const post = () => {
      const height = document.documentElement.scrollHeight;
      parent.postMessage({ type: 'wannder:embed:height', height }, '*');
    };
    post();
    const observer = new ResizeObserver(post);
    observer.observe(document.documentElement);
    return () => observer.disconnect();
  });
</script>

<svelte:head>
  <title>Wann-der embed</title>
</svelte:head>

<!-- Sealed, self-contained embed surface: never depends on host CSS. -->
<div class="bg-background p-4 font-sans text-foreground">
  <p class="mb-3 font-mono text-[0.7rem] tracking-wide text-primary uppercase">
    Wann-der · {data.view}
  </p>
  <OccurrenceList occurrences={data.occurrences} locale={data.locale} />
</div>
