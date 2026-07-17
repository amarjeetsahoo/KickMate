import { describe, it, expect } from 'vitest';
import { LANGUAGES, getLanguageByCode, detectBrowserLanguage, OFFLINE_PHRASES } from '../data/languages';

describe('Languages data', () => {
  it('exports at least 10 languages', () => {
    expect(LANGUAGES.length).toBeGreaterThanOrEqual(10);
  });

  it('all languages have required fields', () => {
    LANGUAGES.forEach((l) => {
      expect(l.code).toBeTruthy();
      expect(l.name).toBeTruthy();
      expect(l.nativeName).toBeTruthy();
      expect(l.flag).toBeTruthy();
    });
  });

  it('English is the first language', () => {
    expect(LANGUAGES[0].code).toBe('en');
  });

  it('getLanguageByCode returns correct language', () => {
    expect(getLanguageByCode('es').name).toBe('Spanish');
    expect(getLanguageByCode('ar').rtl).toBe(true);
  });

  it('getLanguageByCode defaults to English for unknown code', () => {
    expect(getLanguageByCode('xx').code).toBe('en');
  });

  it('detectBrowserLanguage returns a valid language code', () => {
    const code = detectBrowserLanguage();
    const found = LANGUAGES.some((l) => l.code === code);
    expect(found).toBe(true);
  });

  it('offline phrases cover key scenarios', () => {
    const scenarios = ['where_seat', 'where_toilet', 'help', 'medical'];
    scenarios.forEach((key) => {
      expect(OFFLINE_PHRASES['en'][key]).toBeTruthy();
    });
  });
});
