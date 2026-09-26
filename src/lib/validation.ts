// Form schemas for sign-in and the organizer area. Issue messages are ErrorCode
// keys, so the UI shows the right copy in every locale. Pure: no I/O.

import { z } from 'zod';
import type { ErrorCode } from '$lib/i18n/dashboard';
import { COUNTRIES } from '$lib/i18n/dashboard';
import { ORDINALS, WEEKDAYS } from '$lib/repeat';
import { CATEGORIES, LOCALES, TAGS } from '$lib/types';

const code = (value: ErrorCode) => ({ message: value });

const requiredText = (max: number) =>
  z.string().trim().min(1, code('required')).max(max, code('tooLong'));

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, code('tooLong'))
    .transform((value) => value || null);

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, code('required'))
  .max(254, code('tooLong'))
  .email(code('invalidEmail'));

export const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, code('invalidCode'));

export const organizerSchema = z.object({
  name: requiredText(120),
  email: z
    .string()
    .trim()
    .max(254, code('tooLong'))
    .refine((value) => !value || z.email().safeParse(value).success, code('invalidEmail'))
    .transform((value) => value || null),
  phone: optionalText(40),
  website: z
    .string()
    .trim()
    .max(300, code('tooLong'))
    .refine((value) => !value || /^https?:\/\/\S+\.\S+/.test(value), code('invalidUrl'))
    .transform((value) => value || null)
});
export type OrganizerInput = z.output<typeof organizerSchema>;

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, code('invalidDate'));
const timeOfDay = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, code('invalidTime'));

const translation = z.object({
  title: optionalText(160),
  description: optionalText(4000),
  note: optionalText(120)
});

export const eventSchema = z
  .object({
    // z.guid, not z.uuid: seed ids are md5-derived and not RFC 4122 versioned.
    orgId: z.guid(code('required')),
    sourceLang: z.enum(LOCALES, code('required')),
    translations: z.object({ de: translation, en: translation, fr: translation }),
    categories: z.array(z.enum(CATEGORIES)).min(1, code('pickCategory')),
    tags: z.array(z.enum(TAGS)),
    date: dateKey,
    startTime: timeOfDay,
    endTime: timeOfDay,
    repeatKind: z.enum(['once', 'weekly', 'monthly', 'custom']),
    weekdays: z.array(z.enum(WEEKDAYS)),
    monthlyWeekday: z.enum(WEEKDAYS),
    ordinals: z.array(z.coerce.number().pipe(z.union(ORDINALS.map((o) => z.literal(o))))),
    until: z.union([z.literal(''), dateKey]).transform((value) => value || null),
    venueMode: z.enum(['saved', 'new']),
    venueId: z.string(),
    venueName: z.string().trim().max(120, code('tooLong')),
    venueAddress: z.string().trim().max(200, code('tooLong')),
    venueCity: z.string().trim().max(80, code('tooLong')),
    venueCountry: z.enum(COUNTRIES),
    priceKind: z.enum(['fixed', 'donation', 'free']),
    priceAmount: z
      .string()
      .trim()
      .transform((value) => (value === '' ? null : Number(value.replace(',', '.')))),
    publish: z.boolean()
  })
  .superRefine((input, context) => {
    const issue = (path: string, message: ErrorCode) =>
      context.addIssue({ code: 'custom', path: path.split('.'), message });

    if (!input.translations[input.sourceLang].title) {
      issue(`translations.${input.sourceLang}.title`, 'required');
    }
    if (input.repeatKind === 'weekly' && input.weekdays.length === 0) {
      issue('weekdays', 'pickWeekday');
    }
    if (input.repeatKind === 'monthly' && input.ordinals.length === 0) {
      issue('ordinals', 'pickOrdinal');
    }
    if (input.until && input.until < input.date) issue('until', 'untilBeforeStart');
    if (input.priceKind === 'fixed') {
      const amount = input.priceAmount;
      if (amount === null || !Number.isFinite(amount) || amount < 0 || amount > 9999) {
        issue('priceAmount', 'priceRequired');
      }
    }
    if (input.venueMode === 'saved' && !input.venueId) issue('venueId', 'required');
    if (input.venueMode === 'new') {
      if (!input.venueName) issue('venueName', 'required');
      if (!input.venueAddress) issue('venueAddress', 'required');
      if (!input.venueCity) issue('venueCity', 'required');
    }
  });
export type EventInput = z.output<typeof eventSchema>;

/** Field path ("translations.de.title") -> first error code for that field. */
export type FieldErrors = Record<string, ErrorCode>;

export function toFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.') || '_form';
    if (!errors[path]) errors[path] = issue.message as ErrorCode;
  }
  return errors;
}

/** Only same-site relative paths are allowed as post-login destinations. */
export function safeNext(raw: string | null | undefined, fallback = '/dashboard'): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) return fallback;
  return raw;
}
