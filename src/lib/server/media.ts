// Image uploads into the public `media` bucket. Uses the request's anon-key
// client, so storage RLS (0006_media.sql) decides whether the caller may write
// under this org's folder.

import sharp from 'sharp';
import {
  MEDIA_BUCKET,
  VARIANTS,
  mediaKey,
  uploadProblem,
  variantPath,
  variantPaths,
  type MediaKind
} from '$lib/media';
import type { AppSupabaseClient } from './supabase';

export type ImageChange = { kind: 'keep' } | { kind: 'remove' } | { kind: 'replace'; file: File };

/** The file input `name` plus its "remove" checkbox `${name}Remove`. */
export function readImageChange(form: FormData, name: string): ImageChange {
  const file = form.get(name);
  if (file instanceof File && file.size > 0) return { kind: 'replace', file };
  if (form.get(`${name}Remove`) === 'on') return { kind: 'remove' };
  return { kind: 'keep' };
}

export type StoreResult = { key: string } | { error: 'imageTooLarge' | 'invalidImage' | 'generic' };

/** Re-encodes to webp in every variant size and uploads. EXIF (incl. GPS) is dropped. */
export async function storeImage(
  client: AppSupabaseClient,
  orgId: string,
  kind: MediaKind,
  file: File
): Promise<StoreResult> {
  const problem = uploadProblem(file);
  if (problem) return { error: problem };

  const key = mediaKey(orgId, kind, crypto.randomUUID());
  const input = Buffer.from(await file.arrayBuffer());
  let outputs: { path: string; body: Buffer }[];
  try {
    outputs = await Promise.all(
      Object.entries(VARIANTS[kind]).map(async ([variant, size]) => {
        const square = 'square' in size && size.square;
        const body = await sharp(input)
          .rotate()
          .resize(
            square
              ? { width: size.width, height: size.width, fit: 'cover' }
              : { width: size.width, withoutEnlargement: true }
          )
          .webp({ quality: 80 })
          .toBuffer();
        return { path: variantPath(key, variant), body };
      })
    );
  } catch {
    return { error: 'invalidImage' };
  }

  const bucket = client.storage.from(MEDIA_BUCKET);
  for (const { path, body } of outputs) {
    const { error } = await bucket.upload(path, body, {
      contentType: 'image/webp',
      // Keys are never reused, so the files can be cached forever.
      cacheControl: '31536000'
    });
    if (error) {
      await removeImage(client, key, kind);
      return { error: 'generic' };
    }
  }
  return { key };
}

/** Best effort: a leftover file only costs storage, so failures are swallowed. */
export async function removeImage(
  client: AppSupabaseClient,
  key: string | null,
  kind: MediaKind
): Promise<void> {
  if (!key) return;
  await client.storage.from(MEDIA_BUCKET).remove(variantPaths(key, kind));
}

/**
 * Uploads a replacement before the row is written. `key` is the new column value;
 * absent means "leave the column alone". Pair with `finishImageChange` once the
 * row write has succeeded or failed.
 */
export async function prepareImage(
  client: AppSupabaseClient,
  orgId: string,
  kind: MediaKind,
  change: ImageChange
): Promise<{ key?: string | null } | { error: 'imageTooLarge' | 'invalidImage' | 'generic' }> {
  if (change.kind === 'keep') return {};
  if (change.kind === 'remove') return { key: null };
  return storeImage(client, orgId, kind, change.file);
}

/** Drops the old files after a successful write, or the new upload after a failed one. */
export async function finishImageChange(
  client: AppSupabaseClient,
  kind: MediaKind,
  prepared: { key?: string | null },
  previousKey: string | null,
  saved: boolean
): Promise<void> {
  if (prepared.key === undefined) return;
  await removeImage(client, saved ? previousKey : prepared.key, kind);
}
