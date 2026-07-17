import { useState } from 'react';
import { Shield, Globe, Navigation, ChevronRight } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  const [activeTab, setActiveTab] = useState<'heatmap' | 'translate' | 'food'>('heatmap');

  return (
    <div className="landing-container" style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px', borderBottom: '1px solid var(--border)',
        backdropFilter: 'var(--backdrop-blur)', position: 'sticky', top: 0, zIndex: 1000,
        background: 'rgba(13, 17, 23, 0.8)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Figtree', fontWeight: 800, fontSize: '1.5rem' }}>
          <span style={{ fontSize: '1.8rem' }}>⚽</span>
          <span>Kick<span style={{ color: 'var(--accent-green)' }}>Mate</span></span>
        </div>
        <button
          className="btn btn-primary"
          style={{ padding: '8px 24px', minHeight: 'auto', borderRadius: 'var(--radius-full)' }}
          onClick={onStart}
        >
          Launch App <ChevronRight size={16} />
        </button>
      </header>

      {/* Hero Section */}
      <section style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '80px 20px', textAlign: 'center', position: 'relative',
        background: 'radial-gradient(circle at center, rgba(0, 197, 94, 0.15) 0%, transparent 60%)'
      }}>
        <div className="badge badge-green" style={{ padding: '6px 16px', fontSize: '0.85rem', marginBottom: '24px' }}>
          🏆 Official Fan Companion for FIFA World Cup 2026
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, maxWidth: '900px', lineHeight: 1.15, marginBottom: '24px', letterSpacing: '-0.03em' }}>
          Elevate Your World Cup Experience with <span style={{ color: 'var(--accent-green)' }}>Generative AI</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '650px', marginBottom: '40px', lineHeight: 1.6 }}>
          Navigate stadiums in 3D, translate with locals instantly, scan tickets, bypass concession queues, and view crowd congestion in real-time.
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '1.05rem', borderRadius: 'var(--radius-lg)' }} onClick={onStart}>
            Enter KickMate Dashboard
          </button>
          <a href="#features" className="btn btn-ghost" style={{ padding: '16px 36px', fontSize: '1.05rem', borderRadius: 'var(--radius-lg)' }}>
            Explore Features
          </a>
        </div>
      </section>

      {/* Main Interactive Demo Preview */}
      <section style={{ padding: '60px 40px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }} className="landing-demo-grid">
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>See the Action live, Navigate without friction</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
              Switch between interactive features to see how KickMate utilizes multi-agent AI systems to dynamically update your tournament day schedule.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                style={{
                  display: 'flex', padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'left',
                  background: activeTab === 'heatmap' ? 'var(--accent-green-dim)' : 'transparent',
                  border: `1px solid ${activeTab === 'heatmap' ? 'var(--accent-green)' : 'var(--border)'}`,
                  color: activeTab === 'heatmap' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onClick={() => setActiveTab('heatmap')}
              >
                <div style={{ marginRight: '16px', fontSize: '1.5rem' }}>🌡️</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>Real-time Crowd Heatmap</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Simulate stadium gates & food queue densities before you stand in line.</div>
                </div>
              </button>

              <button
                style={{
                  display: 'flex', padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'left',
                  background: activeTab === 'translate' ? 'var(--accent-green-dim)' : 'transparent',
                  border: `1px solid ${activeTab === 'translate' ? 'var(--accent-green)' : 'var(--border)'}`,
                  color: activeTab === 'translate' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onClick={() => setActiveTab('translate')}
              >
                <div style={{ marginRight: '16px', fontSize: '1.5rem' }}>🌐</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>AI Concourse Chat & Social Wall</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Chant with other fans in multiple languages, fully moderated for toxicity.</div>
                </div>
              </button>

              <button
                style={{
                  display: 'flex', padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'left',
                  background: activeTab === 'food' ? 'var(--accent-green-dim)' : 'transparent',
                  border: `1px solid ${activeTab === 'food' ? 'var(--accent-green)' : 'var(--border)'}`,
                  color: activeTab === 'food' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onClick={() => setActiveTab('food')}
              >
                <div style={{ marginRight: '16px', fontSize: '1.5rem' }}>🍔</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>Smart Food Recommendations</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>AI finds the best options near your section with custom dietary settings.</div>
                </div>
              </button>
            </div>
          </div>

          {/* Interactive Screen Preview */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: '100%', maxWidth: '400px', height: '480px', background: 'var(--bg-card)',
              border: '4px solid var(--border)', borderRadius: '24px', overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)', position: 'relative'
            }}>
              {activeTab === 'heatmap' && (
                <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700 }}>SoFi Stadium Density</span>
                    <span className="badge badge-live">Live Sensor Feed</span>
                  </div>
                  {/* Schematic Mock View */}
                  <div style={{ flex: 1, border: '1px dashed var(--border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
                    <div style={{ width: '80%', height: '120px', borderRadius: '50%', border: '4px solid var(--accent-green)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-red)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem' }}>Gate A: Crowded (Red)</div>
                      <div style={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-green)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem' }}>Gate C: Clear (Green)</div>
                      <div style={{ width: '40px', height: '30px', background: 'rgba(0,197,94,0.3)', borderRadius: '8px' }} />
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem' }}>
                    💡 <strong>AI Tip:</strong> Avoid Gate A. Exit via Gate C for 80% faster transit.
                  </div>
                </div>
              )}
              {activeTab === 'translate' && (
                <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontWeight: 700 }}>Chants and Shoutouts</span>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
                    <div style={{ background: 'var(--bg-primary)', padding: '8px 12px', borderRadius: '12px', fontSize: '0.8rem' }}>
                      <strong>🇧🇷 Fan:</strong> "Vai Brasil! Rumo ao hexa!"
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', marginTop: '2px' }}>🇺🇸 "Go Brazil! Heading for the sixth title!" (Translated)</div>
                    </div>
                    <div style={{ background: 'var(--bg-primary)', padding: '8px 12px', borderRadius: '12px', fontSize: '0.8rem' }}>
                      <strong>🇲🇽 Fan:</strong> "Cielito Lindo en el estadio!"
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', marginTop: '2px' }}>🇺🇸 "Beautiful little sky in the stadium!" (Translated)</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input className="input" placeholder="Post a cheer..." disabled style={{ fontSize: '0.8rem' }} />
                    <button className="btn btn-primary" disabled style={{ minHeight: 'auto', padding: '0 12px' }}>→</button>
                  </div>
                </div>
              )}
              {activeTab === 'food' && (
                <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <span style={{ fontWeight: 700 }}>GenAI Food Concierge</span>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ background: 'var(--accent-green-dim)', padding: '12px', borderRadius: '12px', border: '1px solid var(--accent-green)', fontSize: '0.8rem' }}>
                      💬 <strong>User:</strong> "Looking for vegetarian tacos near Section 114."
                    </div>
                    <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.8rem' }}>
                      🤖 <strong>AI response:</strong> Go to <strong>"Taco Loco"</strong> at Food Court 2 (Level 2, near section 112). They serve organic black bean tacos. Wait time: ~3 mins!
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Grid of details */}
      <section id="features" style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Packed with Intelligent Features</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.5 }}>
            GenAI helps venue operations scale to millions of international fans.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div className="surface-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'var(--accent-green-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'var(--accent-green)', paddingLeft: '11px', paddingTop: '8px' }}>
              <Navigation size={20} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Dynamic 3D Navigation</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Navigate between your seat, toilets, medical rooms, and exit routes with custom accessibility settings.
            </p>
          </div>

          <div className="surface-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'var(--accent-gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'var(--accent-gold)', paddingLeft: '11px', paddingTop: '8px' }}>
              <Globe size={20} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Voice & OCR Translation</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Use real-time speech translation and camera OCR to decode road signs, tickets, menus, or stadium announcements.
            </p>
          </div>

          <div className="surface-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'var(--accent-red-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'var(--accent-red)', paddingLeft: '11px', paddingTop: '8px' }}>
              <Shield size={20} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>AI SOS Support</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Report medical, spill, or security issues. Operations routing agents immediately dispatch crews to your seat coords.
            </p>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer style={{ padding: '40px 20px', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        <p>© 2026 KickMate. Built for stadium intelligence during the FIFA World Cup 2026.</p>
      </footer>
    </div>
  );
}
