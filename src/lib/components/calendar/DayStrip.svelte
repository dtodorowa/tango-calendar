<script lang="ts">
  import { formatLongDate, formatWeekdayShort } from '$lib/format';
  import { getI18n } from '$lib/i18n/context';
  import { cn } from '$lib/utils';

  type Props = {
    /** Date keys to show, in order. */
    days: string[];
    daysWithEvents: Set<string>;
    todayKey: string;
    /** Date key of the picked day, or null when every day is shown. */
    selected: string | null;
    onSelect: (key: string | null) => void;
  };
  let { days, daysWithEvents, todayKey, selected, onSelect }: Props = $props();

  const i18n = getI18n();
</script>

<nav
  class="-mx-4 flex snap-x [scrollbar-width:none] gap-1 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0"
>
  <button
    type="button"
    aria-pressed={selected === null}
    onclick={() => onSelect(null)}
    class={cn(
      'flex shrink-0 snap-start items-center rounded-xl px-3 text-xs font-semibold transition-colors',
      selected === null
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    )}
  >
    {i18n.t.allDays}
  </button>

  {#each days as key (key)}
    {@const hasEvents = daysWithEvents.has(key)}
    {@const isSelected = key === selected}
    {@const isToday = key === todayKey}
    <button
      type="button"
      disabled={!hasEvents}
      aria-pressed={isSelected}
      aria-label={i18n.t.eventsOnDay(formatLongDate(key, i18n.locale))}
      onclick={() => onSelect(isSelected ? null : key)}
      class={cn(
        'flex min-w-11 shrink-0 snap-start flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 transition-[background-color,color,transform] active:scale-95',
        hasEvents ? 'cursor-pointer' : 'opacity-40',
        isSelected ? 'bg-primary text-primary-foreground shadow-sm' : hasEvents && 'hover:bg-muted',
        isToday && !isSelected && 'text-primary ring-1 ring-primary/40 ring-inset'
      )}
    >
      <span class="text-[0.625rem] font-medium uppercase">
        {formatWeekdayShort(key, i18n.locale)}
      </span>
      <span class="text-sm font-semibold tabular-nums">{key.slice(8)}</span>
      <span
        class={cn(
          'size-1 rounded-full',
          hasEvents ? (isSelected ? 'bg-primary-foreground' : 'bg-primary') : 'bg-transparent'
        )}
      ></span>
    </button>
  {/each}
</nav>
