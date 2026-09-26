<script lang="ts">
  import { page } from '$app/state';
  import { getI18n } from '$lib/i18n/context';
  import { LOCALE_NAMES } from '$lib/i18n/messages';
  import { LOCALES, type Locale } from '$lib/types';
  import { cn } from '$lib/utils';

  type Props = { class?: string };
  let { class: className }: Props = $props();

  const i18n = getI18n();

  function hrefFor(locale: Locale): string {
    const params = new URLSearchParams(page.url.searchParams);
    params.set('lang', locale);
    return `${page.url.pathname}?${params}`;
  }
</script>

<nav
  aria-label={i18n.t.language}
  class={cn('flex items-center rounded-full border bg-card p-0.5', className)}
>
  {#each LOCALES as locale (locale)}
    <!-- Full reload so <html lang> and every load re-resolve the locale. -->
    <a
      href={hrefFor(locale)}
      hreflang={locale}
      lang={locale}
      title={LOCALE_NAMES[locale]}
      aria-current={locale === i18n.locale ? 'true' : undefined}
      data-sveltekit-reload
      class={cn(
        'rounded-full px-2 py-1 text-xs font-semibold uppercase transition-colors',
        locale === i18n.locale
          ? 'bg-foreground text-background'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {locale}
    </a>
  {/each}
</nav>
