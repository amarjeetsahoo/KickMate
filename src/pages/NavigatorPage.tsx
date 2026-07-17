import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Accessibility, Flame, Mic, Volume2, VolumeX } from 'lucide-react';
import { useStadium } from '../hooks/useStadium';
import { STADIUMS } from '../data/stadiums';
import { translateImageText } from '../services/gemini';
import { speakText, listenForSpeech } from '../services/voice';
import type { DestinationType, StadiumId } from '../types';
import { StadiumSatelliteMap } from '../components/layout/StadiumSatelliteMap';
import { Stadium3DWalkthrough } from '../components/layout/Stadium3DWalkthrough';

import { CrowdHeatmapViz } from '../components/layout/CrowdHeatmapViz';

const DEST_OPTIONS: Array<{ id: DestinationType; icon: string; label: string }> = [
  { id: 'seat',    icon: '🏆', label: 'My Seat'  },
  { id: 'food',    icon: '🍔', label: 'Food'     },
  { id: 'toilet',  icon: '🚻', label: 'Toilet'   },
  { id: 'medical', icon: '⚕️',  label: 'Medical'  },
  { id: 'exit',    icon: '🚪', label: 'Exit'     },
];

// Helper functions can go here if needed

// Schematic SVG stadium map
function StadiumSVGMap({ dotPath, currentStep }: { dotPath: Array<{x:number;y:number}>; currentStep: number; }) {
  return (
    <svg
      viewBox="0 0 560 420"
      className="w-full"
      style={{ display: 'block' }}
      aria-label="Stadium schematic map showing navigation path"
      role="img"
    >
      {/* Outer stadium shape */}
      <ellipse cx="280" cy="210" rx="260" ry="190" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="2" />

      {/* Pitch green field */}
      <ellipse cx="280" cy="210" rx="120" ry="90" fill="rgba(0,197,94,0.15)" stroke="rgba(0,197,94,0.3)" strokeWidth="1.5" />
      {/* Center circle */}
      <circle cx="280" cy="210" r="30" fill="none" stroke="rgba(0,197,94,0.2)" strokeWidth="1" />
      {/* Section rings */}
      <ellipse cx="280" cy="210" rx="160" ry="120" fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
      <ellipse cx="280" cy="210" rx="200" ry="150" fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />

      {/* Section labels */}
      {[{x:280,y:105,label:'100s'},{x:440,y:150,label:'200s'},{x:440,y:280,label:'300s'},{x:280,y:330,label:'400s'},{x:120,y:280,label:'500s'},{x:120,y:150,label:'600s'}].map(s=>(
        <text key={s.label} x={s.x} y={s.y} textAnchor="middle" fontSize="11" fill="var(--text-primary)" fontFamily="Inter" fontWeight="600">{s.label}</text>
      ))}

      {/* Gate markers */}
      {[{x:280,y:25,label:'Gate A'},{x:535,y:210,label:'B'},{x:280,y:395,label:'Gate C'},{x:25,y:210,label:'D'}].map(g=>(
        <g key={g.label}>
          <circle cx={g.x} cy={g.y} r="14" fill="var(--accent-blue)" opacity="0.8" />
          <text x={g.x} y={g.y+4} textAnchor="middle" fontSize="9" fill="white" fontFamily="Figtree" fontWeight="700">{g.label}</text>
        </g>
      ))}

      {/* Amenity icons */}
      {[{x:160,y:200,icon:'🍔',label:'Food'},{x:400,y:200,icon:'🍔',label:'Food'},{x:210,y:155,icon:'🚻',label:'Toilet'},{x:350,y:265,icon:'🚻',label:'Toilet'},{x:280,y:210,icon:'⚕️',label:'Medical'}].map((a,i)=>(
        <text key={i} x={a.x} y={a.y} textAnchor="middle" fontSize="16" aria-label={a.label}>{a.icon}</text>
      ))}

      {/* Navigation dot path */}
      {dotPath.map((pt, i) => (
        <circle
          key={i}
          cx={pt.x}
          cy={pt.y}
          r={i === currentStep ? 8 : 5}
          fill={i <= currentStep ? 'var(--accent-green)' : 'var(--border)'}
          opacity={i <= currentStep ? 1 : 0.4}
          style={i === currentStep ? { filter: 'drop-shadow(0 0 6px var(--accent-green))' } : {}}
        />
      ))}

      {/* Destination star */}
      {dotPath.length > 0 && (
        <text
          x={dotPath[dotPath.length - 1].x}
          y={dotPath[dotPath.length - 1].y - 14}
          textAnchor="middle" fontSize="16"
          aria-label="Destination"
        >
          ⭐
        </text>
      )}
    </svg>
  );
}


export function NavigatorPage() {
  const {
    selectedStadiumId, activeRoute, currentStep,
    accessibleOnly, selectStadium, parseSeatString, navigate,
    advanceStep, clearRoute, setAccessibleOnly, destination, setDestination,
  } = useStadium();
  const [viewMode, setViewMode] = useState<'3d' | 'satellite' | '2d'>('3d');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const stadium = STADIUMS.find(s => s.id === selectedStadiumId) || STADIUMS[0];


  const [seatInput, setSeatInput] = useState(() => {
    const savedGate = localStorage.getItem('kickmate_parking_gate');
    if (savedGate) {
      return `Gate ${savedGate}, Section 114, Row C, Seat 22`;
    }
    return '';
  });
  const [scanning, setScanning] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Voice State
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  // Auto-speak instructions when step changes
  useEffect(() => {
    if (!voiceEnabled || !activeRoute || currentStep >= activeRoute.steps.length) return;
    const step = activeRoute.steps[currentStep];
    speakText(`Step ${currentStep + 1}: ${step.instruction}`);
  }, [currentStep, activeRoute, voiceEnabled]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current = listenForSpeech(
        'en-US',
        (text) => setSeatInput(text),
        (err) => { console.error('STT error:', err); setIsListening(false); },
        () => setIsListening(false)
      );
    }
  };

  const handleScan = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const { extracted } = await translateImageText(base64, 'English');
      if (extracted) setSeatInput(extracted);
      setScanning(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleNavigate = () => {
    const seat = seatInput ? parseSeatString(seatInput) : undefined;
    navigate(destination, seat);
    localStorage.removeItem('kickmate_parking_gate');
  };

  return (
    <main style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Stadium selector */}
      <section aria-label="Select stadium">
        <div className="flex gap-sm" role="group" aria-label="Stadium selector">
          {STADIUMS.map((s) => (
            <button
              key={s.id}
              id={`stadium-select-btn-${s.id}`}
              className={`badge ${selectedStadiumId === s.id ? 'badge-green' : 'badge-glass'}`}
              style={{ cursor: 'pointer', padding: '8px 12px', fontFamily: 'Figtree', flexShrink: 0 }}
              onClick={() => selectStadium(s.id as StadiumId)}
              aria-pressed={selectedStadiumId === s.id}
              aria-label={`Select ${s.name}`}
            >
              {s.city}
            </button>
          ))}
        </div>
      </section>

      {/* Seat input */}
      <section className="surface-card" style={{ padding: '14px' }} aria-label="Seat information">
        <div className="flex gap-sm" style={{ marginBottom: '10px' }}>
          <input
            id="seat-input-field"
            type="text"
            className="input"
            style={{ flex: 1 }}
            placeholder="Section 114, Row C, Seat 22"
            value={seatInput}
            onChange={(e) => setSeatInput(e.target.value)}
            aria-label="Enter your seat number"
          />
          <button
            id="scan-ticket-btn"
            className="btn btn-icon"
            style={{ background: 'var(--accent-gold-dim)', borderColor: 'var(--accent-gold)', flexShrink: 0 }}
            onClick={() => fileRef.current?.click()}
            aria-label="Scan ticket to auto-fill seat number"
            title="Scan ticket"
            disabled={scanning || isListening}
          >
            {scanning ? <div className="spinner" style={{ width: 16, height: 16 }} aria-hidden /> : <Camera size={16} color="var(--accent-gold)" aria-hidden />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleScan} aria-hidden />
          <button
            id="voice-input-btn"
            className="btn btn-icon"
            style={{ background: isListening ? 'var(--accent-red-dim)' : 'var(--bg-card)', borderColor: isListening ? 'var(--accent-red)' : 'var(--border)', flexShrink: 0 }}
            onClick={toggleListening}
            aria-label="Use voice to enter seat number"
            title="Voice input"
            disabled={scanning}
          >
            <Mic size={16} color={isListening ? 'var(--accent-red)' : 'var(--text-primary)'} aria-hidden />
          </button>
        </div>

        {/* Destination pills */}
        <div className="flex gap-sm" style={{ flexWrap: 'wrap', marginBottom: '10px' }} role="group" aria-label="Destination type">
          {DEST_OPTIONS.map((d) => (
            <button
              key={d.id}
              id={`dest-option-badge-${d.id}`}
              className={`badge ${destination === d.id ? 'badge-green' : 'badge-glass'}`}
              style={{ cursor: 'pointer', padding: '7px 12px' }}
              onClick={() => setDestination(d.id)}
              aria-pressed={destination === d.id}
              aria-label={`Navigate to ${d.label}`}
            >
              {d.icon} {d.label}
            </button>
          ))}
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {/* Accessible toggle */}
          <label className="flex items-center gap-sm" style={{ cursor: 'pointer' }}>
            <input
              id="accessible-route-checkbox"
              type="checkbox"
              checked={accessibleOnly}
              onChange={() => setAccessibleOnly(!accessibleOnly)}
              style={{ accentColor: 'var(--accent-green)', width: 18, height: 18 }}
              aria-label="Show wheelchair accessible routes only"
            />
            <Accessibility size={14} aria-hidden />
            <span className="text-sm">Accessible route</span>
          </label>

          {/* Heatmap toggle */}
          <label className="flex items-center gap-sm" style={{ cursor: 'pointer' }}>
            <input
              id="crowd-heatmap-checkbox"
              type="checkbox"
              checked={showHeatmap}
              onChange={() => {
                setShowHeatmap(!showHeatmap);
                if (!showHeatmap && viewMode === '3d') {
                  setViewMode('2d');
                }
              }}
              style={{ accentColor: 'var(--accent-amber)', width: 18, height: 18 }}
              aria-label="Show crowd heatmap overlay"
            />
            <Flame size={14} color="var(--accent-amber)" aria-hidden />
            <span className="text-sm">Crowd Heatmap</span>
          </label>
          
          {/* Voice Output toggle */}
          <label className="flex items-center gap-sm" style={{ cursor: 'pointer', marginLeft: 'auto' }}>
            <input
              id="voice-output-checkbox"
              type="checkbox"
              checked={voiceEnabled}
              onChange={() => {
                if (voiceEnabled) speakText(''); // Cancel speech if turning off
                setVoiceEnabled(!voiceEnabled);
              }}
              style={{ accentColor: 'var(--accent-blue)', width: 18, height: 18 }}
              aria-label="Enable voice navigation instructions"
            />
            {voiceEnabled ? <Volume2 size={14} color="var(--accent-blue)" aria-hidden /> : <VolumeX size={14} color="var(--text-muted)" aria-hidden />}
            <span className="text-sm">Voice Nav</span>
          </label>
        </div>
      </section>

      {/* Navigate CTA */}
      <button id="start-navigation-btn" className="btn btn-primary btn-full" onClick={handleNavigate} aria-label="Start navigation">
        🧭 Start Navigation
      </button>

      {/* Map View Toggle */}
      <div className="flex gap-sm justify-end" style={{ marginBottom: '-6px', flexWrap: 'wrap' }} role="group" aria-label="Map view mode">
        <button
          id="toggle-view-3d-btn"
          className={`badge ${viewMode === '3d' ? 'badge-green' : 'badge-glass'}`}
          style={{ cursor: 'pointer', border: 'none', padding: '6px 12px' }}
          onClick={() => setViewMode('3d')}
          aria-pressed={viewMode === '3d'}
          aria-label="Show 3D Stadium Walkthrough"
        >
          🏟️ 3D Walkthrough
        </button>
        <button
          id="toggle-view-satellite-btn"
          className={`badge ${viewMode === 'satellite' ? 'badge-green' : 'badge-glass'}`}
          style={{ cursor: 'pointer', border: 'none', padding: '6px 12px' }}
          onClick={() => setViewMode('satellite')}
          aria-pressed={viewMode === 'satellite'}
          aria-label="Show Satellite Map"
        >
          Satellite Map
        </button>
        <button
          id="toggle-view-2d-btn"
          className={`badge ${viewMode === '2d' ? 'badge-green' : 'badge-glass'}`}
          style={{ cursor: 'pointer', border: 'none', padding: '6px 12px' }}
          onClick={() => setViewMode('2d')}
          aria-pressed={viewMode === '2d'}
          aria-label="Show 2D schematic map"
        >
          2D Map
        </button>
      </div>

      {/* Map Content Container */}
      <section className="stadium-map-container" aria-label="Stadium navigation map">
        {viewMode === '3d' && (
          <Stadium3DWalkthrough
            activeStepIndex={currentStep}
            onAdvanceStep={activeRoute ? advanceStep : undefined}
          />
        )}
        {viewMode === 'satellite' && (
          <StadiumSatelliteMap
            stadiumName={stadium.name}
            latitude={stadium.coordinates.lat}
            longitude={stadium.coordinates.lng}
            parkingZones={stadium.parkingZones}
            showHeatmap={showHeatmap}
          />
        )}
        {viewMode === '2d' && (
          <div style={{ position: 'relative', width: '100%', aspectRatio: '560/420' }}>
            <StadiumSVGMap
              dotPath={activeRoute?.dotPath ?? []}
              currentStep={currentStep}
            />
            {showHeatmap && <CrowdHeatmapViz stadiumId={selectedStadiumId || STADIUMS[0].id} />}
          </div>
        )}
      </section>


      {/* Step by step */}
      {activeRoute && (
        <section aria-label="Step-by-step navigation directions">
          <div className="flex justify-between items-center" style={{ marginBottom: '10px' }}>
            <h2 className="h3">📍 Directions</h2>
            <span className="badge badge-glass text-xs">
              ~{activeRoute.estimatedMinutes} min
            </span>
          </div>
          <div
            className="flex flex-col gap-sm"
            role="list"
            aria-label="Navigation steps"
            aria-live="polite"
          >
            {activeRoute.steps.map((step, i) => {
              const status = i < currentStep ? 'completed' : i === currentStep ? 'current' : 'upcoming';
              return (
                <div
                  key={step.id}
                  className={`step-card ${status}`}
                  role="listitem"
                  aria-current={status === 'current' ? 'step' : undefined}
                >
                  <div className={`nav-dot ${status}`} aria-hidden />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: status === 'current' ? 600 : 400, color: status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)', fontSize: '0.9rem' }}>
                      {step.instruction}
                    </p>
                    {step.landmark && <p className="text-xs text-muted" style={{ marginTop: '2px' }}>📍 {step.landmark}</p>}
                    {step.floor && <p className="text-xs text-green" style={{ marginTop: '2px' }}>Level {step.floor}</p>}
                  </div>
                  {status === 'completed' && <span style={{ color: 'var(--accent-green)', fontSize: '1rem' }} aria-label="Completed">✓</span>}
                </div>
              );
            })}
          </div>
          {currentStep < activeRoute.steps.length - 1 && (
            <button
              id="next-step-btn"
              className="btn btn-primary btn-full"
              style={{ marginTop: '12px' }}
              onClick={advanceStep}
              aria-label="Mark current step as complete and proceed to next"
            >
              Next Step →
            </button>
          )}
          {currentStep === activeRoute.steps.length - 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              <div
                style={{
                  padding: '16px', textAlign: 'center',
                  background: 'var(--accent-green-dim)', borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-active)',
                }}
                role="status"
                aria-live="polite"
              >
                <div style={{ fontSize: '2rem' }} aria-hidden>🎉</div>
                <p style={{ fontFamily: 'Figtree', fontWeight: 700, color: 'var(--accent-green)' }}>You've arrived!</p>
              </div>
              <button
                id="finish-navigation-btn"
                className="btn btn-primary btn-full"
                onClick={clearRoute}
                aria-label="Finish navigation and return to seat entry screen"
              >
                Done
              </button>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
