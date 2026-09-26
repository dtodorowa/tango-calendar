import { describe, expect, it } from 'vitest';
import { socialPlatform } from './social';

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
