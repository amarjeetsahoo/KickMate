import { useState, useEffect } from 'react';
import { MOCK_LIVE_MATCH, UPCOMING_MATCHES } from '../data/mockData';
import type { LiveMatch, MatchEvent } from '../types';

const EVENT_ICONS: Record<string, string> = {
  goal: '⚽', yellowCard: '🟨', redCard: '🟥', substitution: '🔄', penalty: '⚽🎯',
};

function StatBar({ label, home, away }: { label: string; home: number; away: number }) {
  const total = home + away || 1;
  return (
    <div style={{ marginBottom: '10px' }}>
      <div className="flex justify-between text-xs text-muted" style={{ marginBottom: '4px' }}>
        <span>{home}</span>
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
        <span>{away}</span>
      </div>
      <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', gap: '2px' }}>
        <div style={{ flex: home / total, background: 'var(--accent-green)', borderRadius: '3px 0 0 3px' }} />
        <div style={{ flex: away / total, background: 'var(--accent-gold)', borderRadius: '0 3px 3px 0' }} />
      </div>
    </div>
  );
}

export function MatchPage() {
  const [match] = useState<LiveMatch>(MOCK_LIVE_MATCH);
  const [minute, setMinute] = useState(match.minute);

  // Simulate live minute ticking
  useEffect(() => {
    if (match.status !== 'live') return;
    const id = setInterval(() => setMinute((m) => m + 1), 60_000);
    return () => clearInterval(id);
  }, [match.status]);

  return (
    <main style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Live Match Card */}
      <section
        className="surface-card hex-bg"
        style={{ padding: '20px', background: 'linear-gradient(135deg, var(--bg-card), var(--bg-surface))' }}
        aria-label={`Live match: ${match.homeTeam.name} vs ${match.awayTeam.name}`}
      >
        <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
          <span className="badge badge-live" aria-label={`Live, minute ${minute}`}>● LIVE {minute}'</span>
          <span className="text-xs text-muted">{match.stadium}</span>
        </div>

        <div
          className="flex items-center justify-between"
          style={{ padding: '0 8px' }}
        >
          {/* Home team */}
          <div className="text-center" style={{ flex: 1 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '6px' }} aria-hidden>{match.homeTeam.flag}</div>
            <div style={{ fontFamily: 'Figtree', fontWeight: 700, fontSize: '0.875rem' }}>{match.homeTeam.name}</div>
            <div className="text-xs text-muted">{match.homeTeam.code}</div>
          </div>

          {/* Score */}
          <div className="text-center" style={{ flex: 1 }}>
            <div
              className="score-display"
              aria-label={`Score: ${match.homeTeam.score} to ${match.awayTeam.score}`}
            >
              {match.homeTeam.score}–{match.awayTeam.score}
            </div>
            <div className="text-xs text-muted" style={{ marginTop: '4px' }}>
              Half Time 45'
            </div>
          </div>

          {/* Away team */}
          <div className="text-center" style={{ flex: 1 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '6px' }} aria-hidden>{match.awayTeam.flag}</div>
            <div style={{ fontFamily: 'Figtree', fontWeight: 700, fontSize: '0.875rem' }}>{match.awayTeam.name}</div>
            <div className="text-xs text-muted">{match.awayTeam.code}</div>
          </div>
        </div>

        <hr className="pitch-divider" aria-hidden />

        {/* Stats */}
        <div aria-label="Match statistics">
          <StatBar label="Possession %" home={match.stats.possession.home} away={match.stats.possession.away} />
          <StatBar label="Shots" home={match.stats.shots.home} away={match.stats.shots.away} />
          <StatBar label="Corners" home={match.stats.corners.home} away={match.stats.corners.away} />
          <StatBar label="Fouls" home={match.stats.fouls.home} away={match.stats.fouls.away} />
        </div>
      </section>

      {/* Events Timeline */}
      <section aria-label="Match events timeline">
        <h2 className="h3" style={{ marginBottom: '12px' }}>⚡ Match Events</h2>
        <div
          className="flex flex-col gap-sm"
          role="log"
          aria-live="polite"
          aria-label="Live match events"
        >
          {match.events.map((event: MatchEvent) => (
            <div key={event.id} className="event-item">
              <span className="event-minute">{event.minute}'</span>
              <span style={{ fontSize: '1.1rem' }} aria-hidden>{EVENT_ICONS[event.type] ?? '•'}</span>
              <span className="text-sm" style={{ flex: 1, color: 'var(--text-secondary)' }}>
                {event.description}
              </span>
              <span
                className="badge badge-glass text-xs"
                style={{ color: event.team === 'home' ? 'var(--accent-green)' : 'var(--accent-gold)' }}
              >
                {event.team === 'home' ? match.homeTeam.code : match.awayTeam.code}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming matches */}
      <section aria-label="Upcoming matches">
        <h2 className="h3" style={{ marginBottom: '12px' }}>📅 Upcoming Matches</h2>
        <div className="flex flex-col gap-sm">
          {UPCOMING_MATCHES.map((um) => (
            <div key={um.id} className="surface-card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'Figtree', fontWeight: 600, fontSize: '0.9rem' }}>
                  {um.homeFlag} {um.homeTeam} <span className="text-muted">vs</span> {um.awayTeam} {um.awayFlag}
                </div>
                <div className="text-xs text-muted">{um.stadium}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-green">{um.date}</div>
                <div className="text-xs text-muted">{um.time} ET</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
