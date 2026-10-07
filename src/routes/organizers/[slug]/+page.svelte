<script lang="ts">
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';
  import { page } from '$app/state';
  import EventRow from '$lib/components/calendar/EventRow.svelte';
  import { groupByDay } from '$lib/components/calendar/group';
  import AppHeader from '$lib/components/layout/AppHeader.svelte';
  import OrganizerContact from '$lib/components/organizer/OrganizerContact.svelte';
  import { formatLongDate } from '$lib/format';
  import { getI18n } from '$lib/i18n/context';
  import { SITE } from '$lib/site';
  import { LOCALES } from '$lib/types';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  const i18n = getI18n();
  const organization = $derived(data.organization);
  const groups = $derived(groupByDay(data.upcoming));
  const hasContact = $derived(
    Boolean(
      organization.phone ||
      organization.email ||
      organization.website ||
      organization.socialLinks?.length
    )
  );

  const pageTitle = $derived(`${organization.name} · ${SITE.fullName}`);
  const description = $derived(i18n.t.organizerDescription(organization.name));
  const canonical = $derived(`${page.url.origin}/organizers/${organization.slug}`);

  // `<` is escaped so the JSON can't close the script tag.
  const jsonLd = $derived(
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: organization.name,
      url: organization.website ?? canonical,
      logo: organization.logo ?? undefined,
      email: organization.email ?? undefined,
      telephone: organization.phone ?? undefined,
      sameAs: organization.socialLinks?.length ? organization.socialLinks : undefined
    }).replace(/</g, '\\u003c')
  );
</script>

<svelte:head>
  <title>{pageTitle}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonical} />
  {#each LOCALES as locale (locale)}
    <link rel="alternate" hreflang={locale} href="{canonical}?lang={locale}" />
  {/each}
  <meta property="og:title" content={organization.name} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content="profile" />
  <meta property="og:url" content={canonical} />
  {#if organization.logo}
    <meta property="og:image" content={organization.logo} />
  {/if}
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>

<AppHeader />

<main class="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-5 lg:px-6 lg:py-8">
  <a
    href="/"
    class="flex items-center gap-1.5 self-start text-sm text-muted-foreground hover:text-foreground"
  >
    <ArrowLeft size={16} />
    {i18n.t.backToCalendar}
  </a>

  <header class="flex items-center gap-4">
    {#if organization.logo}
      <img
        src={organization.logo}
        alt=""
        class="size-16 shrink-0 rounded-full border object-cover lg:size-20"
      />
    {/if}
    <div class="flex flex-col gap-1">
      <p class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {i18n.t.organizer}
      </p>
      <h1 class="font-display text-step3 leading-tight lg:text-step4">{organization.name}</h1>
    </div>
  </header>

  <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
    {#if hasContact}
      <aside class="surface flex flex-col gap-2 self-start p-4 text-sm lg:order-2">
        <OrganizerContact {organization} />
      </aside>
    {/if}

    <section class="flex flex-col gap-3">
      <h2 class="font-display text-step1">{i18n.t.upcomingEvents}</h2>
      {#if data.upcoming.length === 0}
        <p class="text-sm text-muted-foreground">{i18n.t.noUpcomingEvents}</p>
      {:else}
        {#each groups as [key, items] (key)}
          <section class="flex flex-col gap-2">
            <h3 class="pt-2 text-sm font-semibold capitalize">
              {formatLongDate(key, i18n.locale)}
            </h3>
            {#each items as occurrence (occurrence.eventId + occurrence.start)}
              <EventRow {occurrence} showOrganizer={false} />
            {/each}
          </section>
        {/each}
      {/if}
    </section>
  </div>
</main>
