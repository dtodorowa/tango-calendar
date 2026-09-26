<script lang="ts">
  import type { EventFormValues } from '$lib/event-form';
  import { getI18n } from '$lib/i18n/context';
  import { COUNTRIES } from '$lib/i18n/dashboard';
  import type { Venue } from '$lib/types';
  import type { FieldErrors } from '$lib/validation';
  import ChoiceGroup from './ChoiceGroup.svelte';
  import FormField from './FormField.svelte';

  type Props = { values: EventFormValues; errors: FieldErrors; venues: Venue[] };
  let { values, errors, venues }: Props = $props();

  const i18n = getI18n();
  const d = $derived(i18n.d);

  let mode = $derived<'saved' | 'new'>(venues.length ? values.venueMode : 'new');
</script>

<section class="surface flex flex-col gap-5 p-5">
  <h2 class="font-display text-step1">{d.form.sectionWhere}</h2>

  {#if venues.length}
    <ChoiceGroup
      name="venueMode"
      type="radio"
      legend={d.form.sectionWhere}
      options={[
        { value: 'saved', label: d.form.venueSaved },
        { value: 'new', label: d.form.venueNew }
      ]}
      selected={[mode]}
      onchange={(value) => (mode = value as 'saved' | 'new')}
    />
  {:else}
    <input type="hidden" name="venueMode" value="new" />
  {/if}

  <div hidden={mode !== 'saved'}>
    <FormField id="venueId" label={d.form.venueSaved} error={errors.venueId}>
      {#snippet children({ describedBy, invalid })}
        <select
          id="venueId"
          name="venueId"
          value={values.venueId}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          class="field h-10"
        >
          {#each venues as venue (venue.id)}
            <option value={venue.id}>{venue.name} · {venue.city}</option>
          {/each}
        </select>
      {/snippet}
    </FormField>
  </div>

  <div hidden={mode !== 'new'} class="flex flex-col gap-4">
    <FormField id="venueName" label={d.form.venueName} error={errors.venueName}>
      {#snippet children({ describedBy, invalid })}
        <input
          id="venueName"
          name="venueName"
          maxlength={120}
          value={values.venueName}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          class="field h-10"
        />
      {/snippet}
    </FormField>
    <FormField
      id="venueAddress"
      label={d.form.address}
      hint={d.form.geocodeHint}
      error={errors.venueAddress}
    >
      {#snippet children({ describedBy, invalid })}
        <input
          id="venueAddress"
          name="venueAddress"
          autocomplete="street-address"
          maxlength={200}
          value={values.venueAddress}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          class="field h-10"
        />
      {/snippet}
    </FormField>
    <div class="grid gap-4 sm:grid-cols-[1fr_12rem]">
      <FormField id="venueCity" label={d.form.city} error={errors.venueCity}>
        {#snippet children({ describedBy, invalid })}
          <input
            id="venueCity"
            name="venueCity"
            autocomplete="address-level2"
            maxlength={80}
            value={values.venueCity}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            class="field h-10"
          />
        {/snippet}
      </FormField>
      <FormField id="venueCountry" label={d.form.country}>
        {#snippet children({ describedBy })}
          <select
            id="venueCountry"
            name="venueCountry"
            value={values.venueCountry}
            aria-describedby={describedBy}
            class="field h-10"
          >
            {#each COUNTRIES as country (country)}
              <option value={country}>{d.countries[country]}</option>
            {/each}
          </select>
        {/snippet}
      </FormField>
    </div>
  </div>
</section>
