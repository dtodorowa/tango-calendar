<script lang="ts">
  import { getI18n } from '$lib/i18n/context';
  import type { Category } from '$lib/types';
  import { cn } from '$lib/utils';
  import { CATEGORY_STYLE } from './category-style';

  type Props = { categories: Category[]; class?: string };
  let { categories, class: className }: Props = $props();

  const i18n = getI18n();
</script>

<span class={cn('inline-flex flex-wrap gap-1', className)}>
  {#each categories as category (category)}
    <span
      class={[
        'eyebrow rounded-md px-1.5 py-0.5',
        CATEGORY_STYLE[category].surface,
        CATEGORY_STYLE[category].text
      ]}
    >
      {i18n.t.categories[category]}
    </span>
  {/each}
</span>
