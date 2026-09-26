<script lang="ts">
  import { untrack } from 'svelte';
  import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import CalendarToolbar, {
    VIEWS,
    type View
  } from '$lib/components/calendar/CalendarToolbar.svelte';
  import FilterPanel from '$lib/components/calendar/FilterPanel.svelte';
  import ListView from '$lib/components/calendar/ListView.svelte';
  import MapView from '$lib/components/calendar/MapView.svelte';
  import MonthView from '$lib/components/calendar/MonthView.svelte';
  import SearchField from '$lib/components/calendar/SearchField.svelte';
  import AppHeader from '$lib/components/layout/AppHeader.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Drawer from '$lib/components/ui/drawer';
  import { activeFilterCount, applyFilters, parseFilters, writeFilters } from '$lib/filters';
  import type { Filters } from '$lib/filters';
  import { formatMonthTitle } from '$lib/format';
  import { getI18n } from '$lib/i18n/context';
  import { SITE } from '$lib/site';
  import {
    addDays,
    formatYearMonth,
    monthBounds,
    monthGrid,
    parseYearMonth,
    shiftMonth
  } from '$lib/time';
  import { LOCALES } from '$lib/types';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  const i18n = getI18n();

  // --- URL state -----------------------------------------------------------
  const urlFilters = $derived(parseFilters(page.url.searchParams));
  const view = $derived.by<View>(() => {
    const raw = page.url.searchParams.get('view');
    return VIEWS.find((option) => option === raw) ?? 'list';
  });
  const day = $derived(page.url.searchParams.get('day'));

  // Search is local so typing never waits on navigation; it syncs to the URL
  // after a short pause.
  let query = $state(untrack(() => urlFilters.query));
  const filters = $derived<Filters>({ ...urlFilters, query });

  let searchTimer: ReturnType<typeof setTimeout> | undefined;

  function updateFilters(next: Filters) {
    clearTimeout(searchTimer);
    query = next.query;
    const params = writeFilters(page.url.searchParams, next);
    goto(`?${params}`, { replaceState: true, keepFocus: true, noScroll: true });
  }

  function onSearchInput() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => updateFilters(filters), 350);
  }

  function selectDay(key: string | null) {
    goto(hrefWith({ day: key }), { replaceState: true, keepFocus: true, noScroll: true });
  }

  function hrefWith(changes: Record<string, string | null>): string {
    const params = new URLSearchParams(page.url.searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    if (query.trim()) params.set('q', query.trim());
    const search = params.toString();
    return `${page.url.pathname}${search ? `?${search}` : ''}`;
  }

  // --- Month + derived data ------------------------------------------------
  const month = $derived(parseYearMonth(data.month) ?? { year: 2026, month: 1 });
  const isCurrentMonth = $derived(data.month === data.currentMonth);
  const weeks = $derived(monthGrid(month));
  const bounds = $derived(monthBounds(month));

  const filtered = $derived(applyFilters(data.occurrences, filters, i18n.locale));
  const inMonth = $derived(
    filtered.filter((o) => o.dateKey >= bounds.firstKey && o.dateKey <= bounds.lastKey)
  );
  // List + map look forward: in the current month, past days drop off.
  const listStartKey = $derived(isCurrentMonth ? data.todayKey : bounds.firstKey);
  const upcoming = $derived(inMonth.filter((o) => o.dateKey >= listStartKey));

  const stripDays = $derived.by(() => {
    const days: string[] = [];
    for (let key = listStartKey; key <= bounds.lastKey; key = addDays(key, 1)) days.push(key);
    return days;
  });

  const filterCount = $derived(activeFilterCount(filters));
  let drawerOpen = $state(false);

  const monthTitle = $derived(formatMonthTitle(month, i18n.locale));
  const canonical = $derived(`${page.url.origin}/`);
</script>

<svelte:head>
  <title>{SITE.fullName}</title>
  <meta name="description" content={i18n.t.siteDescription} />
  <link rel="canonical" href={canonical} />
  {#each LOCALES as locale (locale)}
    <link rel="alternate" hreflang={locale} href="{canonical}?lang={locale}" />
  {/each}
  <meta property="og:title" content={SITE.fullName} />
  <meta property="og:description" content={i18n.t.siteDescription} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={canonical} />
</svelte:head>

<!-- Desktop is an app shell: the page itself never scrolls, the filter sidebar
     and the events pane each scroll on their own. Mobile keeps document scroll. -->
<div class="lg:flex lg:h-dvh lg:flex-col lg:overflow-hidden">
  <AppHeader>
    <SearchField bind:value={query} oninput={onSearchInput} class="max-w-xl" />
  </AppHeader>

  <div class="mx-auto flex w-full max-w-[100rem] lg:min-h-0 lg:flex-1">
    <aside
      class="hidden w-72 shrink-0 overflow-y-auto overscroll-contain border-r px-6 py-6 lg:block"
    >
      <FilterPanel
        {filters}
        organizers={data.organizers}
        onChange={updateFilters}
        idPrefix="sidebar"
      />
    </aside>

    <main
      class="flex min-w-0 flex-1 flex-col gap-4 px-4 py-4 lg:overflow-y-auto lg:overscroll-contain lg:px-8 lg:py-6"
    >
      <div class="flex items-center gap-2 lg:hidden">
        <SearchField bind:value={query} oninput={onSearchInput} class="flex-1 md:hidden" />
        <Drawer.Root bind:open={drawerOpen}>
          <Drawer.Trigger>
            {#snippet child({ props })}
              <Button {...props} variant="outline" class="h-10 gap-2 rounded-full bg-card px-4">
                <SlidersHorizontal />
                {i18n.t.filters}
                {#if filterCount > 0}
                  <span
                    class="grid size-5 place-items-center rounded-full bg-primary text-xs text-primary-foreground"
                  >
                    {filterCount}
                  </span>
                {/if}
              </Button>
            {/snippet}
          </Drawer.Trigger>
          <Drawer.Content>
            <Drawer.Header class="text-left">
              <Drawer.Title class="font-display text-step1">{i18n.t.filters}</Drawer.Title>
            </Drawer.Header>
            <div class="overflow-y-auto px-4 pb-2">
              <FilterPanel
                {filters}
                organizers={data.organizers}
                onChange={updateFilters}
                idPrefix="drawer"
              />
            </div>
            <Drawer.Footer>
              <Button class="h-11" onclick={() => (drawerOpen = false)}>
                {i18n.t.showEvents(view === 'calendar' ? inMonth.length : upcoming.length)}
              </Button>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Root>
      </div>

      <CalendarToolbar
        title={monthTitle}
        {view}
        {isCurrentMonth}
        previousHref={hrefWith({ month: formatYearMonth(shiftMonth(month, -1)), day: null })}
        nextHref={hrefWith({ month: formatYearMonth(shiftMonth(month, 1)), day: null })}
        todayHref={hrefWith({ month: null, day: null })}
        viewHref={(option) => hrefWith({ view: option === 'list' ? null : option })}
      />

      {#if view === 'calendar'}
        {#key data.month}
          <MonthView
            {weeks}
            occurrences={inMonth}
            todayKey={data.todayKey}
            dayListHref={(key) => hrefWith({ view: null, day: key })}
          />
        {/key}
      {:else if view === 'map'}
        <MapView occurrences={upcoming} />
      {:else}
        <ListView
          occurrences={upcoming}
          {stripDays}
          todayKey={data.todayKey}
          {day}
          onSelectDay={selectDay}
        />
      {/if}
    </main>
  </div>
</div>
