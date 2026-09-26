<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { ErrorCode } from '$lib/i18n/dashboard';
  import { getI18n } from '$lib/i18n/context';
  import { cn } from '$lib/utils';

  type Props = {
    /** Id of the control the label points at; also prefixes hint/error ids. */
    id: string;
    label: string;
    hint?: string;
    error?: ErrorCode;
    class?: string;
    children: Snippet<[{ describedBy: string | undefined; invalid: boolean }]>;
  };
  let { id, label, hint, error, class: className, children }: Props = $props();

  const i18n = getI18n();
  const describedBy = $derived(
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  );
</script>

<div class={cn('flex flex-col gap-1.5', className)}>
  <label for={id} class="text-sm font-medium">{label}</label>
  {@render children({ describedBy, invalid: Boolean(error) })}
  {#if hint}
    <p id="{id}-hint" class="text-xs text-muted-foreground">{hint}</p>
  {/if}
  {#if error}
    <p id="{id}-error" class="text-sm text-destructive">{i18n.d.errors[error]}</p>
  {/if}
</div>
