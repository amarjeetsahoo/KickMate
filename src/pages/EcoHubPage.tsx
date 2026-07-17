import { useState } from 'react';
import { Leaf, Droplet, Wind, Sun, Award } from 'lucide-react';

export function EcoHubPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'rewards'>('overview');

  return (
    <main className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Leaf size={28} color="var(--accent-green)" />
          <h1 className="h2" style={{ margin: 0 }}>Eco Hub</h1>
        </div>
        <p className="text-muted">Track the stadium's sustainability and your personal impact.</p>
      </header>

      <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-card)', padding: '4px', borderRadius: '8px' }}>
        <button
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ flex: 1, padding: '8px' }}
          onClick={() => setActiveTab('overview')}
        >
          Stadium Overview
        </button>
        <button
          className={`btn ${activeTab === 'rewards' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ flex: 1, padding: '8px' }}
          onClick={() => setActiveTab('rewards')}
        >
          My Impact
        </button>
      </div>

      {activeTab === 'overview' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="surface-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'var(--accent-green-dim)', borderRadius: '50%' }}>
              <Sun size={32} color="var(--accent-green)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: '0 0 4px', color: 'var(--text-primary)' }}>Solar Power</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-green)' }}>85%</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>of current stadium energy</p>
            </div>
          </div>

          <div className="surface-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '50%' }}>
              <Droplet size={32} color="rgb(59, 130, 246)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: '0 0 4px', color: 'var(--text-primary)' }}>Water Recycled</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'rgb(59, 130, 246)' }}>45,000 L</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>rainwater collected today</p>
            </div>
          </div>

          <div className="surface-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '50%' }}>
              <Wind size={32} color="rgb(245, 158, 11)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: '0 0 4px', color: 'var(--text-primary)' }}>Carbon Offset</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'rgb(245, 158, 11)' }}>12.4 tons</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>CO2 saved during this match</p>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'rewards' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="surface-card" style={{ padding: '24px', textAlign: 'center', background: 'linear-gradient(135deg, var(--bg-card), var(--accent-green-dim))' }}>
            <div style={{ fontSize: '3rem', margin: '0 auto 12px' }}>🌱</div>
            <h2 style={{ fontSize: '1.5rem', margin: '0 0 8px', color: 'var(--text-primary)' }}>Eco Fan Status</h2>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'Figtree' }}>1,250</div>
            <p style={{ color: 'var(--text-muted)' }}>Green Points Earned</p>
          </div>

          <h3 className="h3" style={{ marginTop: '8px' }}>How to earn points</h3>
          
          <div className="surface-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Award size={24} color="var(--accent-gold)" />
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem' }}>Take Public Transit</h4>
              <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Scan your metro card at the gate.</p>
            </div>
            <div style={{ fontWeight: 700, color: 'var(--accent-green)' }}>+500</div>
          </div>

          <div className="surface-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Award size={24} color="var(--accent-gold)" />
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem' }}>Digital Ticketing</h4>
              <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Use KickMate instead of paper.</p>
            </div>
            <div style={{ fontWeight: 700, color: 'var(--accent-green)' }}>+100</div>
          </div>

          <div className="surface-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Award size={24} color="var(--text-muted)" />
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem' }}>Recycle Bin Scan</h4>
              <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Scan QR code on stadium bins.</p>
            </div>
            <div style={{ fontWeight: 700, color: 'var(--accent-green)' }}>+50</div>
          </div>
          
          <button className="btn btn-primary btn-full" style={{ marginTop: '8px' }}>
            Redeem Points for Merch
          </button>
        </section>
      )}
    </main>
  );
}
