<script lang="ts">
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';
  import EventForm from '$lib/components/dashboard/EventForm.svelte';
  import { getI18n } from '$lib/i18n/context';
  import { SITE } from '$lib/site';
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();

  const i18n = getI18n();
  const d = $derived(i18n.d);
  const organizations = $derived(data.memberships.map((membership) => membership.organization));
</script>

<svelte:head>
  <title>{d.form.newTitle} · {SITE.fullName}</title>
</svelte:head>

<a
  href="/dashboard"
  class="flex items-center gap-1.5 self-start text-sm text-muted-foreground hover:text-foreground"
>
  <ArrowLeft size={16} />
  {d.myArea}
</a>
<h1 class="font-display text-step3">{d.form.newTitle}</h1>

{#if data.values}
  <!-- Remount on each failed submit so the form shows exactly what was sent back. -->
  {#key form}
    <EventForm
      action=""
      values={form?.values ?? data.values}
      errors={form?.errors}
      formError={form?.formError}
      {organizations}
      venues={data.venues}
    />
  {/key}
{/if}
