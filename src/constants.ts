// =============================================================================
// KickMate Application Constants
// Centralized configuration values to avoid magic strings and improve
// maintainability across the codebase.
// =============================================================================

// ── Stadium Display Names ────────────────────────────────────────────────────

/** Maps stadium IDs to their human-readable display names */
export const STADIUM_NAMES: Record<string, string> = {
  sofi: 'SoFi Stadium',
  atnt: 'AT&T Stadium',
  metlife: 'MetLife Stadium',
} as const;

/** Default stadium used when no selection has been made */
export const DEFAULT_STADIUM_ID = 'sofi';

// ── AI / Gemini Configuration ────────────────────────────────────────────────

/** Maximum characters allowed in a single user prompt */
export const MAX_PROMPT_LENGTH = 2000;

/** Maximum characters for agent coordinator queries */
export const MAX_QUERY_LENGTH = 500;

/** Rate limit: maximum requests per window */
export const RATE_LIMIT = 10;

/** Rate limit window duration in milliseconds (1 minute) */
export const RATE_WINDOW_MS = 60_000;

/** Cache time-to-live for Gemini API responses in milliseconds (5 minutes) */
export const CACHE_TTL_MS = 5 * 60_000;

// ── Notification Configuration ───────────────────────────────────────────────

/** Maximum notifications stored in memory to prevent unbounded growth */
export const MAX_NOTIFICATIONS = 100;

/** Interval between simulated demo notifications in milliseconds */
export const NOTIFICATION_INTERVAL_MS = 25_000;

// ── Navigation Tab Labels ────────────────────────────────────────────────────

/** Page titles displayed in the app header, keyed by navigation tab */
export const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  home:      { title: 'KickMate' },
  navigate:  { title: 'Stadium Navigator' },
  translate: { title: 'Translator' },
  match:     { title: 'Live Match' },
  social:    { title: 'Fan Wall' },
  food:      { title: 'Food & Merch' },
  more:      { title: 'More Features' },
  parking:   { title: 'Parking Assistant' },
  squads:    { title: 'Squad Explorer' },
  archive:   { title: 'Historical Archive' },
  simulator: { title: 'Match Simulator' },
  eco:       { title: 'Eco Hub' },
  admin:     { title: 'Admin Console' },
} as const;

// ── Accessibility Defaults ───────────────────────────────────────────────────

/** Default TTS speech rate for translated text playback */
export const DEFAULT_SPEECH_RATE = 0.95;

/** Social wall post character limit */
export const SOCIAL_POST_MAX_LENGTH = 140;

/** Quick Ask input character limit */
export const QUICK_ASK_MAX_LENGTH = 500;
