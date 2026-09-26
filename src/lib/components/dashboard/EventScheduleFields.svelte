<script lang="ts">
  import type { EventFormValues, RepeatKind } from '$lib/event-form';
  import { formatWeekday } from '$lib/format';
  import { getI18n } from '$lib/i18n/context';
  import { ORDINALS, WEEKDAYS, weekdayOfKey, type Weekday } from '$lib/repeat';
  import type { FieldErrors } from '$lib/validation';
  import ChoiceGroup from './ChoiceGroup.svelte';
  import FormField from './FormField.svelte';

  type Props = { values: EventFormValues; errors: FieldErrors };
  let { values, errors }: Props = $props();

  const i18n = getI18n();
  const d = $derived(i18n.d);

  let repeatKind = $derived<RepeatKind>(values.repeatKind);
  let weekdays = $derived<Weekday[]>(values.weekdays);
  let monthlyWeekday = $derived<Weekday>(values.monthlyWeekday);

  const repeatOptions = $derived.by(() => {
    const options: { value: RepeatKind; label: string }[] = [
      { value: 'once', label: d.form.repeatOnce },
      { value: 'weekly', label: d.form.repeatWeekly },
      { value: 'monthly', label: d.form.repeatMonthly }
    ];
    // A rule the form can't edit stays selectable so saving doesn't discard it.
    if (values.repeatKind === 'custom') options.push({ value: 'custom', label: '…' });
    return options;
  });

  // Picking a date on a fresh weekly/monthly event pre-selects that weekday.
  function onDateChange(event: Event & { currentTarget: HTMLInputElement }) {
    const key = event.currentTarget.value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return;
    const weekday = weekdayOfKey(key);
    if (weekdays.length <= 1) weekdays = [weekday];
    monthlyWeekday = weekday;
  }

  function toggleWeekday(day: Weekday, checked: boolean) {
    weekdays = checked ? [...weekdays, day] : weekdays.filter((item) => item !== day);
  }
</script>

<section class="surface flex flex-col gap-5 p-5">
  <h2 class="font-display text-step1">{d.form.sectionWhen}</h2>

  <div class="grid gap-4 sm:grid-cols-3">
    <FormField id="date" label={d.form.date} error={errors.date}>
      {#snippet children({ describedBy, invalid })}
        <input
          id="date"
          name="date"
          type="date"
          required
          value={values.date}
          onchange={onDateChange}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          class="field h-10"
        />
      {/snippet}
    </FormField>
    <FormField id="startTime" label={d.form.startTime} error={errors.startTime}>
      {#snippet children({ describedBy, invalid })}
        <input
          id="startTime"
          name="startTime"
          type="time"
          required
          value={values.startTime}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          class="field h-10"
        />
      {/snippet}
    </FormField>
    <FormField id="endTime" label={d.form.endTime} error={errors.endTime}>
      {#snippet children({ describedBy, invalid })}
        <input
          id="endTime"
          name="endTime"
          type="time"
          required
          value={values.endTime}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          class="field h-10"
        />
      {/snippet}
    </FormField>
  </div>
  <p class="-mt-3 text-xs text-muted-foreground">{d.form.endNextDayHint}</p>

  <ChoiceGroup
    name="repeatKind"
    type="radio"
    legend={d.form.repeat}
    options={repeatOptions}
    selected={[repeatKind]}
    onchange={(value) => (repeatKind = value)}
  />

  {#if repeatKind === 'custom'}
    <p class="rounded-lg bg-muted p-3 text-sm">{d.form.customRule}</p>
  {/if}

  <!-- Hidden (not removed) when inactive so switching back keeps the choices. -->
  <div hidden={repeatKind !== 'weekly'}>
    <ChoiceGroup
      name="weekdays"
      legend={d.form.weekdays}
      options={WEEKDAYS.map((day) => ({
        value: day,
        label: formatWeekday(day, i18n.locale, 'short')
      }))}
      selected={weekdays}
      error={errors.weekdays}
      onchange={toggleWeekday}
    />
  </div>

  <div hidden={repeatKind !== 'monthly'} class="flex flex-col gap-4">
    <ChoiceGroup
      name="ordinals"
      legend={d.form.ordinals}
      options={ORDINALS.map((ordinal) => ({
        value: ordinal,
        label: d.ordinals[String(ordinal) as keyof typeof d.ordinals]
      }))}
      selected={values.ordinals}
      error={errors.ordinals}
    />
    <FormField id="monthlyWeekday" label={d.form.weekday}>
      {#snippet children({ describedBy })}
        <select
          id="monthlyWeekday"
          name="monthlyWeekday"
          bind:value={monthlyWeekday}
          aria-describedby={describedBy}
          class="field h-10 sm:w-60"
        >
          {#each WEEKDAYS as day (day)}
            <option value={day}>{formatWeekday(day, i18n.locale)}</option>
          {/each}
        </select>
      {/snippet}
    </FormField>
  </div>

  <div hidden={repeatKind === 'once' || repeatKind === 'custom'}>
    <FormField id="until" label={d.form.until} error={errors.until} class="sm:w-60">
      {#snippet children({ describedBy, invalid })}
        <input
          id="until"
          name="until"
          type="date"
          value={values.until}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          class="field h-10"
        />
      {/snippet}
    </FormField>
  </div>
</section>
