import { describe, expect, it } from 'vitest';
import { fitWithin, logoUrl, mediaKey, photoUrls, uploadProblem, variantPaths } from './media';

const base = 'https://abc.supabase.co/';
const key = mediaKey('org-1', 'events', 'img-1');

describe('media', () => {
  it('builds keys and every stored variant path', () => {
    expect(key).toBe('org-1/events/img-1');
    expect(variantPaths(key, 'events')).toEqual([
      'org-1/events/img-1-card.webp',
      'org-1/events/img-1-full.webp'
    ]);
    expect(variantPaths('org-1/logo/img-2', 'logo')).toEqual(['org-1/logo/img-2-logo.webp']);
  });

  it('resolves public URLs and passes null through', () => {
    expect(photoUrls(base, key)).toEqual({
      card: 'https://abc.supabase.co/storage/v1/object/public/media/org-1/events/img-1-card.webp',
      full: 'https://abc.supabase.co/storage/v1/object/public/media/org-1/events/img-1-full.webp'
    });
    expect(photoUrls(base, null)).toBeNull();
    expect(logoUrl(base, 'org-1/logo/img-2')).toBe(
      'https://abc.supabase.co/storage/v1/object/public/media/org-1/logo/img-2-logo.webp'
    );
    expect(logoUrl(base, null)).toBeNull();
  });
});

describe('uploadProblem', () => {
  it('refuses oversized and non-image files', () => {
    expect(uploadProblem({ size: 1000, type: 'image/jpeg' })).toBeNull();
    expect(uploadProblem({ size: 5 * 1024 * 1024, type: 'image/jpeg' })).toBe('imageTooLarge');
    expect(uploadProblem({ size: 1000, type: 'application/pdf' })).toBe('invalidImage');
  });
});

describe('fitWithin', () => {
  it('shrinks the long edge to the limit and never upscales', () => {
    expect(fitWithin(4032, 3024, 2400)).toEqual({ width: 2400, height: 1800 });
    expect(fitWithin(3024, 4032, 2400)).toEqual({ width: 1800, height: 2400 });
    expect(fitWithin(800, 600, 2400)).toEqual({ width: 800, height: 600 });
  });
});
