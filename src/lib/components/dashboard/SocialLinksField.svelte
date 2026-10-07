<script lang="ts">
  import { tick } from 'svelte';
  import Plus from '@lucide/svelte/icons/plus';
  import X from '@lucide/svelte/icons/x';
  import SocialIcon from '$lib/components/social/SocialIcon.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { getI18n } from '$lib/i18n/context';
  import {
    MAX_SOCIAL_LINKS,
    PLATFORM_NAMES,
    normalizeLink,
    socialPlatform,
    splitLinks
  } from '$lib/social';
  import type { FieldErrors } from '$lib/validation';

  type Props = { links: string[]; errors?: FieldErrors };
  let { links: initial, errors = {} }: Props = $props();

  const i18n = getI18n();
  const d = $derived(i18n.d);

  // Writable derived: local edits stick until the form round-trips new values.
  // A derived array is not deeply reactive, so every edit reassigns it.
  let links = $derived(initial.length ? [...initial] : ['']);

  function setRow(index: number, value: string) {
    links = links.with(index, value);
  }

  async function focusRow(index: number) {
    await tick();
    document.getElementById(`org-social-${index}`)?.focus();
  }

  function addRow() {
    links = [...links, ''];
    focusRow(links.length - 1);
  }

  function removeRow(index: number) {
    links = links.length > 1 ? links.filter((_, other) => other !== index) : [''];
  }

  // Pasting a block with several links fills one row per link, so organizers
  // can copy their whole link list from a bio or another site in one go.
  function pasteLinks(event: ClipboardEvent, index: number) {
    const pasted = splitLinks(event.clipboardData?.getData('text') ?? '');
    if (pasted.length < 2) return;
    event.preventDefault();
    const replaceCurrent = !links[index].trim();
    const next = [
      ...links.slice(0, replaceCurrent ? index : index + 1),
      ...pasted,
      ...links.slice(index + 1)
    ];
    links = next.slice(0, MAX_SOCIAL_LINKS);
    focusRow(Math.min(index + pasted.length - (replaceCurrent ? 1 : 0), links.length - 1));
  }
</script>

<fieldset class="flex flex-col gap-1.5" aria-describedby="org-social-hint">
  <legend class="mb-1.5 text-sm font-medium">{d.organizer.socialLinks}</legend>
  <p id="org-social-hint" class="mb-1 text-xs text-muted-foreground">
    {d.organizer.socialLinksHint(MAX_SOCIAL_LINKS)}
  </p>
  <ul class="flex flex-col gap-2">
    {#each links as _, index (index)}
      {@const error = errors[`socialLinks.${index}`]}
      {@const platform = socialPlatform(normalizeLink(links[index]))}
      <li class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <span
            class={[
              'flex size-10 shrink-0 items-center justify-center rounded-full border bg-card transition-colors',
              platform ? 'text-primary' : 'text-muted-foreground'
            ]}
            title={platform ? PLATFORM_NAMES[platform] : undefined}
          >
            <SocialIcon {platform} />
          </span>
          <Input
            id="org-social-{index}"
            name="socialLinks"
            type="text"
            inputmode="url"
            autocomplete="url"
            placeholder="instagram.com/…"
            aria-label="{d.organizer.socialLink} {index + 1}"
            aria-describedby={error ? `org-social-${index}-error` : undefined}
            aria-invalid={Boolean(error) || undefined}
            bind:value={() => links[index], (value) => setRow(index, value)}
            onblur={() => setRow(index, normalizeLink(links[index]))}
            onpaste={(event: ClipboardEvent) => pasteLinks(event, index)}
            class="h-10 bg-card"
          />
          {#if links.length > 1 || links[0]}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={d.organizer.removeSocialLink}
              title={d.organizer.removeSocialLink}
              onclick={() => removeRow(index)}
            >
              <X />
            </Button>
          {/if}
        </div>
        {#if error}
          <p id="org-social-{index}-error" class="pl-12 text-sm text-destructive">
            {d.errors[error]}
          </p>
        {:else if platform}
          <p class="pl-12 text-xs text-muted-foreground">{PLATFORM_NAMES[platform]}</p>
        {/if}
      </li>
    {/each}
  </ul>
  {#if links.length < MAX_SOCIAL_LINKS}
    <Button
      type="button"
      variant="outline"
      class="mt-1 h-10 w-full gap-1.5 border-dashed bg-card text-primary sm:w-auto sm:self-start"
      onclick={addRow}
    >
      <Plus />
      {d.organizer.addSocialLink}
    </Button>
  {/if}
  {#if errors.socialLinks}
    <p class="text-sm text-destructive">{d.errors[errors.socialLinks]}</p>
  {/if}
</fieldset>
