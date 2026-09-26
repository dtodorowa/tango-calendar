<script lang="ts">
  import Search from '@lucide/svelte/icons/search';
  import { getI18n } from '$lib/i18n/context';
  import { cn } from '$lib/utils';

  type Props = { value: string; oninput?: () => void; class?: string };
  let { value = $bindable(), oninput, class: className }: Props = $props();

  const i18n = getI18n();
</script>

<label class={cn('relative block', className)}>
  <span class="sr-only">{i18n.t.searchLabel}</span>
  <Search
    size={16}
    class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground"
  />
  <input
    type="search"
    bind:value
    {oninput}
    placeholder={i18n.t.searchPlaceholder}
    autocomplete="off"
    class="h-10 w-full rounded-full border bg-card pr-4 pl-10 text-sm transition-shadow outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
  />
</label>
