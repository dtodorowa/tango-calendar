<script lang="ts">
  import type { EventPhotoVariant } from '$lib/media';
  import type { Category, Photo } from '$lib/types';
  import { cn } from '$lib/utils';
  import { primaryStyle } from './category-style';

  type Props = {
    categories: Category[];
    photo: Photo | null;
    /** `full` for the hero on the event page; lists and cards use the small file. */
    variant?: EventPhotoVariant;
    alt?: string;
    class?: string;
    iconSize?: number;
  };
  let {
    categories,
    photo,
    variant = 'card',
    alt = '',
    class: className,
    iconSize = 28
  }: Props = $props();

  const style = $derived(primaryStyle(categories));
</script>

{#if photo}
  <img
    src={photo[variant]}
    {alt}
    loading={variant === 'full' ? 'eager' : 'lazy'}
    class={cn('object-cover', className)}
  />
{:else}
  <!-- Most organizers won't upload a photo; a category tile keeps rows balanced. -->
  <div
    class={cn('grid place-items-center overflow-hidden', style.surface, style.text, className)}
    aria-hidden="true"
  >
    <style.icon size={iconSize} strokeWidth={1.5} />
  </div>
{/if}
