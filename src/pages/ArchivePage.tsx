import { useState } from 'react';
import { TOURNAMENTS, type Tournament } from '../data/worldCupHistory';

export function ArchivePage() {
  const [selectedYear, setSelectedYear] = useState<number>(2022);

  const selectedTourney = TOURNAMENTS.find(t => t.year === selectedYear) as Tournament;

  return (
    <main className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header>
        <h1 className="h2">World Cup Archive</h1>
        <p className="text-muted">Relive the greatest moments in football history.</p>
      </header>

      {/* Interactive Timeline */}
      <section style={{ overflowX: 'auto', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', minWidth: 'min-content' }}>
          {TOURNAMENTS.map(t => (
            <button
              key={t.year}
              onClick={() => setSelectedYear(t.year)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                padding: '12px', minWidth: '80px',
                background: selectedYear === t.year ? 'var(--accent-gold-dim)' : 'var(--bg-panel)',
                border: `1px solid ${selectedYear === t.year ? 'var(--accent-gold)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer', transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontSize: '1.5rem', opacity: selectedYear === t.year ? 1 : 0.6 }}>{t.icon}</div>
              <div style={{
                fontFamily: 'Figtree', fontWeight: 700,
                color: selectedYear === t.year ? 'var(--accent-gold)' : 'var(--text-primary)'
              }}>{t.year}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Detail View */}
      <section className="surface-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
              {selectedTourney.host} {selectedTourney.year}
            </h2>
            <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: '1.1rem' }}>
              Champions: <strong style={{ color: 'var(--accent-gold)' }}>{selectedTourney.winner}</strong>
            </p>
          </div>
          <div style={{ fontSize: '4rem', lineHeight: 1, filter: 'drop-shadow(0 4px 12px rgba(255,215,0,0.3))' }}>
            {selectedTourney.icon}
          </div>
        </div>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          {selectedTourney.summary}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginTop: '8px' }}>
          <div style={{ background: 'var(--bg-panel)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Runner-Up</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>{selectedTourney.runnerUp}</div>
          </div>
          <div style={{ background: 'var(--bg-panel)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Golden Boot</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>{selectedTourney.goldenBoot}</div>
          </div>
          <div style={{ background: 'var(--bg-panel)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Best Player</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>{selectedTourney.bestPlayer}</div>
          </div>
        </div>
      </section>
    </main>
  );
}
