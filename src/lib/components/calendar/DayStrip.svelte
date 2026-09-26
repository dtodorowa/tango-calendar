<script lang="ts">
  import { formatLongDate, formatWeekdayShort } from '$lib/format';
  import { getI18n } from '$lib/i18n/context';
  import { cn } from '$lib/utils';
  import { dayAnchorId } from './group';

  type Props = {
    /** Date keys to show, in order. */
    days: string[];
    daysWithEvents: Set<string>;
    todayKey: string;
  };
  let { days, daysWithEvents, todayKey }: Props = $props();

  const i18n = getI18n();
</script>

<nav
  class="-mx-4 flex snap-x [scrollbar-width:none] gap-1 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0"
>
  {#each days as key (key)}
    {@const hasEvents = daysWithEvents.has(key)}
    <a
      href={hasEvents ? `#${dayAnchorId(key)}` : undefined}
      aria-label={formatLongDate(key, i18n.locale)}
      aria-disabled={!hasEvents}
      class={cn(
        'flex min-w-11 shrink-0 snap-start flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 transition-colors',
        hasEvents ? 'hover:bg-muted' : 'pointer-events-none opacity-40',
        key === todayKey && 'bg-foreground text-background hover:bg-foreground/90'
      )}
    >
      <span class="text-[0.625rem] font-medium uppercase">
        {formatWeekdayShort(key, i18n.locale)}
      </span>
      <span class="text-sm font-semibold tabular-nums">{key.slice(8)}</span>
      <span
        class={cn(
          'size-1 rounded-full',
          hasEvents ? (key === todayKey ? 'bg-background' : 'bg-primary') : 'bg-transparent'
        )}
      ></span>
    </a>
  {/each}
</nav>
