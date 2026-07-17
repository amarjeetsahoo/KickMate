import { useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { FORMATIONS } from '../data/formations';

export function SimulatorPage() {
  const [formationId, setFormationId] = useState<string>(FORMATIONS[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [minute, setMinute] = useState(0);

  const formation = FORMATIONS.find(f => f.id === formationId)!;

  const handleSimulate = () => {
    setIsPlaying(!isPlaying);
    // In a real app, this would trigger the AI match engine
  };

  const handleReset = () => {
    setIsPlaying(false);
    setMinute(0);
  };

  return (
    <main className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <header>
        <h1 className="h2">Match Simulator</h1>
        <p className="text-muted">Test formations against historical scenarios.</p>
      </header>

      {/* Pitch View */}
      <section className="simulator-pitch">
        {/* Pitch markings */}
        <div className="pitch-marking" style={{ top: 0, left: '50%', width: '2px', height: '100%', transform: 'translateX(-50%)' }} />
        <div className="pitch-marking" style={{ top: '50%', left: 0, width: '100%', height: '2px', transform: 'translateY(-50%)' }} />
        <div className="pitch-marking" style={{ top: '50%', left: '50%', width: '80px', height: '80px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.25)', transform: 'translate(-50%, -50%)', background: 'transparent' }} />
        
        {/* Penalty areas */}
        <div className="pitch-marking" style={{ top: 0, left: '20%', width: '60%', height: '18%', border: '2px solid rgba(255,255,255,0.25)', borderTop: 'none', background: 'transparent' }} />
        <div className="pitch-marking" style={{ bottom: 0, left: '20%', width: '60%', height: '18%', border: '2px solid rgba(255,255,255,0.25)', borderBottom: 'none', background: 'transparent' }} />

        {/* Players */}
        {formation.positions.map((pos, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: 'translate(-50%, -50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            zIndex: 10
          }}>
            <div className="player-token-3d" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.8)', marginTop: '4px', fontFamily: 'Figtree' }}>
              {pos.label}
            </span>
          </div>
        ))}
      </section>

      {/* Controls */}
      <section className="surface-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontFamily: 'Figtree', fontWeight: 700, color: 'var(--text-primary)' }}>
            {String(minute).padStart(2, '0')}:00
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-icon" onClick={handleReset} style={{ background: 'var(--bg-panel)' }}>
              <RotateCcw size={20} color="var(--text-primary)" />
            </button>
            <button className="btn btn-primary btn-icon" onClick={handleSimulate}>
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
          </div>
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Formation</label>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
            {FORMATIONS.map(f => (
              <button
                key={f.id}
                onClick={() => setFormationId(f.id)}
                className={`badge ${formationId === f.id ? 'badge-green' : 'badge-glass'}`}
                style={{ padding: '8px 16px', cursor: 'pointer', whiteSpace: 'nowrap', border: 'none' }}
              >
                {f.id}
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
