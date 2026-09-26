<script lang="ts">
  import { onMount } from 'svelte';

  // Demonstrates the no-code embed: an iframe pointed at /embed that auto-resizes
  // from the postMessage height handshake. This page stands in for a WordPress/CMS host.
  let frame: HTMLIFrameElement;
  let height = $state(300);

  onMount(() => {
    const onMessage = (event: MessageEvent) => {
      const payload = event.data;
      if (
        payload &&
        payload.type === 'wannder:embed:height' &&
        typeof payload.height === 'number'
      ) {
        height = payload.height;
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  });
</script>

<svelte:head>
  <title>Embed host demo · Wann-der</title>
</svelte:head>

<main class="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-12">
  <h1 class="text-step3 font-semibold">Pretend host page</h1>
  <p class="text-[0.9rem] text-muted-foreground">
    The box below is an <span class="font-mono">&lt;iframe src="/embed?org=tango-saar"&gt;</span>.
    It resizes itself to its content via postMessage (current: {height}px).
  </p>
  <iframe
    bind:this={frame}
    src="/embed?org=tango-saar"
    title="Wann-der embed"
    class="w-full rounded-2xl border border-border"
    style="height: {height}px"
  ></iframe>
</main>
