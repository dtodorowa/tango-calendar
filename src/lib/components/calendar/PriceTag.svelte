<script lang="ts">
  import { formatPrice } from '$lib/format';
  import { getI18n } from '$lib/i18n/context';
  import type { Price } from '$lib/types';
  import { cn } from '$lib/utils';

  type Props = { price: Price; size?: 'sm' | 'md'; class?: string };
  let { price, size = 'md', class: className }: Props = $props();

  const i18n = getI18n();
</script>

<span
  class={cn(
    'inline-flex items-center rounded-md font-medium whitespace-nowrap',
    size === 'md' ? 'px-2.5 py-1 text-sm' : 'px-1.5 py-0.5 text-xs',
    price.kind === 'fixed' ? 'bg-primary-soft text-primary' : 'bg-sand text-sand-foreground',
    className
  )}
>
  {formatPrice(price, i18n.locale, i18n.t)}
</span>
