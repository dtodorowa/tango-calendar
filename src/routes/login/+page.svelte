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
          aria-invalid={form?.error ? 'true' : undefined}
          aria-describedby={form?.error ? 'login-error' : undefined}
        />
      </div>
      {#if form?.error}
        <p id="login-error" class="text-sm text-destructive">{d.errors[form.error]}</p>
      {/if}
      <Button type="submit" class="h-11" disabled={pending}>{d.login.sendCode}</Button>
    </form>
  {:else}
    <form
      method="POST"
      action="?/verify&{nextParam}"
      use:enhance={submitting}
      class="surface flex flex-col gap-4 p-5"
    >
      <p class="text-sm">{d.login.codeSent(email)}</p>
      <input type="hidden" name="email" value={email} />
      <div class="flex flex-col gap-2">
        <Label for="code">{d.login.code}</Label>
        <Input
          id="code"
          name="code"
          inputmode="numeric"
          autocomplete="one-time-code"
          pattern="[0-9]{'{'}6{'}'}"
          maxlength={6}
          required
          class="h-12 bg-card text-center text-step1 tracking-[0.5em]"
          aria-invalid={form?.error ? 'true' : undefined}
          aria-describedby={form?.error ? 'login-error' : undefined}
        />
      </div>
      {#if form?.error}
        <p id="login-error" class="text-sm text-destructive">{d.errors[form.error]}</p>
      {/if}
      <Button type="submit" class="h-11" disabled={pending}>{d.login.verify}</Button>
      <button
        type="button"
        class="self-start text-sm text-primary hover:underline"
        onclick={() => (restarted = true)}
      >
        {d.login.otherEmail}
      </button>
    </form>
  {/if}
</main>
