import { useState, useEffect, useCallback } from 'react';
import { storage } from '../services/storage';
import type { Theme } from '../types';

/**
 * Theme hook — syncs dark/light mode to data-theme attribute on document root
 * and persists preference to localStorage.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => storage.getTheme());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    storage.setTheme(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme };
}
