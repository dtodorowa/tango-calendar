<script lang="ts">
  import { enhance } from '$app/forms';
  import AppHeader from '$lib/components/layout/AppHeader.svelte';
  import { Button } from '$lib/components/ui/button';
  import { getI18n } from '$lib/i18n/context';
  import { SITE } from '$lib/site';

  const i18n = getI18n();
  const d = $derived(i18n.d);

  let pending = $state(false);
</script>

<svelte:head>
  <title>{d.confirm.title} · {SITE.fullName}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<AppHeader />

<main class="mx-auto flex max-w-md flex-col gap-6 px-4 py-10">
  <div class="flex flex-col gap-2">
    <h1 class="font-display text-step3">{d.confirm.title}</h1>
    <p class="text-muted-foreground">{d.confirm.intro}</p>
  </div>

  <form
    method="POST"
    use:enhance={() => {
      pending = true;
      return async ({ update }) => {
        await update();
        pending = false;
      };
    }}
    class="surface flex flex-col gap-4 p-5"
  >
    <Button type="submit" class="h-11" disabled={pending}>{d.confirm.button}</Button>
  </form>
</main>
