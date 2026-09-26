<script lang="ts">
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';
  import OrganizerForm from '$lib/components/dashboard/OrganizerForm.svelte';
  import { getI18n } from '$lib/i18n/context';
  import { SITE } from '$lib/site';
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();

  const i18n = getI18n();
  const d = $derived(i18n.d);
  const failed = $derived(form && !form.ok ? form : null);
  const organization = $derived(data.organization);
</script>

<svelte:head>
  <title>{d.organizer.editTitle} · {SITE.fullName}</title>
</svelte:head>

<a
  href="/dashboard"
  class="flex items-center gap-1.5 self-start text-sm text-muted-foreground hover:text-foreground"
>
  <ArrowLeft size={16} />
  {d.myArea}
</a>
<h1 class="font-display text-step3">{d.organizer.editTitle}</h1>
<OrganizerForm
  action=""
  values={failed?.values ?? {
    name: organization.name,
    email: organization.email ?? '',
    phone: organization.phone ?? '',
    website: organization.website ?? ''
  }}
  errors={failed?.errors}
  formError={failed?.formError}
  submitLabel={d.organizer.save}
/>
