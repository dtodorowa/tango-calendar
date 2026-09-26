// Uploaded images: storage keys, size variants and public URLs. Pure: the storage
// base URL is passed in, so this runs the same in tests, on the server and in the
// browser.

export const MEDIA_BUCKET = 'media';

/** Largest file the browser sends after downscaling; stays under Vercel's 4.5 MB body cap. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** Long edge the browser shrinks photos to before upload. */
export const UPLOAD_MAX_EDGE = 2400;

export type MediaKind = 'events' | 'logo';

/** Output sizes per kind. `square` crops to fill; otherwise the width is capped. */
export const VARIANTS = {
  events: { card: { width: 640 }, full: { width: 1600 } },
  logo: { logo: { width: 256, square: true } }
} as const satisfies Record<MediaKind, Record<string, { width: number; square?: boolean }>>;

export type EventPhotoVariant = keyof (typeof VARIANTS)['events'];

/** Resolved URLs for an event photo. */
export type Photo = Record<EventPhotoVariant, string>;

export function mediaKey(orgId: string, kind: MediaKind, id: string): string {
  return `${orgId}/${kind}/${id}`;
}

export function variantPath(key: string, variant: string): string {
  return `${key}-${variant}.webp`;
}

/** All object paths stored for a key, e.g. to delete an image completely. */
export function variantPaths(key: string, kind: MediaKind): string[] {
  return Object.keys(VARIANTS[kind]).map((variant) => variantPath(key, variant));
}

function publicUrl(storageBase: string, path: string): string {
  return `${storageBase.replace(/\/$/, '')}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
}

export function photoUrls(storageBase: string, key: string | null): Photo | null {
  if (!key) return null;
  return {
    card: publicUrl(storageBase, variantPath(key, 'card')),
    full: publicUrl(storageBase, variantPath(key, 'full'))
  };
}

export function logoUrl(storageBase: string, key: string | null): string | null {
  return key ? publicUrl(storageBase, variantPath(key, 'logo')) : null;
}

/** Why an upload is refused before decoding, or null if it may be processed. */
export function uploadProblem(file: {
  size: number;
  type: string;
}): 'imageTooLarge' | 'invalidImage' | null {
  if (file.size > MAX_UPLOAD_BYTES) return 'imageTooLarge';
  if (!file.type.startsWith('image/')) return 'invalidImage';
  return null;
}

/** Size that fits `width` x `height` inside a `maxEdge` square, never upscaling. */
export function fitWithin(
  width: number,
  height: number,
  maxEdge: number
): { width: number; height: number } {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}
