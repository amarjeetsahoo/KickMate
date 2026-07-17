import { useState } from 'react';
import { Settings, Shield, AlertTriangle, Users, Terminal } from 'lucide-react';

export function AdminConsolePage() {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '2026') {
      setIsAuthenticated(true);
    } else {
      alert('Invalid PIN');
      setPin('');
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', justifyContent: 'center' }}>
        <div className="surface-card" style={{ padding: '32px', textAlign: 'center', width: '100%', maxWidth: '320px' }}>
          <Shield size={48} color="var(--accent-red)" style={{ margin: '0 auto 16px' }} />
          <h1 className="h3" style={{ marginBottom: '8px' }}>Admin Access</h1>
          <p className="text-muted" style={{ marginBottom: '24px' }}>Enter PIN to access stadium controls.</p>
          
          <form onSubmit={handlePinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="password"
              placeholder="PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="input"
              style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.5rem', padding: '12px' }}
              maxLength={4}
              autoFocus
            />
            <button type="submit" className="btn btn-primary btn-full">
              Unlock Console
            </button>
          </form>
          <div style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Hint: 2026
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Terminal size={28} color="var(--accent-red)" />
          <h1 className="h2" style={{ margin: 0 }}>Command Center</h1>
        </div>
        <p className="text-muted">Master control for stadium operations.</p>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="surface-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Current Attendance</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Figtree' }}>72,451</div>
          <div style={{ color: 'var(--accent-green)', fontSize: '0.85rem' }}>98% Capacity</div>
        </div>
        <div className="surface-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Active Stewards</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Figtree' }}>412</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>All sectors covered</div>
        </div>
      </section>

      <section className="flex flex-col gap-md">
        <h3 className="h3">Quick Actions</h3>
        
        <div className="surface-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle color="var(--accent-amber)" />
            <div>
              <div style={{ fontWeight: 600 }}>Medical Alert Protocol</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Dispatch nearest response team</div>
            </div>
          </div>
          <button className="btn" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>Trigger</button>
        </div>

        <div className="surface-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users color="var(--accent-blue)" />
            <div>
              <div style={{ fontWeight: 600 }}>Gate Flow Control</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Reroute traffic from congested gates</div>
            </div>
          </div>
          <button className="btn" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>Manage</button>
        </div>

        <div className="surface-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Settings color="var(--text-primary)" />
            <div>
              <div style={{ fontWeight: 600 }}>System Overrides</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manual control of lighting & PA</div>
            </div>
          </div>
          <button className="btn" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>Open</button>
        </div>
      </section>
      
      <button 
        className="btn btn-ghost" 
        style={{ color: 'var(--accent-red)', marginTop: '16px' }}
        onClick={() => setIsAuthenticated(false)}
      >
        Lock Console
      </button>
    </main>
  );
}
