// Locale + messages shared through Svelte context so components don't need
// `t` threaded through every prop. The root layout sets it once.

import { getContext, setContext } from 'svelte';
import type { Locale } from '$lib/types';
import { dashboardMessages, type DashboardMessages } from './dashboard';
import { messages, type Messages } from './messages';

const KEY = Symbol('i18n');

export interface I18n {
  readonly locale: Locale;
  readonly t: Messages;
  /** Organizer-area copy. */
  readonly d: DashboardMessages;
}

export function setI18n(getLocale: () => Locale): void {
  setContext<I18n>(KEY, {
    get locale() {
      return getLocale();
    },
    get t() {
      return messages[getLocale()];
    },
    get d() {
      return dashboardMessages[getLocale()];
    }
  });
}

export function getI18n(): I18n {
  return getContext<I18n>(KEY);
}
