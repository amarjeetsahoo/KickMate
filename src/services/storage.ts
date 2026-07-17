import type { UserProfile, Theme } from '../types';

const STORAGE_KEY = 'kickmate_user';

const DEFAULT_PROFILE: UserProfile = {
  id: 'demo-user',
  name: 'Demo Fan',
  preferredLanguage: 'en',
  selectedStadium: null,
  theme: 'dark',
  accessibilityMode: false,
  largeText: false,
  highContrast: false,
};

/**
 * Load user profile from localStorage.
 * Returns defaults if no profile exists or parse fails.
 */
export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

/** Persist user profile to localStorage */
export function saveUserProfile(profile: Partial<UserProfile>): void {
  try {
    const current = loadUserProfile();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...profile }));
  } catch (err) {
    console.warn('[Storage] Failed to save profile:', err);
  }
}

/** Quick helpers for common profile fields */
export const storage = {
  getTheme: (): Theme => loadUserProfile().theme,
  setTheme: (theme: Theme) => saveUserProfile({ theme }),
  getLanguage: () => loadUserProfile().preferredLanguage,
  setLanguage: (lang: string) => saveUserProfile({ preferredLanguage: lang }),
  getStadium: () => loadUserProfile().selectedStadium,
  setStadium: (id: string) => saveUserProfile({ selectedStadium: id as UserProfile['selectedStadium'] }),
  isOnboarded: () => !!localStorage.getItem('kickmate_onboarded'),
  setOnboarded: () => localStorage.setItem('kickmate_onboarded', '1'),
  isLoggedIn: () => !!localStorage.getItem('kickmate_logged_in'),
  setLoggedIn: (v: boolean) => v
    ? localStorage.setItem('kickmate_logged_in', '1')
    : localStorage.removeItem('kickmate_logged_in'),
  /** Clear all session data — call on logout */
  logout: () => {
    localStorage.removeItem('kickmate_logged_in');
    localStorage.removeItem('kickmate_onboarded');
  },
};
