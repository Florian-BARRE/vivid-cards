import { describe, expect, it } from 'vitest';
import { capitalize, shortenSiblingNames } from '../src/core/naming';

describe('shortenSiblingNames', () => {
  it('drops the words shared at the start and at the end', () => {
    expect(
      shortenSiblingNames(['salon-ambilight-wled', 'salon-buffet-wled', 'salon-canape-wled']),
    ).toEqual(['Ambilight', 'Buffet', 'Canape']);
  });

  it('keeps multi-word middles readable', () => {
    expect(shortenSiblingNames(['salon-tv-gauche-wled', 'salon-tv-droite-wled'])).toEqual([
      'Gauche',
      'Droite',
    ]);
    expect(shortenSiblingNames(['Living room TV strip', 'Living room shelf strip'])).toEqual([
      'TV',
      'Shelf',
    ]);
  });

  it('treats spaces, dashes and underscores alike and ignores case', () => {
    expect(shortenSiblingNames(['Salon_Buffet WLED', 'salon-canape-wled'])).toEqual([
      'Buffet',
      'Canape',
    ]);
  });

  it('always keeps at least one word', () => {
    expect(shortenSiblingNames(['salon-wled', 'salon-wled'])).toEqual(['Wled', 'Wled']);
    expect(shortenSiblingNames(['kitchen', 'kitchen-island'])).toEqual([
      'Kitchen',
      'Kitchen island',
    ]);
  });

  it('leaves names without a common part untouched but capitalized', () => {
    expect(shortenSiblingNames(['desk', 'bed'])).toEqual(['Desk', 'Bed']);
  });

  it('only capitalizes a single name', () => {
    expect(shortenSiblingNames(['salon-buffet-wled'])).toEqual(['Salon-buffet-wled']);
  });
});

describe('capitalize', () => {
  it('upper-cases the first letter only', () => {
    expect(capitalize('tV gauche')).toBe('TV gauche');
    expect(capitalize('écran')).toBe('Écran');
    expect(capitalize('')).toBe('');
  });
});
