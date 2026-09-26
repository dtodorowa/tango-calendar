<script lang="ts">
  import Plus from '@lucide/svelte/icons/plus';
  import CategoryBadges from '$lib/components/calendar/CategoryBadges.svelte';
  import OrganizerForm from '$lib/components/dashboard/OrganizerForm.svelte';
  import { describeRepeat } from '$lib/components/dashboard/describe-repeat';
  import { Button } from '$lib/components/ui/button';
  import { getI18n } from '$lib/i18n/context';
  import { SITE } from '$lib/site';
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();

  const i18n = getI18n();
  const d = $derived(i18n.d);
  const hasOrganizer = $derived(data.memberships.length > 0);
  const failed = $derived(form && !form.ok ? form : null);
</script>

<svelte:head>
  <title>{d.myArea} · {SITE.fullName}</title>
</svelte:head>

{#if !hasOrganizer}
  <div class="flex flex-col gap-2">
    <h1 class="font-display text-step3">{d.organizer.createTitle}</h1>
    <p class="text-muted-foreground">{d.organizer.createIntro}</p>
  </div>
  <OrganizerForm
    action="?/createOrganizer"
    values={failed?.values ?? {
      name: '',
      email: data.userEmail ?? '',
      phone: '',
      website: '',
      socialLinks: []
    }}
    errors={failed?.errors}
    formError={failed?.formError}
    submitLabel={d.organizer.create}
  />
{:else}
  <div class="flex flex-wrap items-end justify-between gap-3">
    <div class="flex flex-col gap-1">
      <h1 class="font-display text-step3">{d.myArea}</h1>
      <ul class="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
        {#each data.memberships as { organization } (organization.id)}
          <li>
            {organization.name} ·
            <a href="/dashboard/organizers/{organization.id}" class="text-primary hover:underline">
              {d.organizer.edit}
            </a>
          </li>
        {/each}
      </ul>
    </div>
    <Button href="/dashboard/events/new" class="h-11 w-full gap-1.5 px-4 sm:h-10 sm:w-auto">
      <Plus />
      {d.events.newEvent}
    </Button>
  </div>

  <section class="flex flex-col gap-3">
    <h2 class="font-display text-step1">{d.events.title}</h2>
    {#if data.events.length === 0}
      <p class="surface p-5 text-sm text-muted-foreground">{d.events.none}</p>
    {:else}
      <ul class="flex flex-col gap-2">
        {#each data.events as event (event.id)}
          <li class="surface relative flex flex-col gap-1.5 p-4 hover:shadow-md">
            <div class="flex flex-wrap items-center gap-2">
              <CategoryBadges categories={event.categories} />
              <span
                class={[
                  'rounded-md px-1.5 py-0.5 text-xs font-medium',
                  event.status === 'published'
                    ? 'bg-cat-workshop text-cat-workshop-strong'
                    : 'bg-muted text-muted-foreground'
                ]}
              >
                {event.status === 'published' ? d.events.published : d.events.draft}
              </span>
            </div>
            <a
              href="/dashboard/events/{event.id}"
              class="font-display text-step1 leading-snug after:absolute after:inset-0 after:rounded-xl"
            >
              {event.title[i18n.locale]}
            </a>
            <p class="text-sm text-muted-foreground">
              {describeRepeat(event.rrule, event.firstDateKey, i18n.locale, d)} · {event.venue}
            </p>
            {#if data.memberships.length > 1}
              <p class="text-xs text-muted-foreground">{event.orgName}</p>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </section>
{/if}
