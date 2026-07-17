import { Globe, Navigation, Clock } from 'lucide-react';
import type { ParkingZone } from '../../types';

interface StadiumSatelliteMapProps {
  stadiumName: string;
  latitude: number;
  longitude: number;
  parkingZones: ParkingZone[];
  showHeatmap: boolean;
}

export function StadiumSatelliteMap({
  stadiumName,
  latitude,
  longitude,
  parkingZones,
  showHeatmap
}: StadiumSatelliteMapProps) {
  // Free satellite view embed link (satellite type = 'k', zoom level = 17)
  const embedUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&t=k&z=17&output=embed`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
      {/* 3D Satellite Map Iframe */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '320px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1px solid var(--border)'
        }}
      >
        <iframe
          title={`${stadiumName} 3D Satellite Map View`}
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0, display: 'block' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          aria-label={`${stadiumName} real-world satellite map`}
        />

        {/* Floating Satellite Info overlay */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(15, 23, 42, 0.9)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            pointerEvents: 'none'
          }}
        >
          <Globe size={12} color="var(--accent-green)" />
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#fff' }}>
            🛰️ Live Satellite Stream
          </span>
        </div>

        {/* Dynamic Crowd Heatmap HUD Overlay */}
        {showHeatmap && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '160px',
              background: 'rgba(15, 23, 42, 0.95)',
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--accent-amber)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              zIndex: 10
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px', marginBottom: '2px' }}>
              <span className="animate-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-amber)', display: 'inline-block' }} />
              <strong style={{ fontSize: '0.65rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Heatmap Feed</strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Gate A (North):</span>
                <span className="badge badge-green" style={{ fontSize: '0.55rem', padding: '1px 4px' }}>Clear</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Gate B (East):</span>
                <span className="badge badge-amber" style={{ fontSize: '0.55rem', padding: '1px 4px' }}>Busy</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Gate C (South):</span>
                <span className="badge badge-red" style={{ fontSize: '0.55rem', padding: '1px 4px' }}>HEAVY</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Gate D (West):</span>
                <span className="badge badge-green" style={{ fontSize: '0.55rem', padding: '1px 4px' }}>Clear</span>
              </div>
            </div>
            
            <p style={{ fontSize: '0.55rem', color: 'var(--accent-amber)', margin: '4px 0 0 0', lineHeight: 1.2 }}>
              💡 Recommendation: Divert entry via Gate A to bypass queues.
            </p>
          </div>
        )}
      </div>


      {/* Parking & Gate Outer Navigation Grid */}
      <section className="surface-card" style={{ padding: '14px', borderTop: '2px solid var(--accent-blue)' }}>
        <div className="flex items-center gap-xs" style={{ marginBottom: '10px' }}>
          <Navigation size={16} color="var(--accent-blue)" aria-hidden />
          <h3 className="h3" style={{ fontSize: '0.95rem' }}>Exterior Parking & Entry Gates</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
          {parkingZones.map((pz) => (
            <div
              key={pz.id}
              className="flex flex-col justify-between"
              style={{
                padding: '10px',
                background: 'var(--bg-glass)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <div>
                <strong style={{ fontSize: '0.8rem', display: 'block', marginBottom: '2px' }}>{pz.name}</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <Clock size={10} color="var(--text-muted)" />
                  <span className="text-xs text-muted">{pz.walkMinutes} min walk to Gate {pz.nearGate}</span>
                </div>
              </div>
              <span
                className={`badge ${
                  pz.status === 'open' ? 'badge-green' : pz.status === 'filling' ? 'badge-amber' : 'badge-red'
                }`}
                style={{ fontSize: '0.65rem', alignSelf: 'flex-start', marginTop: '4px' }}
              >
                {pz.status.toUpperCase()} ({pz.occupied}/{pz.capacity})
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
