<script lang="ts">
  import Plus from '@lucide/svelte/icons/plus';
  import X from '@lucide/svelte/icons/x';
  import SocialIcon from '$lib/components/social/SocialIcon.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { getI18n } from '$lib/i18n/context';
  import { MAX_SOCIAL_LINKS, socialPlatform } from '$lib/social';
  import type { FieldErrors } from '$lib/validation';

  type Props = { links: string[]; errors?: FieldErrors };
  let { links: initial, errors = {} }: Props = $props();

  const i18n = getI18n();
  const d = $derived(i18n.d);

  // Writable derived: local add/remove edits stick until the form round-trips new values.
  let links = $derived(initial.length ? [...initial] : ['']);
</script>

<fieldset class="flex flex-col gap-1.5" aria-describedby="org-social-hint">
  <legend class="mb-1.5 text-sm font-medium">{d.organizer.socialLinks}</legend>
  <ul class="flex flex-col gap-2">
    {#each links as _, index (index)}
      {@const error = errors[`socialLinks.${index}`]}
      <li class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <span
            class="flex size-10 shrink-0 items-center justify-center rounded-full border bg-card text-muted-foreground"
          >
            <SocialIcon platform={socialPlatform(links[index])} />
          </span>
          <Input
            name="socialLinks"
            type="url"
            placeholder="https://instagram.com/…"
            aria-label="{d.organizer.socialLink} {index + 1}"
            aria-describedby={error ? `org-social-${index}-error` : undefined}
            aria-invalid={Boolean(error) || undefined}
            bind:value={links[index]}
            class="h-10 bg-card"
          />
          {#if links.length > 1 || links[0]}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={d.organizer.removeSocialLink}
              title={d.organizer.removeSocialLink}
              onclick={() => {
                links = links.length > 1 ? links.filter((_, other) => other !== index) : [''];
              }}
            >
              <X />
            </Button>
          {/if}
        </div>
        {#if error}
          <p id="org-social-{index}-error" class="text-sm text-destructive">
            {d.errors[error]}
          </p>
        {/if}
      </li>
    {/each}
  </ul>
  {#if links.length < MAX_SOCIAL_LINKS}
    <Button
      type="button"
      variant="ghost"
      class="gap-1.5 self-start px-2 text-primary"
      onclick={() => links.push('')}
    >
      <Plus />
      {d.organizer.addSocialLink}
    </Button>
  {/if}
  <p id="org-social-hint" class="text-xs text-muted-foreground">{d.organizer.socialLinksHint}</p>
  {#if errors.socialLinks}
    <p class="text-sm text-destructive">{d.errors[errors.socialLinks]}</p>
  {/if}
</fieldset>
