<script lang="ts">
  import CalendarDays from '@lucide/svelte/icons/calendar-days';
  import { getI18n } from '$lib/i18n/context';

  const i18n = getI18n();
</script>

<div class="surface flex flex-col items-center gap-2 px-6 py-14 text-center">
  <CalendarDays size={28} strokeWidth={1.5} class="text-muted-foreground" />
  <p class="font-display text-step1">{i18n.t.noEvents}</p>
  <p class="text-sm text-muted-foreground">{i18n.t.noEventsHint}</p>
</div>
