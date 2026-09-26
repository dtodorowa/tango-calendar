<script lang="ts">
  import { websiteLabel } from '$lib/components/calendar/links';
  import { PLATFORM_NAMES, socialPlatform } from '$lib/social';
  import { cn } from '$lib/utils';
  import SocialIcon from './SocialIcon.svelte';

  type Props = { links: string[]; class?: string };
  let { links, class: className }: Props = $props();

  const items = $derived(
    links.map((url) => {
      const platform = socialPlatform(url);
      return { url, platform, name: platform ? PLATFORM_NAMES[platform] : websiteLabel(url) };
    })
  );
</script>

<ul class={cn('flex flex-wrap gap-2', className)}>
  {#each items as item (item.url)}
    <li>
      <a
        href={item.url}
        target="_blank"
        rel="noopener"
        aria-label={item.name}
        title={item.name}
        class="flex size-9 items-center justify-center rounded-full border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <SocialIcon platform={item.platform} />
      </a>
    </li>
  {/each}
</ul>
