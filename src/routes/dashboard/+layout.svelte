<script lang="ts">
  import LogOut from '@lucide/svelte/icons/log-out';
  import AppHeader from '$lib/components/layout/AppHeader.svelte';
  import { getI18n } from '$lib/i18n/context';
  import type { LayoutProps } from './$types';

  let { data, children }: LayoutProps = $props();

  const i18n = getI18n();
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
</svelte:head>

<AppHeader>
  {#snippet actions()}
    {#if data.userEmail}
      <span class="hidden text-sm text-muted-foreground lg:inline">{data.userEmail}</span>
      <form method="POST" action="/logout">
        <button
          type="submit"
          aria-label={i18n.d.signOut}
          class="flex size-9 items-center justify-center gap-1.5 rounded-full text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground md:w-auto md:px-3"
        >
          <LogOut size={17} />
          <span class="hidden md:inline">{i18n.d.signOut}</span>
        </button>
      </form>
    {/if}
  {/snippet}
</AppHeader>

<main class="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 lg:py-10">
  {#if !data.configured}
    <p class="surface p-4 text-sm">{i18n.d.notConfiguredIntro}</p>
  {:else}
    {@render children()}
  {/if}
</main>
