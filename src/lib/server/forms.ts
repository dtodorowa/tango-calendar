import type { ErrorCode } from '$lib/i18n/dashboard';
import {
  organizerSchema,
  toFieldErrors,
  type FieldErrors,
  type OrganizerInput
} from '$lib/validation';

export type OrganizerValues = {
  name: string;
  email: string;
  phone: string;
  website: string;
  socialLinks: string[];
};

export type OrganizerFormResult =
  | { ok: true; input: OrganizerInput; values: OrganizerValues }
  | { ok: false; values: OrganizerValues; errors: FieldErrors; formError?: ErrorCode };

export async function readOrganizerForm(request: Request): Promise<OrganizerFormResult> {
  const form = await request.formData();
  const values = {
    name: String(form.get('name') ?? ''),
    email: String(form.get('email') ?? ''),
    phone: String(form.get('phone') ?? ''),
    website: String(form.get('website') ?? ''),
    socialLinks: form.getAll('socialLinks').map(String)
  };
  const parsed = organizerSchema.safeParse(values);
  if (!parsed.success) return { ok: false, values, errors: toFieldErrors(parsed.error) };
  return { ok: true, input: parsed.data, values };
}
