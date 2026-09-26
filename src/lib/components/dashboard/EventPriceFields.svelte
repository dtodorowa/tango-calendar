<script lang="ts">
  import type { EventFormValues } from '$lib/event-form';
  import { getI18n } from '$lib/i18n/context';
  import type { PriceKind } from '$lib/types';
  import type { FieldErrors } from '$lib/validation';
  import ChoiceGroup from './ChoiceGroup.svelte';
  import FormField from './FormField.svelte';

  type Props = { values: EventFormValues; errors: FieldErrors };
  let { values, errors }: Props = $props();

  const i18n = getI18n();
  const d = $derived(i18n.d);

  let kind = $derived<PriceKind>(values.priceKind);
</script>

<section class="surface flex flex-col gap-5 p-5">
  <h2 class="font-display text-step1">{d.form.sectionPrice}</h2>
  <ChoiceGroup
    name="priceKind"
    type="radio"
    legend={d.form.sectionPrice}
    options={[
      { value: 'fixed', label: d.form.priceFixed },
      { value: 'donation', label: d.form.priceDonation },
      { value: 'free', label: d.form.priceFree }
    ]}
    selected={[kind]}
    onchange={(value) => (kind = value as PriceKind)}
  />
  <div hidden={kind !== 'fixed'}>
    <FormField id="priceAmount" label={d.form.amount} error={errors.priceAmount} class="sm:w-40">
      {#snippet children({ describedBy, invalid })}
        <input
          id="priceAmount"
          name="priceAmount"
          inputmode="decimal"
          value={values.priceAmount}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          class="field h-10"
        />
      {/snippet}
    </FormField>
  </div>
</section>
