<script lang="ts">
  import '../app.css';
  import favicon from '$lib/assets/favicon.svg';
  import { setI18n } from '$lib/i18n/context';
  import type { LayoutProps } from './$types';

  let { data, children }: LayoutProps = $props();

  setI18n(() => data.locale);
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
