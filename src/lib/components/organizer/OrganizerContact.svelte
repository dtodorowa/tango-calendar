<script lang="ts">
  import Globe from '@lucide/svelte/icons/globe';
  import Mail from '@lucide/svelte/icons/mail';
  import Phone from '@lucide/svelte/icons/phone';
  import { websiteLabel } from '$lib/components/calendar/links';
  import SocialLinks from '$lib/components/social/SocialLinks.svelte';
  import type { Organization } from '$lib/types';

  type Props = { organization: Organization };
  let { organization }: Props = $props();
</script>

{#if organization.phone}
  <a
    href="tel:{organization.phone.replace(/\s/g, '')}"
    class="flex items-center gap-2 hover:text-primary"
  >
    <Phone size={15} class="text-muted-foreground" />
    {organization.phone}
  </a>
{/if}
{#if organization.email}
  <a
    href="mailto:{organization.email}"
    class="flex items-center gap-2 break-all hover:text-primary"
  >
    <Mail size={15} class="shrink-0 text-muted-foreground" />
    {organization.email}
  </a>
{/if}
{#if organization.website}
  <a
    href={organization.website}
    target="_blank"
    rel="noopener"
    class="flex items-center gap-2 hover:text-primary"
  >
    <Globe size={15} class="text-muted-foreground" />
    {websiteLabel(organization.website)}
  </a>
{/if}
{#if organization.socialLinks?.length}
  <SocialLinks links={organization.socialLinks} class="pt-1" />
{/if}
