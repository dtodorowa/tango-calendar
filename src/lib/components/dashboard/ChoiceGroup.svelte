<script lang="ts" generics="T extends string | number">
  import type { ErrorCode } from '$lib/i18n/dashboard';
  import { getI18n } from '$lib/i18n/context';

  type Props = {
    name: string;
    legend: string;
    options: readonly { value: T; label: string }[];
    type?: 'checkbox' | 'radio';
    /** Checked values (checkbox) or the single value (radio). */
    selected: readonly T[];
    error?: ErrorCode;
    onchange?: (value: T, checked: boolean) => void;
  };
  let { name, legend, options, type = 'checkbox', selected, error, onchange }: Props = $props();

  const i18n = getI18n();
</script>

<fieldset class="flex flex-col gap-2" aria-describedby={error ? `${name}-error` : undefined}>
  <legend class="mb-2 text-sm font-medium">{legend}</legend>
  <div class="flex flex-wrap gap-2">
    {#each options as option (option.value)}
      <label class="choice">
        <input
          {type}
          {name}
          value={option.value}
          checked={selected.includes(option.value)}
          onchange={(event) => onchange?.(option.value, event.currentTarget.checked)}
          class="sr-only"
        />
        {option.label}
      </label>
    {/each}
  </div>
  {#if error}
    <p id="{name}-error" class="text-sm text-destructive">{i18n.d.errors[error]}</p>
  {/if}
</fieldset>
