import { describe, it, expect } from 'vitest';
import { formatPrice, weekdayHeaders } from './format';
import { messages } from './i18n/messages';

describe('weekdayHeaders', () => {
  it('lists seven Monday-first names', () => {
    expect(weekdayHeaders('en')).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  });
});

describe('formatPrice', () => {
  it('labels free and donation, formats euros', () => {
    expect(formatPrice({ kind: 'free', amount: null }, 'de', messages.de)).toBe('Frei');
    expect(formatPrice({ kind: 'donation', amount: null }, 'fr', messages.fr)).toBe('Au chapeau');
    expect(formatPrice({ kind: 'fixed', amount: 8 }, 'en', messages.en)).toBe('€8');
  });
});
