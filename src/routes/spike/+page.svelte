<!--
  Spike checks from SPIKE.md, kept reachable while the real calendar lives at "/".
-->
<script lang="ts">
  const checks = [
    { href: '/', label: 'Public SSR calendar', note: 'check 1 · list, calendar, map' },
    {
      href: '/demo/embed-host',
      label: 'Iframe embed host',
      note: 'check 2 · auto-resizing iframe'
    },
    {
      href: '/demo/tkraum',
      label: 'Consumer site (SSR from API)',
      note: 'check 3 · host-domain SEO'
    },
    {
      href: '/api/events?org=tango-saar',
      label: 'Read API (JSON)',
      note: 'check 3 · the contract'
    },
    { href: '/feed.ics?org=tango-saar', label: '.ics feed', note: 'check 4 · RRULE + EXDATE' },
    {
      href: '/spike/geocode?q=Nauwieserstra%C3%9Fe%20Saarbr%C3%BCcken',
      label: 'Geocode + map',
      note: 'check 6 · needs network'
    }
  ];
</script>

<svelte:head>
  <title>Spike checks</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<main class="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6 py-16">
  <h1 class="font-display text-step3">Spike checks</h1>
  <ul class="flex flex-col gap-2">
    {#each checks as check (check.href)}
      <li>
        <a
          href={check.href}
          class="surface flex items-baseline justify-between px-4 py-3 hover:border-primary"
        >
          <span class="font-semibold">{check.label}</span>
          <span class="font-mono text-[0.75rem] text-muted-foreground">{check.note}</span>
        </a>
      </li>
    {/each}
  </ul>
</main>
