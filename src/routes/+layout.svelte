<script lang="ts">
  import '../app.css';
  import favicon from '$lib/assets/favicon.svg';
  import { setI18n } from '$lib/i18n/context';
  import { messages } from '$lib/i18n/messages';
  import type { LayoutProps } from './$types';

  let { data, children }: LayoutProps = $props();

  setI18n(() => data.locale);
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{#if data.demo}
  <p class="bg-sand px-4 py-2 text-center text-sm text-sand-foreground" role="note">
    {messages[data.locale].demoNotice}
  </p>
{/if}

{@render children()}
