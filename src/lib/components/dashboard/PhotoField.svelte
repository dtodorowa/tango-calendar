<script lang="ts">
  import ImagePlus from '@lucide/svelte/icons/image-plus';
  import { onDestroy } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { getI18n } from '$lib/i18n/context';
  import type { ErrorCode } from '$lib/i18n/dashboard';
  import { cn } from '$lib/utils';
  import { downscaleImage } from './downscale';

  type Props = {
    /** Form field name; the server reads `${name}` and `${name}Remove`. */
    name: string;
    label: string;
    hint: string;
    /** URL of the stored image, if any. */
    current: string | null;
    shape: 'wide' | 'round';
    error?: ErrorCode;
  };
  let { name, label, hint, current, shape, error }: Props = $props();

  const i18n = getI18n();
  const d = $derived(i18n.d);
  const id = $derived(`photo-${name}`);

  let input: HTMLInputElement | undefined = $state();
  let picked: string | null = $state(null);
  let removed = $state(false);
  let preparing = $state(false);

  const shown = $derived(picked ?? (removed ? null : current));

  function setPicked(url: string | null) {
    if (picked) URL.revokeObjectURL(picked);
    picked = url;
  }

  async function onchange() {
    const file = input?.files?.[0];
    if (!file || !input) return;
    preparing = true;
    const smaller = await downscaleImage(file);
    if (smaller !== file) {
      const transfer = new DataTransfer();
      transfer.items.add(smaller);
      input.files = transfer.files;
    }
    preparing = false;
    removed = false;
    setPicked(URL.createObjectURL(smaller));
  }

  function remove() {
    if (input) input.value = '';
    setPicked(null);
    removed = true;
  }

  onDestroy(() => setPicked(null));
</script>

<div class="flex flex-col gap-1.5">
  <span id="{id}-label" class="text-sm font-medium">{label}</span>
  <div class={cn('flex gap-4', shape === 'wide' ? 'flex-col' : 'items-center')}>
    <div
      class={cn(
        'grid shrink-0 place-items-center overflow-hidden border bg-muted text-muted-foreground',
        shape === 'wide' ? 'aspect-[2/1] w-full rounded-2xl' : 'size-20 rounded-full'
      )}
    >
      {#if shown}
        <img src={shown} alt="" class="size-full object-cover" />
      {:else}
        <ImagePlus size={shape === 'wide' ? 32 : 22} strokeWidth={1.5} aria-hidden="true" />
      {/if}
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        class="h-10 bg-card"
        disabled={preparing}
        onclick={() => input?.click()}
      >
        {preparing ? d.media.preparing : shown ? d.media.replace : d.media.choose}
      </Button>
      {#if shown}
        <Button type="button" variant="ghost" class="h-10" onclick={remove}>
          {d.media.remove}
        </Button>
      {/if}
    </div>
  </div>
  <input
    bind:this={input}
    {id}
    {name}
    type="file"
    accept="image/*"
    class="sr-only"
    tabindex="-1"
    aria-labelledby="{id}-label"
    aria-describedby="{id}-hint{error ? ` ${id}-error` : ''}"
    {onchange}
  />
  {#if removed && !picked}
    <input type="hidden" name="{name}Remove" value="on" />
  {/if}
  <p id="{id}-hint" class="text-xs text-muted-foreground">{hint}</p>
  {#if error}
    <p id="{id}-error" class="text-sm text-destructive">{d.errors[error]}</p>
  {/if}
</div>
