import { describe, expect, it } from 'vitest';
import { pickerLanguage, pickerText } from '../src/i18n/picker';

const storage = (value: string | null) => ({ getItem: () => value });

describe('card picker language', () => {
  it('takes the language stored by Home Assistant, then the page, then the browser', () => {
    expect(pickerLanguage(storage('"fr"'), 'en', 'en-US')).toBe('fr');
    expect(pickerLanguage(storage(null), 'fr-FR', 'en-US')).toBe('fr');
    expect(pickerLanguage(storage('not json'), undefined, 'fr-CA')).toBe('fr');
    expect(pickerLanguage(undefined, undefined, undefined)).toBe('en');
  });

  it('translates a known entry and keeps English otherwise', () => {
    const bill = { name: 'Vivid bill', description: 'The bill in progress.' };
    expect(pickerText(bill, 'fr').name).toBe('Vivid facture');
    expect(pickerText(bill, 'en')).toBe(bill);
    expect(pickerText({ name: 'Unknown', description: '' }, 'fr').name).toBe('Unknown');
  });
});
