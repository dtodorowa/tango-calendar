<script lang="ts">
  import type { Category } from '$lib/types';
  import { cn } from '$lib/utils';
  import { primaryStyle } from './category-style';

  type Props = {
    categories: Category[];
    photo: string | null;
    alt?: string;
    class?: string;
    iconSize?: number;
  };
  let { categories, photo, alt = '', class: className, iconSize = 28 }: Props = $props();

  const style = $derived(primaryStyle(categories));
</script>

{#if photo}
  <img src={photo} {alt} loading="lazy" class={cn('object-cover', className)} />
{:else}
  <!-- Most organizers won't upload a photo; a category tile keeps rows balanced. -->
  <div
    class={cn('grid place-items-center overflow-hidden', style.surface, style.text, className)}
    aria-hidden="true"
  >
    <style.icon size={iconSize} strokeWidth={1.5} />
  </div>
{/if}
