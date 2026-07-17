// =============================================================================
// KickMate Global Type Definitions
// =============================================================================

// ── Stadiums ─────────────────────────────────────────────────────────────────

export type StadiumId = 'sofi' | 'atnt' | 'metlife';

export interface StadiumZone {
  id: string;
  label: string;
  type: 'section' | 'food' | 'toilet' | 'medical' | 'exit' | 'gate' | 'parking';
  x: number; // SVG coordinate
  y: number;
  z?: number; // 3D height coordinate
  accessible?: boolean;
}

export interface NavigationStep {
  id: string;
  instruction: string;
  landmark?: string;
  floor?: number;
  status: 'completed' | 'current' | 'upcoming';
  accessible?: boolean;
}

export interface Stadium {
  id: StadiumId;
  name: string;
  city: string;
  state: string;
  country: string;
  capacity: number;
  coordinates: { lat: number; lng: number };
  gates: string[];
  parkingZones: ParkingZone[];
  zones: StadiumZone[];
}

// ── Navigation ────────────────────────────────────────────────────────────────

export interface SeatInfo {
  section: string;
  row: string;
  seat: string;
  gate: string;
  level: number;
}

export interface NavigationRoute {
  from: string;
  to: string;
  steps: NavigationStep[];
  estimatedMinutes: number;
  isAccessible: boolean;
  dotPath: Array<{ x: number; y: number }>;
}

export type DestinationType = 'seat' | 'food' | 'toilet' | 'medical' | 'exit';

// ── Parking ───────────────────────────────────────────────────────────────────

export type ParkingStatus = 'open' | 'filling' | 'full';

export interface ParkingZone {
  id: string;
  name: string;
  status: ParkingStatus;
  capacity: number;
  occupied: number;
  walkMinutes: number;
  nearGate: string;
  coordinates: { lat: number; lng: number };
}

// ── Translation ───────────────────────────────────────────────────────────────

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

export interface TranslationMessage {
  id: string;
  originalText: string;
  translatedText: string;
  fromLang: string;
  toLang: string;
  direction: 'a-to-b' | 'b-to-a';
  timestamp: Date;
  audioUrl?: string;
}

// ── Match ─────────────────────────────────────────────────────────────────────

export interface MatchTeam {
  name: string;
  code: string;
  flag: string;
  score: number;
}

export type MatchEventType = 'goal' | 'yellowCard' | 'redCard' | 'substitution' | 'penalty';

export interface MatchEvent {
  id: string;
  minute: number;
  type: MatchEventType;
  player: string;
  team: 'home' | 'away';
  description: string;
}

export interface MatchStats {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
}

export interface LiveMatch {
  id: string;
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  minute: number;
  status: 'pre' | 'live' | 'halftime' | 'fulltime';
  stadium: string;
  events: MatchEvent[];
  stats: MatchStats;
}

// ── SOS / Alerts ──────────────────────────────────────────────────────────────

export type AlertType = 'medical' | 'spill' | 'security' | 'general';

export interface SOSAlert {
  id: string;
  type: AlertType;
  seatInfo?: Partial<SeatInfo>;
  stadium?: string;
  timestamp: Date;
  status: 'pending' | 'acknowledged' | 'resolved';
  estimatedMinutes: number;
}

// ── App State ─────────────────────────────────────────────────────────────────

export type Theme = 'dark' | 'light';

export interface UserProfile {
  id: string;
  name: string;
  preferredLanguage: string;
  selectedStadium: StadiumId | null;
  theme: Theme;
  accessibilityMode: boolean;
  largeText: boolean;
  highContrast: boolean;
  seatInfo?: Partial<SeatInfo>;
}

// ── Gemini ────────────────────────────────────────────────────────────────────

export interface GeminiRequest {
  prompt: string;
  imageBase64?: string;
  systemPrompt?: string;
  model?: string;
}

export interface GeminiResponse {
  text: string;
  error?: string;
}
