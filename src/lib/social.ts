// Organizer social links are stored as bare URLs; the platform is read off the
// host so a new network needs no schema change. Pure: no I/O.

export const SOCIAL_PLATFORMS = [
  'instagram',
  'facebook',
  'whatsapp',
  'telegram',
  'youtube',
  'tiktok',
  'x',
  'bluesky',
  'threads'
] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

/** Max links per organizer; mirrors the organizations.social_links check. */
export const MAX_SOCIAL_LINKS = 6;

const HOSTS: Record<SocialPlatform, string[]> = {
  instagram: ['instagram.com', 'instagr.am'],
  facebook: ['facebook.com', 'fb.com', 'fb.me'],
  whatsapp: ['whatsapp.com', 'wa.me'],
  telegram: ['t.me', 'telegram.me', 'telegram.org'],
  youtube: ['youtube.com', 'youtu.be'],
  tiktok: ['tiktok.com'],
  x: ['x.com', 'twitter.com'],
  bluesky: ['bsky.app'],
  threads: ['threads.net', 'threads.com']
};

/** Display names are brand names, identical in every locale. */
export const PLATFORM_NAMES: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  x: 'X',
  bluesky: 'Bluesky',
  threads: 'Threads'
};

/** The platform a profile URL belongs to, or null for any other site. */
export function socialPlatform(url: string): SocialPlatform | null {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
  for (const platform of SOCIAL_PLATFORMS) {
    if (HOSTS[platform].some((domain) => host === domain || host.endsWith(`.${domain}`))) {
      return platform;
    }
  }
  return null;
}
