<script lang="ts">
  import { enhance } from '$app/forms';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { getI18n } from '$lib/i18n/context';
  import type { ErrorCode } from '$lib/i18n/dashboard';
  import type { FieldErrors } from '$lib/validation';
  import FormField from './FormField.svelte';

  type Values = { name: string; email: string; phone: string; website: string };
  type Props = {
    action: string;
    values: Values;
    errors?: FieldErrors;
    formError?: ErrorCode;
    submitLabel: string;
  };
  let { action, values, errors = {}, formError, submitLabel }: Props = $props();

  const i18n = getI18n();
  const d = $derived(i18n.d);
  let pending = $state(false);
</script>

<form
  method="POST"
  {action}
  use:enhance={() => {
    pending = true;
    return async ({ update }) => {
      await update({ reset: false });
      pending = false;
    };
  }}
  class="surface flex flex-col gap-4 p-5"
>
  <FormField id="org-name" label={d.organizer.name} error={errors.name}>
    {#snippet children({ describedBy, invalid })}
      <Input
        id="org-name"
        name="name"
        required
        maxlength={120}
        value={values.name}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        class="h-10 bg-card"
      />
    {/snippet}
  </FormField>

  <p class="text-sm text-muted-foreground">{d.organizer.publicHint}</p>

  <div class="grid gap-4 sm:grid-cols-2">
    <FormField id="org-email" label={d.organizer.email} error={errors.email}>
      {#snippet children({ describedBy, invalid })}
        <Input
          id="org-email"
          name="email"
          type="email"
          autocomplete="email"
          value={values.email}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          class="h-10 bg-card"
        />
      {/snippet}
    </FormField>
    <FormField id="org-phone" label={d.organizer.phone} error={errors.phone}>
      {#snippet children({ describedBy, invalid })}
        <Input
          id="org-phone"
          name="phone"
          type="tel"
          autocomplete="tel"
          value={values.phone}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          class="h-10 bg-card"
        />
      {/snippet}
    </FormField>
  </div>

  <FormField id="org-website" label={d.organizer.website} error={errors.website}>
    {#snippet children({ describedBy, invalid })}
      <Input
        id="org-website"
        name="website"
        type="url"
        placeholder="https://"
        value={values.website}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        class="h-10 bg-card"
      />
    {/snippet}
  </FormField>

  {#if formError}
    <p class="text-sm text-destructive" role="alert">{d.errors[formError]}</p>
  {/if}

  <Button
    type="submit"
    class="h-11 w-full sm:h-10 sm:w-auto sm:self-start sm:px-5"
    disabled={pending}>{submitLabel}</Button
  >
</form>
