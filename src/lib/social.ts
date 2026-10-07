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
  'threads',
  'mastodon',
  'linkedin',
  'spotify',
  'soundcloud',
  'vimeo',
  'linktree',
  'meetup',
  'eventbrite'
] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

/** Max links per organizer; mirrors the organizations.social_links check. */
export const MAX_SOCIAL_LINKS = 15;

const HOSTS: Record<SocialPlatform, string[]> = {
  instagram: ['instagram.com', 'instagr.am'],
  facebook: ['facebook.com', 'fb.com', 'fb.me'],
  whatsapp: ['whatsapp.com', 'wa.me'],
  telegram: ['t.me', 'telegram.me', 'telegram.org'],
  youtube: ['youtube.com', 'youtu.be'],
  tiktok: ['tiktok.com'],
  x: ['x.com', 'twitter.com'],
  bluesky: ['bsky.app'],
  threads: ['threads.net', 'threads.com'],
  mastodon: ['mastodon.social', 'mastodon.online', 'mstdn.social', 'mas.to', 'chaos.social'],
  linkedin: ['linkedin.com', 'lnkd.in'],
  spotify: ['spotify.com', 'spotify.link'],
  soundcloud: ['soundcloud.com'],
  vimeo: ['vimeo.com'],
  linktree: ['linktr.ee'],
  meetup: ['meetup.com'],
  eventbrite: [
    'eventbrite.com',
    'eventbrite.de',
    'eventbrite.fr',
    'eventbrite.be',
    'eventbrite.nl',
    'eventbrite.at',
    'eventbrite.ch',
    'eventbrite.co.uk'
  ]
};

// Mastodon runs on thousands of hosts, so an unknown host with a bare
// "/@user" profile path is read as Mastodon. These hosts use the same shape
// for something else.
const NOT_MASTODON = ['medium.com', 'substack.com'];
const MASTODON_PROFILE = /^\/@[\w.]+\/?$/;

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
  threads: 'Threads',
  mastodon: 'Mastodon',
  linkedin: 'LinkedIn',
  spotify: 'Spotify',
  soundcloud: 'SoundCloud',
  vimeo: 'Vimeo',
  linktree: 'Linktree',
  meetup: 'Meetup',
  eventbrite: 'Eventbrite'
};

function onDomain(host: string, domains: string[]): boolean {
  return domains.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

/** The platform a profile URL belongs to, or null for any other site. */
export function socialPlatform(url: string): SocialPlatform | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const host = parsed.hostname.toLowerCase();
  const platform = SOCIAL_PLATFORMS.find((candidate) => onDomain(host, HOSTS[candidate]));
  if (platform) return platform;
  if (MASTODON_PROFILE.test(parsed.pathname) && !onDomain(host, NOT_MASTODON)) return 'mastodon';
  return null;
}

/** "instagram.com/foo" -> "https://instagram.com/foo". Leaves blanks and full URLs alone. */
export function normalizeLink(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || /^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, '')}`;
}

/**
 * Pasted text with several links (one per line, or separated by spaces or
 * commas) as one normalized link each. A single link comes back as a
 * one-element list.
 */
export function splitLinks(text: string): string[] {
  return text
    .split(/[\s,;]+/)
    .map(normalizeLink)
    .filter(Boolean);
}
