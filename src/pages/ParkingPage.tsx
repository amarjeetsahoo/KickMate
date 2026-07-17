import { useState, useEffect, useMemo } from 'react';
import { STADIUMS } from '../data/stadiums';
import { storage } from '../services/storage';
import { getSimulatedParkingStatus } from '../data/mockData';
import type { ParkingZone } from '../types';

interface ParkingPageProps {
  onNavigateToSeat?: (gate: string) => void;
}

const STATUS_COLORS = { open: 'var(--accent-green)', filling: 'var(--accent-amber)', full: 'var(--accent-red)' };
const STATUS_LABELS = { open: '🟢 Open', filling: '🟡 Filling', full: '🔴 Full' };

function getQueueText(status: string) {
  if (status === 'open') return 'Queue: Empty';
  if (status === 'filling') return 'Queue: 8-12 cars (~4 min)';
  return 'Queue: Full (~15 min)';
}

export function ParkingPage({ onNavigateToSeat }: ParkingPageProps) {
  const stadiumId = storage.getStadium() ?? 'sofi';
  const stadium = STADIUMS.find((s) => s.id === stadiumId) ?? STADIUMS[0];
  const [selected, setSelected] = useState<string | null>(null);
  const [zones, setZones] = useState<ParkingZone[]>(stadium.parkingZones);

  // Simulate real-time occupancy updates
  useEffect(() => {
    const id = setInterval(() => {
      setZones((prev) =>
        prev.map((z) => {
          const sim = getSimulatedParkingStatus(z.occupied, z.capacity);
          return { ...z, occupied: sim.occupied, status: sim.status };
        })
      );
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const selectedZone = useMemo(() => zones.find((z) => z.id === selected), [zones, selected]);

  const navigate = (zone: ParkingZone) => {
    const query = `${zone.name} ${stadium.name}`.replace(/ /g, '+');
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <main style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <p className="text-muted text-sm">{stadium.name} • {stadium.city}</p>
        <div className="badge badge-glass" style={{ marginTop: '6px', display: 'inline-flex', fontSize: '0.7rem' }}>
          Demo data — simulates real-time sensor feeds
        </div>
      </div>

      {/* Zone cards */}
      <section aria-label="Parking zones">
        <div className="flex flex-col gap-md">
          {zones.map((zone) => {
            const pct = zone.occupied / zone.capacity;
            return (
              <button
                key={zone.id}
                id={`parking-zone-${zone.id}`}
                className={`parking-card${selected === zone.id ? ' selected' : ''}`}
                onClick={() => setSelected(zone.id === selected ? null : zone.id)}
                aria-label={`${zone.name}: ${STATUS_LABELS[zone.status]}, ${Math.round(pct * 100)}% full, ${zone.walkMinutes} minute walk to Gate ${zone.nearGate}`}
                aria-pressed={selected === zone.id}
              >
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'Figtree', fontWeight: 700, color: 'var(--text-primary)' }}>{zone.name}</span>
                    <span
                      className="badge"
                      style={{ background: `${STATUS_COLORS[zone.status]}22`, color: STATUS_COLORS[zone.status], fontSize: '0.7rem' }}
                    >
                      {STATUS_LABELS[zone.status]}
                    </span>
                  </div>
                  <div className="parking-bar" style={{ marginBottom: '8px' }}>
                    <div
                      className="parking-bar-fill"
                      style={{ width: `${pct * 100}%`, background: STATUS_COLORS[zone.status] }}
                      role="progressbar"
                      aria-valuenow={Math.round(pct * 100)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${Math.round(pct * 100)}% full`}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted" style={{ marginTop: '4px' }}>
                    <span>{zone.occupied}/{zone.capacity} spaces • {getQueueText(zone.status)}</span>
                    <span>🚶 {zone.walkMinutes} min to Gate {zone.nearGate}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Selected zone action */}
      {selectedZone && selectedZone.status !== 'full' && (
        <section
          className="glass-card"
          style={{ background: 'var(--accent-green-dim)', border: '1px solid var(--border-active)' }}
          aria-label={`Navigate to ${selectedZone.name}`}
        >
          <h3 className="h3" style={{ marginBottom: '8px' }}>{selectedZone.name}</h3>
          <div className="flex gap-md text-sm text-secondary" style={{ marginBottom: '16px' }}>
            <span>🚶 {selectedZone.walkMinutes} min walk</span>
            <span>🚪 Gate {selectedZone.nearGate}</span>
            <span>🟢 {selectedZone.capacity - selectedZone.occupied} spaces free</span>
          </div>
          <div className="flex flex-col gap-sm">
            <button
              id="parking-nav-btn"
              className="btn btn-primary btn-full"
              onClick={() => navigate(selectedZone)}
            >
              🚗 Drive to {selectedZone.name}
            </button>
            {onNavigateToSeat && (
              <button
                id="parking-route-seat-btn"
                className="btn btn-ghost btn-full"
                onClick={() => onNavigateToSeat(selectedZone.nearGate)}
              >
                🧭 Route from Lot to Seat
              </button>
            )}
          </div>
          <p className="text-xs text-muted" style={{ marginTop: '8px', textAlign: 'center' }}>
            Opens Google Maps for driving directions, or KickMate Navigator for seat guidance.
          </p>
        </section>
      )}
    </main>
  );
}
