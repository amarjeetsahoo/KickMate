import { describe, it, expect, beforeEach } from 'vitest';
import { loadUserProfile, saveUserProfile, storage } from '../services/storage';

describe('Storage service', () => {
  beforeEach(() => localStorage.clear());

  it('returns default profile when no data stored', () => {
    const p = loadUserProfile();
    expect(p.preferredLanguage).toBe('en');
    expect(p.theme).toBe('dark');
    expect(p.selectedStadium).toBeNull();
  });

  it('saves and retrieves theme', () => {
    storage.setTheme('light');
    expect(storage.getTheme()).toBe('light');
  });

  it('saves and retrieves language', () => {
    storage.setLanguage('es');
    expect(storage.getLanguage()).toBe('es');
  });

  it('saves and retrieves stadium', () => {
    storage.setStadium('metlife');
    expect(storage.getStadium()).toBe('metlife');
  });

  it('tracks onboarded state', () => {
    expect(storage.isOnboarded()).toBe(false);
    storage.setOnboarded();
    expect(storage.isOnboarded()).toBe(true);
  });

  it('tracks login state', () => {
    expect(storage.isLoggedIn()).toBe(false);
    storage.setLoggedIn(true);
    expect(storage.isLoggedIn()).toBe(true);
    storage.setLoggedIn(false);
    expect(storage.isLoggedIn()).toBe(false);
  });

  it('merges partial profile updates', () => {
    saveUserProfile({ preferredLanguage: 'fr' });
    const p = loadUserProfile();
    expect(p.preferredLanguage).toBe('fr');
    expect(p.theme).toBe('dark'); // default preserved
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem('kickmate_user', 'not-valid-json');
    expect(() => loadUserProfile()).not.toThrow();
    const p = loadUserProfile();
    expect(p.preferredLanguage).toBe('en'); // fallback defaults
  });
});
