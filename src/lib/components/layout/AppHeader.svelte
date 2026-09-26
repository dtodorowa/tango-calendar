<script lang="ts">
  import type { Snippet } from 'svelte';
  import UserRound from '@lucide/svelte/icons/user-round';
  import { getI18n } from '$lib/i18n/context';
  import { SITE } from '$lib/site';
  import LanguageSwitcher from './LanguageSwitcher.svelte';

  type Props = {
    /** Centre slot on desktop (the search field on the calendar page). */
    children?: Snippet;
    /** Right-hand actions; defaults to the organizer entry point. */
    actions?: Snippet;
  };
  let { children, actions }: Props = $props();

  const i18n = getI18n();
</script>

<header class="border-b bg-card/70 backdrop-blur">
  <div class="mx-auto flex h-16 max-w-[100rem] items-center gap-3 px-4 lg:gap-4 lg:px-6">
    <a href="/" class="flex min-w-0 shrink-0 items-center gap-2.5 lg:w-64">
      <span class="flex flex-col leading-none">
        <span class="text-[0.6875rem] font-semibold tracking-widest text-primary uppercase">
          {SITE.regionMark}
        </span>
        <span class="font-display text-step1 leading-tight whitespace-nowrap">{SITE.name}</span>
      </span>
    </a>

    <div class="hidden min-w-0 flex-1 md:block">
      {@render children?.()}
    </div>

    <div class="ml-auto flex shrink-0 items-center gap-2">
      {#if actions}
        {@render actions()}
      {:else}
        <a
          href="/dashboard"
          aria-label={i18n.t.forOrganizers}
          class="flex size-9 items-center justify-center gap-1.5 rounded-full text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground md:w-auto md:px-3"
        >
          <UserRound size={18} />
          <span class="hidden md:inline">{i18n.t.forOrganizers}</span>
        </a>
      {/if}
      <LanguageSwitcher />
    </div>
  </div>
</header>
