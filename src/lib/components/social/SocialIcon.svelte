<script lang="ts">
  import Briefcase from '@lucide/svelte/icons/briefcase';
  import Link from '@lucide/svelte/icons/link';
  import Ticket from '@lucide/svelte/icons/ticket';
  import {
    siBluesky,
    siFacebook,
    siInstagram,
    siLinktree,
    siMastodon,
    siMeetup,
    siSoundcloud,
    siSpotify,
    siTelegram,
    siThreads,
    siTiktok,
    siVimeo,
    siWhatsapp,
    siX,
    siYoutube,
    type SimpleIcon
  } from 'simple-icons';
  import type { SocialPlatform } from '$lib/social';

  // Lucide dropped brand glyphs, so platform logos come from simple-icons.
  // LinkedIn and Eventbrite asked simple-icons to remove theirs, so those two
  // get a generic Lucide glyph instead.
  const ICONS: Record<SocialPlatform, SimpleIcon | typeof Link> = {
    instagram: siInstagram,
    facebook: siFacebook,
    whatsapp: siWhatsapp,
    telegram: siTelegram,
    youtube: siYoutube,
    tiktok: siTiktok,
    x: siX,
    bluesky: siBluesky,
    threads: siThreads,
    mastodon: siMastodon,
    linkedin: Briefcase,
    spotify: siSpotify,
    soundcloud: siSoundcloud,
    vimeo: siVimeo,
    linktree: siLinktree,
    meetup: siMeetup,
    eventbrite: Ticket
  };

  type Props = { platform: SocialPlatform | null; size?: number; class?: string };
  let { platform, size = 16, class: className }: Props = $props();

  const icon = $derived(platform ? ICONS[platform] : Link);
</script>

{#if 'path' in icon}
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    aria-hidden="true"
    class={className}
  >
    <path d={icon.path} />
  </svg>
{:else}
  {@const Glyph = icon}
  <Glyph {size} aria-hidden="true" class={className} />
{/if}
