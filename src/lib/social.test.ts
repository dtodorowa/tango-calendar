import { describe, expect, it } from 'vitest';
import { normalizeLink, socialPlatform, splitLinks } from './social';

describe('socialPlatform', () => {
  it('recognises platforms by host, subdomains included', () => {
    expect(socialPlatform('https://www.instagram.com/tangosaar/')).toBe('instagram');
    expect(socialPlatform('https://m.facebook.com/groups/123')).toBe('facebook');
    expect(socialPlatform('https://wa.me/491700000000')).toBe('whatsapp');
    expect(socialPlatform('https://whatsapp.com/channel/abc')).toBe('whatsapp');
    expect(socialPlatform('https://t.me/tangolux')).toBe('telegram');
    expect(socialPlatform('https://twitter.com/tango')).toBe('x');
  });

  it('returns null for other sites and lookalike hosts', () => {
    expect(socialPlatform('https://tango-saar.example.org')).toBeNull();
    expect(socialPlatform('https://notinstagram.com/x')).toBeNull();
    expect(socialPlatform('https://instagram.com.evil.example/x')).toBeNull();
    expect(socialPlatform('not a url')).toBeNull();
  });
});

describe('socialPlatform, newer platforms', () => {
  it('recognises the added hosts', () => {
    expect(socialPlatform('https://www.linkedin.com/company/tango')).toBe('linkedin');
    expect(socialPlatform('https://open.spotify.com/playlist/abc')).toBe('spotify');
    expect(socialPlatform('https://soundcloud.com/dj-tango')).toBe('soundcloud');
    expect(socialPlatform('https://vimeo.com/123')).toBe('vimeo');
    expect(socialPlatform('https://linktr.ee/tangosaar')).toBe('linktree');
    expect(socialPlatform('https://www.meetup.com/tango-saar/')).toBe('meetup');
    expect(socialPlatform('https://www.eventbrite.de/o/tango-123')).toBe('eventbrite');
  });

  it('reads a /@user profile on an unknown host as Mastodon', () => {
    expect(socialPlatform('https://mastodon.social/@tango')).toBe('mastodon');
    expect(socialPlatform('https://tanz.social/@milonga')).toBe('mastodon');
    expect(socialPlatform('https://medium.com/@tango')).toBeNull();
    expect(socialPlatform('https://www.youtube.com/@tango')).toBe('youtube');
    expect(socialPlatform('https://tanz.social/@milonga/12345')).toBeNull();
  });
});

describe('normalizeLink', () => {
  it('adds https:// when the scheme is missing', () => {
    expect(normalizeLink(' instagram.com/tangosaar ')).toBe('https://instagram.com/tangosaar');
    expect(normalizeLink('//t.me/x')).toBe('https://t.me/x');
  });

  it('leaves full URLs and blanks alone', () => {
    expect(normalizeLink('http://example.org')).toBe('http://example.org');
    expect(normalizeLink('  ')).toBe('');
  });
});

describe('splitLinks', () => {
  it('splits pasted text into one link each', () => {
    expect(splitLinks('instagram.com/a\nhttps://facebook.com/b, t.me/c')).toEqual([
      'https://instagram.com/a',
      'https://facebook.com/b',
      'https://t.me/c'
    ]);
    expect(splitLinks('https://wa.me/49170')).toEqual(['https://wa.me/49170']);
    expect(splitLinks('  \n ')).toEqual([]);
  });
});
