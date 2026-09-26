<script lang="ts">
  import { enhance } from '$app/forms';
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';
  import ExternalLink from '@lucide/svelte/icons/external-link';
  import EventForm from '$lib/components/dashboard/EventForm.svelte';
  import { Button } from '$lib/components/ui/button';
  import { formatShortDate } from '$lib/format';
  import { getI18n } from '$lib/i18n/context';
  import { SITE } from '$lib/site';
  import { cn } from '$lib/utils';
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();

  const i18n = getI18n();
  const d = $derived(i18n.d);
  const organizations = $derived(data.memberships.map((membership) => membership.organization));
  const failedSave = $derived(form && 'values' in form ? form : null);
</script>

<svelte:head>
  <title>{d.form.editTitle} · {SITE.fullName}</title>
</svelte:head>

<div class="flex flex-wrap items-center justify-between gap-2">
  <a
    href="/dashboard"
    class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
  >
    <ArrowLeft size={16} />
    {d.myArea}
  </a>
  {#if data.status === 'published'}
    <a
      href="/events/{data.eventId}"
      class="flex items-center gap-1.5 text-sm text-primary hover:underline"
    >
      <ExternalLink size={14} />
      {d.events.view}
    </a>
  {/if}
</div>

<h1 class="font-display text-step3">{d.form.editTitle}</h1>

{#if data.saved && !failedSave}
  <p class="rounded-lg bg-cat-workshop px-4 py-3 text-sm text-cat-workshop-strong" role="status">
    {d.form.saved}
  </p>
{/if}

{#if data.dates.length > 0}
  <section class="surface flex flex-col gap-3 p-5">
    <div class="flex flex-col gap-1">
      <h2 class="font-display text-step1">{d.form.dates}</h2>
      <p class="text-sm text-muted-foreground">{d.form.datesHint}</p>
    </div>
    <ul class="flex flex-col divide-y">
      {#each data.dates as date (date.start)}
        <li class="flex items-center justify-between gap-3 py-2">
          <span class={cn('text-sm', date.cancelled && 'text-muted-foreground line-through')}>
            {formatShortDate(date.dateKey, i18n.locale)}
          </span>
          <form
            method="POST"
            action={date.cancelled ? '?/restoreDate' : '?/cancelDate'}
            use:enhance={() =>
              ({ update }) =>
                update({ reset: false })}
          >
            <input type="hidden" name="date" value={date.dateKey} />
            <Button type="submit" variant="outline" size="sm" class="bg-card">
              {date.cancelled ? d.form.restoreDate : d.form.cancelDate}
            </Button>
          </form>
        </li>
      {/each}
    </ul>
  </section>
{/if}

{#key failedSave}
  <EventForm
    action="?/save"
    values={failedSave?.values ?? data.values}
    errors={failedSave?.errors}
    formError={failedSave?.formError}
    {organizations}
    venues={data.venues}
  />
{/key}

<form
  method="POST"
  action="?/delete"
  onsubmit={(event) => {
    if (!confirm(d.form.deleteConfirm)) event.preventDefault();
  }}
  class="flex justify-end"
>
  <Button type="submit" variant="destructive" class="h-11 w-full sm:h-9 sm:w-auto">
    {d.form.delete}
  </Button>
</form>
