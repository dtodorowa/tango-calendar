<script lang="ts" module>
  export const VIEWS = ['list', 'calendar', 'map'] as const;
  export type View = (typeof VIEWS)[number];
</script>

<script lang="ts">
  import CalendarDays from '@lucide/svelte/icons/calendar-days';
  import ChevronLeft from '@lucide/svelte/icons/chevron-left';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import List from '@lucide/svelte/icons/list';
  import MapIcon from '@lucide/svelte/icons/map';
  import { Button } from '$lib/components/ui/button';
  import { getI18n } from '$lib/i18n/context';
  import { cn } from '$lib/utils';

  type Props = {
    title: string;
    view: View;
    previousHref: string;
    nextHref: string;
    todayHref: string;
    isCurrentMonth: boolean;
    viewHref: (view: View) => string;
  };
  let { title, view, previousHref, nextHref, todayHref, isCurrentMonth, viewHref }: Props =
    $props();

  const i18n = getI18n();
  const VIEW_ICONS = { list: List, calendar: CalendarDays, map: MapIcon };
</script>

<div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
  <div class="flex items-center gap-2">
    <h1
      class="mr-auto font-display text-step1 leading-none whitespace-nowrap capitalize sm:text-step2 md:mr-2 md:text-step3"
    >
      {title}
    </h1>
    <Button
      variant="outline"
      size="icon"
      href={previousHref}
      aria-label={i18n.t.previousMonth}
      data-sveltekit-noscroll
    >
      <ChevronLeft />
    </Button>
    <Button
      variant="outline"
      size="icon"
      href={nextHref}
      aria-label={i18n.t.nextMonth}
      data-sveltekit-noscroll
    >
      <ChevronRight />
    </Button>
    <Button
      variant="outline"
      href={todayHref}
      class={cn('px-3', isCurrentMonth && 'pointer-events-none opacity-50')}
      aria-disabled={isCurrentMonth}
      data-sveltekit-noscroll
    >
      {i18n.t.today}
    </Button>
  </div>

  <nav
    aria-label={i18n.t.viewSwitcherLabel}
    class="grid grid-cols-3 rounded-xl border bg-muted/60 p-1 md:flex"
  >
    {#each VIEWS as option (option)}
      {@const Icon = VIEW_ICONS[option]}
      <a
        href={viewHref(option)}
        aria-current={option === view ? 'page' : undefined}
        data-sveltekit-noscroll
        data-sveltekit-replacestate
        class={cn(
          'flex items-center justify-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors',
          option === view
            ? 'bg-sand text-sand-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Icon size={15} />
        {i18n.t.views[option]}
      </a>
    {/each}
  </nav>
</div>
