<script lang="ts">
  import { getI18n } from '$lib/i18n/context';
  import type { Category } from '$lib/types';
  import { cn } from '$lib/utils';
  import { CATEGORY_STYLE } from './category-style';

  type Props = { categories: readonly Category[]; class?: string };
  let { categories, class: className }: Props = $props();

  const i18n = getI18n();
</script>

<ul class={cn('flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground', className)}>
  {#each categories as category (category)}
    <li class="flex items-center gap-1.5">
      <span class={['size-2 rounded-full', CATEGORY_STYLE[category].dot]}></span>
      {i18n.t.categories[category]}
    </li>
  {/each}
</ul>
