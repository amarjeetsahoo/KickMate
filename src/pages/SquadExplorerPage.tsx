import { useState, useMemo } from 'react';
import { Search, ChevronLeft } from 'lucide-react';
import { SQUADS, type Squad } from '../data/squads';

export function SquadExplorerPage() {
  const [selectedSquad, setSelectedSquad] = useState<Squad | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('ALL');

  const filteredPlayers = useMemo(() => {
    if (!selectedSquad) return [];
    return selectedSquad.players.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPos = positionFilter === 'ALL' || p.position === positionFilter;
      return matchesSearch && matchesPos;
    });
  }, [selectedSquad, searchQuery, positionFilter]);

  if (selectedSquad) {
    return (
      <main className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button
          className="btn btn-icon"
          style={{ alignSelf: 'flex-start', background: 'transparent', padding: 0 }}
          onClick={() => { setSelectedSquad(null); setSearchQuery(''); setPositionFilter('ALL'); }}
          aria-label="Back to squads"
        >
          <ChevronLeft size={24} /> Back to Teams
        </button>

        <header style={{ textAlign: 'center', margin: '8px 0' }}>
          <div style={{ fontSize: '3rem', lineHeight: 1 }}>{selectedSquad.flag}</div>
          <h1 className="h2">{selectedSquad.name}</h1>
          <p className="text-muted">Coach: {selectedSquad.coach} • {selectedSquad.group}</p>
        </header>

        <section className="flex flex-col gap-sm">
          <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', marginLeft: '8px', flex: 1, outline: 'none' }}
            />
          </div>
          
          <div className="flex gap-sm" style={{ overflowX: 'auto', paddingBottom: '4px' }}>
            {['ALL', 'GK', 'DEF', 'MID', 'FWD'].map(pos => (
              <button
                key={pos}
                className={`badge ${positionFilter === pos ? 'badge-green' : 'badge-glass'}`}
                onClick={() => setPositionFilter(pos)}
                style={{ flexShrink: 0, padding: '4px 12px', border: 'none' }}
              >
                {pos === 'ALL' ? 'All Positions' : pos}
              </button>
            ))}
          </div>
        </section>

        <section style={{ flex: 1, overflowY: 'auto' }}>
          <div className="flex flex-col gap-sm">
            {filteredPlayers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                No players found.
              </div>
            ) : (
              filteredPlayers.map(player => (
                <div key={player.id} className="surface-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '24px',
                    background: 'var(--bg-panel)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-green)', flexShrink: 0
                  }}>
                    {player.number}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{player.name}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                      {player.position} • {player.club}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{player.marketValue}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{player.caps} caps</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header>
        <h1 className="h2">Squad Explorer</h1>
        <p className="text-muted">Browse the 48 nations competing in the 2026 World Cup.</p>
      </header>

      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '16px'
      }}>
        {SQUADS.map(squad => (
          <button
            key={squad.code}
            className="surface-card hover-lift"
            onClick={() => setSelectedSquad(squad)}
            style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', border: '1px solid var(--border)', background: 'transparent' }}
          >
            <div style={{ fontSize: '3rem', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}>
              {squad.flag}
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{squad.name}</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{squad.group}</p>
            </div>
          </button>
        ))}
      </section>
    </main>
  );
}
