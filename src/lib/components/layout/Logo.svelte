<script lang="ts">
  import { cn } from '$lib/utils';

  type Props = { class?: string };
  let { class: className }: Props = $props();
</script>

<!-- Brand mark: two arcs leaning into each other, an abstract embrace. -->
<svg viewBox="0 0 40 40" fill="none" aria-hidden="true" class={cn('size-9', className)}>
  <circle cx="20" cy="20" r="18.5" stroke="currentColor" stroke-width="1.5" />
  <path
    d="M12 29V17a5 5 0 0 1 10 0v12"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
  />
  <path
    d="M18 29V19a5 5 0 0 1 10 0v10"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
  />
</svg>
