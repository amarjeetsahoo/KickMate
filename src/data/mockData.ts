import type { LiveMatch, SOSAlert } from '../types';

/**
 * Mock live match data simulating FIFA World Cup 2026 real-time feed.
 * In production, this would be replaced by football-data.org or ESPN API.
 */
export const MOCK_LIVE_MATCH: LiveMatch = {
  id: 'wc2026-sf-01',
  homeTeam: { name: 'Brazil',    code: 'BRA', flag: '🇧🇷', score: 2 },
  awayTeam: { name: 'Argentina', code: 'ARG', flag: '🇦🇷', score: 1 },
  minute: 67,
  status: 'live',
  stadium: 'SoFi Stadium, Los Angeles',
  events: [
    { id: 'e1', minute: 67, type: 'goal',         player: 'Messi',    team: 'away', description: '⚽ GOAL! Messi fires from the left edge!' },
    { id: 'e2', minute: 45, type: 'yellowCard',   player: 'Casemiro', team: 'home', description: '🟨 Yellow card – Casemiro (Brazil)' },
    { id: 'e3', minute: 38, type: 'goal',         player: 'Neymar',   team: 'home', description: '⚽ GOAL! Neymar with a stunning free kick!' },
    { id: 'e4', minute: 32, type: 'substitution', player: 'Firmino',  team: 'home', description: '🔄 Firmino on, Richarlison off (Brazil)' },
    { id: 'e5', minute: 12, type: 'goal',         player: 'Lautaro',  team: 'away', description: '⚽ GOAL! Lautaro with the opener!' },
  ],
  stats: {
    possession:    { home: 52, away: 48 },
    shots:         { home: 8,  away: 6  },
    shotsOnTarget: { home: 4,  away: 3  },
    corners:       { home: 4,  away: 3  },
    fouls:         { home: 6,  away: 8  },
  },
};

export const UPCOMING_MATCHES = [
  { id: 'um1', homeTeam: 'France',   awayTeam: 'Germany',  date: '2026-07-11', time: '15:00', stadium: 'AT&T Stadium',  homeFlag: '🇫🇷', awayFlag: '🇩🇪' },
  { id: 'um2', homeTeam: 'Spain',    awayTeam: 'Portugal', date: '2026-07-12', time: '19:30', stadium: 'MetLife Stadium', homeFlag: '🇪🇸', awayFlag: '🇵🇹' },
  { id: 'um3', homeTeam: 'England',  awayTeam: 'USA',      date: '2026-07-13', time: '17:00', stadium: 'SoFi Stadium',   homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', awayFlag: '🇺🇸' },
];

/** Generate a mock SOS alert with auto-populated stadium info */
export function createMockAlert(
  type: SOSAlert['type'],
  seatSection?: string,
  stadium?: string,
): SOSAlert {
  return {
    id: `sos-${Date.now()}`,
    type,
    seatInfo: seatSection ? { section: seatSection } : undefined,
    stadium: stadium ?? 'SoFi Stadium',
    timestamp: new Date(),
    status: 'pending',
    estimatedMinutes: type === 'medical' ? 2 : type === 'security' ? 3 : 5,
  };
}

/** Simulate real-time parking updates (oscillating occupancy) */
export function getSimulatedParkingStatus(baseOccupied: number, capacity: number) {
  const variance = Math.floor(Math.random() * 20) - 10;
  const occupied = Math.max(0, Math.min(capacity, baseOccupied + variance));
  const pct = occupied / capacity;
  return {
    occupied,
    status: pct < 0.6 ? 'open' : pct < 0.9 ? 'filling' : 'full',
  } as const;
}

/** AI assistant quick-reply suggestions */
export const ASSISTANT_SUGGESTIONS = [
  '🧭 How do I get to my seat?',
  '🍔 Where is the nearest food court?',
  '🚻 Where are the restrooms?',
  '🅿️ Is there parking available?',
  '🩺 Where is the medical room?',
  "⚽ What's the current score?",
  '♿ Is there an accessible route?',
  '🚪 Where are the exits?',
];

export const SUSTAINABILITY_TIPS = [
  '♻️ Dispose of cups at the green bins near Row G',
  '🌱 Choose vegetarian options to reduce your match-day footprint',
  '🚌 Using public transit today? You saved ~2.3 kg CO₂',
  '💧 Refill stations are at Gate A and Gate C – bring a reusable bottle',
  '🚂 Train + 🏟️ Stadium = Your greenest match-day combo',
];
