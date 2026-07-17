import { useState, useEffect } from 'react';
import { createMockAlert } from '../data/mockData';
import { loadUserProfile } from '../services/storage';
import type { SOSAlert, AlertType } from '../types';

const ALERT_TYPES: Array<{ type: AlertType; icon: string; label: string; className: string; desc: string }> = [
  { type: 'medical',  icon: '🩺', label: 'Medical Help',   className: 'medical',  desc: 'Injury, illness, or health emergency' },
  { type: 'spill',    icon: '🧹', label: 'Spill/Cleanup',  className: 'spill',    desc: 'Food, liquid, or mess cleanup needed' },
  { type: 'security', icon: '🔒', label: 'Security Issue', className: 'security', desc: 'Suspicious activity or safety concern' },
  { type: 'general',  icon: '❓', label: 'General Help',   className: 'general',  desc: 'Other assistance needed' },
];

export function SOSPage({ onClose: _onClose }: { onClose?: () => void }) {
  const [activeAlert, setActiveAlert] = useState<SOSAlert | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const profile = loadUserProfile() ?? { seatInfo: null, selectedStadium: 'sofi' };

  useEffect(() => {
    if (!activeAlert) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [activeAlert]);

  const triggerAlert = (type: AlertType) => {
    const alert = createMockAlert(
      type,
      profile.seatInfo?.section ?? '114',
      profile.selectedStadium ?? 'SoFi Stadium',
    );
    setActiveAlert(alert);
    setElapsed(0);
    if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 500]);
  };

  const cancelAlert = () => {
    setActiveAlert(null);
    setElapsed(0);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <main
      style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '100%' }}
      aria-label="Emergency SOS panel"
      role="alertdialog"
      aria-live="assertive"
    >
      {!activeAlert ? (
        <>
          {/* Header */}
          <div className="text-center" style={{ padding: '24px 0 8px' }}>
            <div
              style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'var(--accent-red)', margin: '0 auto 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', position: 'relative',
                boxShadow: 'var(--shadow-red)',
              }}
              aria-hidden="true"
              className="flex items-center justify-center"
            >
              <span>🆘</span>
              <div
                style={{
                  position: 'absolute', inset: -8, borderRadius: '50%',
                  border: '2px solid var(--accent-red)', opacity: 0.4,
                  animation: 'sos-ring 1.5s infinite',
                }}
                aria-hidden
              />
            </div>
            <h2 id="sos-page-heading" className="h2" style={{ marginBottom: '6px' }}>Emergency Help</h2>
            <p className="text-muted text-sm">
              Select the type of assistance you need
            </p>
            <div className="badge badge-glass" style={{ marginTop: '8px', display: 'inline-flex' }}>
              📍 Seat 114-C-22 • SoFi Stadium
            </div>
          </div>

          {/* Alert type grid */}
          <div className="grid-2" role="group" aria-label="Select type of help">
            {ALERT_TYPES.map((a) => (
              <button
                key={a.type}
                id={`sos-card-${a.type}`}
                className={`alert-card ${a.className}`}
                onClick={() => triggerAlert(a.type)}
                aria-label={`${a.label}: ${a.desc}`}
              >
                <span className="alert-card-icon" aria-hidden>{a.icon}</span>
                <span>{a.label}</span>
                <span className="text-xs opacity-60" style={{ fontWeight: 400 }}>{a.desc}</span>
              </button>
            ))}
          </div>

          <p className="text-xs text-muted text-center" style={{ padding: '0 24px' }}>
            Demo: Alerts go to a mock crew dashboard. Real deployment would notify stadium operations staff.
          </p>
        </>
      ) : (
        <>
          {/* Active alert */}
          <div className="text-center" style={{ padding: '32px 0' }}>
            <div
              style={{
                width: 100, height: 100, borderRadius: '50%',
                background: 'var(--accent-red)', margin: '0 auto 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.5rem', animation: 'sos-pulse 1s infinite',
                boxShadow: 'var(--shadow-red)', position: 'relative',
              }}
              aria-hidden
              className="flex items-center justify-center"
            >
              {ALERT_TYPES.find((a) => a.type === activeAlert.type)?.icon}
            </div>

            {elapsed >= 30 ? (
              <h2 className="h2" style={{ marginBottom: '8px', color: 'var(--accent-green)' }}>
                Issue Resolved!
              </h2>
            ) : (
              <h2 className="h2" style={{ marginBottom: '8px', color: 'var(--accent-red)' }}>
                Help is on the way!
              </h2>
            )}
            <p className="text-secondary text-sm" style={{ marginBottom: '16px' }}>
              {ALERT_TYPES.find((a) => a.type === activeAlert.type)?.label} request sent
            </p>

            {/* Live Dispatch Progress Tracker */}
            <div className="surface-card" style={{ width: '100%', maxWidth: '340px', margin: '0 auto 16px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 600 }}>
                <span style={{ color: 'var(--accent-green)' }}>Reported</span>
                <span style={{ color: elapsed >= 6 ? 'var(--accent-green)' : 'var(--text-muted)' }}>Dispatched</span>
                <span style={{ color: elapsed >= 16 ? 'var(--accent-green)' : 'var(--text-muted)' }}>Arriving</span>
                <span style={{ color: elapsed >= 30 ? 'var(--accent-green)' : 'var(--text-muted)' }}>Resolved</span>
              </div>
              <div style={{ display: 'flex', height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden', gap: '2px' }}>
                <div style={{ flex: 1, background: 'var(--accent-green)' }} />
                <div style={{ flex: 1, background: elapsed >= 6 ? 'var(--accent-green)' : 'var(--bg-glass)' }} />
                <div style={{ flex: 1, background: elapsed >= 16 ? 'var(--accent-green)' : 'var(--bg-glass)' }} />
                <div style={{ flex: 1, background: elapsed >= 30 ? 'var(--accent-green)' : 'var(--bg-glass)' }} />
              </div>
            </div>

            <div className="surface-card" style={{ display: 'inline-block', padding: '12px 24px', margin: '0 auto' }}>
              <div className="text-xs text-muted">Estimated response</div>
              <div className="score-display" style={{ fontSize: '2rem' }}>
                {elapsed >= 30 ? '0' : Math.max(1, activeAlert.estimatedMinutes - Math.floor(elapsed / 10))} min
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <span className={`badge ${elapsed >= 30 ? 'badge-green' : 'badge-live'}`}>
                {elapsed >= 30 ? 'Completed' : `Alert active ${formatTime(elapsed)}`}
              </span>
            </div>
          </div>

          <div className="surface-card" style={{ padding: '12px 16px' }}>
            <p className="text-sm" style={{ lineHeight: 1.5 }}>
              📍 <strong>Your location shared:</strong> Seat 114-C-22, SoFi Stadium<br />
              📞 Staff have been notified and are on their way.<br />
              🏥 Medical room is near Section 110 if you need to move.
            </p>
          </div>

          <button
            id="sos-cancel-btn"
            className="btn"
            style={{ borderRadius: 'var(--radius-lg)', border: '2px solid var(--accent-red)', color: 'var(--accent-red)', padding: '14px' }}
            onClick={cancelAlert}
            aria-label="Cancel emergency alert"
          >
            {elapsed >= 30 ? 'Done' : 'Cancel Alert'}
          </button>
        </>
      )}
    </main>
  );
}
