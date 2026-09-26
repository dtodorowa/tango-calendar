<script lang="ts">
  import { enhance } from '$app/forms';
  import { Button } from '$lib/components/ui/button';
  import type { EventFormValues } from '$lib/event-form';
  import { getI18n } from '$lib/i18n/context';
  import type { ErrorCode } from '$lib/i18n/dashboard';
  import type { Organization, Venue } from '$lib/types';
  import type { FieldErrors } from '$lib/validation';
  import EventPriceFields from './EventPriceFields.svelte';
  import EventScheduleFields from './EventScheduleFields.svelte';
  import EventTextFields from './EventTextFields.svelte';
  import EventVenueFields from './EventVenueFields.svelte';

  type Props = {
    action: string;
    values: EventFormValues;
    errors?: FieldErrors;
    formError?: ErrorCode;
    organizations: Organization[];
    venues: Venue[];
  };
  let { action, values, errors = {}, formError, organizations, venues }: Props = $props();

  const i18n = getI18n();
  const d = $derived(i18n.d);

  let orgId = $derived(values.orgId);
  const orgVenues = $derived(venues.filter((venue) => venue.orgId === orgId));
  const errorCount = $derived(Object.keys(errors).length + (formError ? 1 : 0));
  let pending = $state(false);
</script>

<form
  method="POST"
  {action}
  novalidate
  use:enhance={() => {
    pending = true;
    return async ({ update }) => {
      await update({ reset: false });
      pending = false;
    };
  }}
  class="flex flex-col gap-4"
>
  {#if organizations.length > 1}
    <label class="surface flex flex-col gap-1.5 p-5">
      <span class="text-sm font-medium">{d.form.organizer}</span>
      <select name="orgId" bind:value={orgId} class="field h-10">
        {#each organizations as organization (organization.id)}
          <option value={organization.id}>{organization.name}</option>
        {/each}
      </select>
    </label>
  {:else}
    <input type="hidden" name="orgId" value={orgId} />
  {/if}

  <EventTextFields {values} {errors} />
  <EventScheduleFields {values} {errors} />
  {#key orgId}
    <EventVenueFields {values} {errors} venues={orgVenues} />
  {/key}
  <EventPriceFields {values} {errors} />

  <section class="surface flex flex-col gap-4 p-5">
    <label class="flex items-start gap-3">
      <input
        type="checkbox"
        name="publish"
        checked={values.publish}
        class="mt-0.5 size-4 accent-primary"
      />
      <span class="flex flex-col gap-0.5">
        <span class="text-sm font-medium">{d.form.publish}</span>
        <span class="text-xs text-muted-foreground">{d.form.publishHint}</span>
      </span>
    </label>

    {#if errorCount > 0}
      <p class="text-sm text-destructive" role="alert">
        {formError ? d.errors[formError] : d.errors.required}
      </p>
    {/if}

    <Button type="submit" class="h-11 w-full sm:w-auto sm:self-start sm:px-6" disabled={pending}
      >{d.form.save}</Button
    >
  </section>
</form>
