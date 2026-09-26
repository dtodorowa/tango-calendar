<script lang="ts">
  import type { EventFormValues } from '$lib/event-form';
  import { getI18n } from '$lib/i18n/context';
  import { LOCALE_NAMES } from '$lib/i18n/messages';
  import { CATEGORIES, LOCALES, TAGS, type Locale } from '$lib/types';
  import type { FieldErrors } from '$lib/validation';
  import ChoiceGroup from './ChoiceGroup.svelte';
  import FormField from './FormField.svelte';

  type Props = { values: EventFormValues; errors: FieldErrors };
  let { values, errors }: Props = $props();

  const i18n = getI18n();
  const d = $derived(i18n.d);

  let sourceLang = $derived<Locale>(values.sourceLang);
</script>

<section class="surface flex flex-col gap-5 p-5">
  <h2 class="font-display text-step1">{d.form.sectionWhat}</h2>

  <ChoiceGroup
    name="sourceLang"
    type="radio"
    legend={d.form.language}
    options={LOCALES.map((locale) => ({ value: locale, label: LOCALE_NAMES[locale] }))}
    selected={[sourceLang]}
    onchange={(locale) => (sourceLang = locale)}
  />

  <p class="-mt-2 text-xs text-muted-foreground">{d.form.translationsHint}</p>

  <!-- One block per language in a fixed order, so switching the source language
       never unmounts (and empties) what was typed. -->
  {#each LOCALES as locale (locale)}
    {@const primary = locale === sourceLang}
    {@const hasError = Object.keys(errors).some((key) => key.startsWith(`translations.${locale}`))}
    <details
      class="group rounded-lg border bg-card open:bg-transparent"
      open={primary || hasError || Boolean(values.translations[locale].title)}
    >
      <summary
        class="flex cursor-pointer items-center justify-between px-3 py-2.5 text-sm font-medium"
      >
        <span>{LOCALE_NAMES[locale]}</span>
        <span class="text-xs font-normal text-muted-foreground">
          {primary ? d.form.originalText : d.form.optionalTranslation}
        </span>
      </summary>
      <div class="flex flex-col gap-4 px-3 pb-4">
        <FormField
          id="title-{locale}"
          label={d.form.title}
          error={errors[`translations.${locale}.title`]}
        >
          {#snippet children({ describedBy, invalid })}
            <input
              id="title-{locale}"
              name="title_{locale}"
              lang={locale}
              required={primary}
              maxlength={160}
              value={values.translations[locale].title}
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
              class="field h-10"
            />
          {/snippet}
        </FormField>
        <FormField
          id="description-{locale}"
          label={d.form.description}
          error={errors[`translations.${locale}.description`]}
        >
          {#snippet children({ describedBy, invalid })}
            <textarea
              id="description-{locale}"
              name="description_{locale}"
              lang={locale}
              rows={4}
              maxlength={4000}
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
              class="field py-2">{values.translations[locale].description}</textarea
            >
          {/snippet}
        </FormField>
        <FormField
          id="note-{locale}"
          label={d.form.note}
          hint={d.form.noteHint}
          error={errors[`translations.${locale}.note`]}
        >
          {#snippet children({ describedBy, invalid })}
            <input
              id="note-{locale}"
              name="note_{locale}"
              lang={locale}
              maxlength={120}
              value={values.translations[locale].note}
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
              class="field h-10"
            />
          {/snippet}
        </FormField>
      </div>
    </details>
  {/each}

  <ChoiceGroup
    name="categories"
    legend={d.form.categories}
    options={CATEGORIES.map((category) => ({
      value: category,
      label: i18n.t.categories[category]
    }))}
    selected={values.categories}
    error={errors.categories}
  />

  <ChoiceGroup
    name="tags"
    legend={d.form.tags}
    options={TAGS.map((tag) => ({ value: tag, label: i18n.t.tags[tag] }))}
    selected={values.tags}
  />
</section>
