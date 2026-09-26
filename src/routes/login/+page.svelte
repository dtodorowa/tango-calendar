<script lang="ts">
  import { enhance } from '$app/forms';
  import AppHeader from '$lib/components/layout/AppHeader.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { getI18n } from '$lib/i18n/context';
  import { SITE } from '$lib/site';
  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();

  const i18n = getI18n();
  const d = $derived(i18n.d);

  let pending = $state(false);
  let restarted = $state(false);
  const step = $derived(restarted ? 'email' : (form?.step ?? 'email'));
  const email = $derived(form && 'email' in form ? (form.email ?? '') : '');
  const nextParam = $derived(`next=${encodeURIComponent(data.next)}`);
  // Only until the next submit, so a stale "link expired" doesn't linger.
  const emailError = $derived(form ? form.error : data.linkError);

  function submitting() {
    pending = true;
    restarted = false;
    return async ({ update }: { update: () => Promise<void> }) => {
      await update();
      pending = false;
    };
  }
</script>

<svelte:head>
  <title>{d.login.title} · {SITE.fullName}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<AppHeader />

<main class="mx-auto flex max-w-md flex-col gap-6 px-4 py-10">
  <div class="flex flex-col gap-2">
    <h1 class="font-display text-step3">{d.login.title}</h1>
    <p class="text-muted-foreground">{d.login.intro}</p>
  </div>

  {#if !data.configured}
    <p class="surface p-4 text-sm">{d.notConfiguredIntro}</p>
  {:else if step === 'email'}
    <form
      method="POST"
      action="?/send&{nextParam}"
      use:enhance={submitting}
      class="surface flex flex-col gap-4 p-5"
    >
      <div class="flex flex-col gap-2">
        <Label for="email">{d.login.email}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autocomplete="email"
          required
          value={email}
          class="h-11 bg-card"
          aria-invalid={emailError ? 'true' : undefined}
          aria-describedby={emailError ? 'login-error' : undefined}
        />
      </div>
      {#if emailError}
        <p id="login-error" class="text-sm text-destructive">{d.errors[emailError]}</p>
      {/if}
      <Button type="submit" class="h-11" disabled={pending}>{d.login.sendLink}</Button>
    </form>
  {:else}
    <div class="surface flex flex-col gap-4 p-5" role="status">
      <p class="text-sm">{d.login.linkSent(email)}</p>
      <button
        type="button"
        class="self-start text-sm text-primary hover:underline"
        onclick={() => (restarted = true)}
      >
        {d.login.otherEmail}
      </button>
    </div>
  {/if}
</main>
