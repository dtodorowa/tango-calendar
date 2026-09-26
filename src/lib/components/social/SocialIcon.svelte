<script lang="ts">
  import Link from '@lucide/svelte/icons/link';
  import {
    siBluesky,
    siFacebook,
    siInstagram,
    siTelegram,
    siThreads,
    siTiktok,
    siWhatsapp,
    siX,
    siYoutube,
    type SimpleIcon
  } from 'simple-icons';
  import type { SocialPlatform } from '$lib/social';

  // Lucide dropped brand glyphs, so platform logos come from simple-icons.
  const ICONS: Record<SocialPlatform, SimpleIcon> = {
    instagram: siInstagram,
    facebook: siFacebook,
    whatsapp: siWhatsapp,
    telegram: siTelegram,
    youtube: siYoutube,
    tiktok: siTiktok,
    x: siX,
    bluesky: siBluesky,
    threads: siThreads
  };

  type Props = { platform: SocialPlatform | null; size?: number; class?: string };
  let { platform, size = 16, class: className }: Props = $props();
</script>

{#if platform}
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    aria-hidden="true"
    class={className}
  >
    <path d={ICONS[platform].path} />
  </svg>
{:else}
  <Link {size} aria-hidden="true" class={className} />
{/if}
