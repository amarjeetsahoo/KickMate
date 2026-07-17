import { useEffect, useRef, useState } from 'react';
import { Accessibility, RefreshCw, Eye } from 'lucide-react';

interface ConcourseStreetViewProps {
  routeSteps?: { instruction: string; landmark?: string; floor?: number }[];
  activeStepIndex: number;
  accessibleOnly: boolean;
  onFallbackTo2D: () => void;
}

interface Hotspot {
  label: string;
  icon: string;
  angle: number; // 0 to 360 degrees
  actionText: string;
}

const PANORAMA_SCENES: Array<{ title: string; bgColor: string; hotspots: Hotspot[] }> = [
  {
    title: 'Gate B Entrance lobby',
    bgColor: '#161B27',
    hotspots: [
      { label: 'Security A', icon: '🔍', angle: 45, actionText: 'Gate Entrance' },
      { label: 'Escalators N', icon: '🪜', angle: 120, actionText: 'To Level 2' },
      { label: 'Information Desk', icon: 'ℹ️', angle: 280, actionText: 'Support' }
    ]
  },
  {
    title: 'Level 2 Escalator Deck',
    bgColor: '#0f172a',
    hotspots: [
      { label: 'Food Court 2', icon: '🍔', angle: 60, actionText: 'Burgers & Fries' },
      { label: 'Restrooms', icon: '🚻', angle: 160, actionText: 'Concourse toilets' },
      { label: 'Elevators S', icon: '🛗', angle: 240, actionText: 'Accessible Route' }
    ]
  },
  {
    title: 'Section 114 Corridor Walkway',
    bgColor: '#1e1b4b',
    hotspots: [
      { label: 'Section 114 Entry', icon: '🏆', angle: 90, actionText: 'To Seats' },
      { label: 'Beer Concession', icon: '🍺', angle: 200, actionText: 'Beverages' },
      { label: 'First Aid Room', icon: '⚕️', angle: 310, actionText: 'Emergency Help' }
    ]
  },
  {
    title: 'Section 114, Row C, Seat 22 View',
    bgColor: '#022c22',
    hotspots: [
      { label: 'SoFi Green Pitch', icon: '⚽', angle: 180, actionText: 'World Cup Field' },
      { label: 'Concourse Exit', icon: '🚪', angle: 0, actionText: 'Gate C' }
    ]
  }
];

export function ConcourseStreetView({
  routeSteps = [],
  activeStepIndex,
  accessibleOnly,
  onFallbackTo2D
}: ConcourseStreetViewProps) {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [panAngle, setPanAngle] = useState(180); // Start looking straight ahead (180 deg)
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);

  const startAngle = useRef(0);

  // Map step index to one of our 4 panorama scenes
  const sceneIdx = Math.min(activeStepIndex, PANORAMA_SCENES.length - 1);
  const scene = PANORAMA_SCENES[sceneIdx];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const w = canvas.width = canvas.clientWidth;
      const h = canvas.height = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      // 1. Draw Panoramic Sky/Background Wall
      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, '#020617');
      gradient.addColorStop(0.5, scene.bgColor);
      gradient.addColorStop(1, '#020617');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Draw horizontal reference lines representing concourse architecture
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const yOffset = h * 0.2 + i * h * 0.2;
        ctx.beginPath();
        ctx.moveTo(0, yOffset);
        ctx.lineTo(w, yOffset);
        ctx.stroke();
      }

      // Draw pillars along the concourse mapped to panning angle
      const pillarCount = 8;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      for (let i = 0; i < pillarCount; i++) {
        const baseAngle = (i / pillarCount) * 360;
        // Project angle relative to the active panning view
        let diff = baseAngle - panAngle;
        while (diff < -180) diff += 360;
        while (diff > 180) diff -= 360;

        const fov = 120; // field of view in degrees
        if (Math.abs(diff) < fov / 2) {
          const x = w / 2 + (diff / (fov / 2)) * (w / 2);
          const pillarWidth = 40;
          ctx.fillRect(x - pillarWidth / 2, 0, pillarWidth, h);
        }
      }

      // Draw stadium details for the "Seat View"
      if (sceneIdx === 3) {
        // Draw pitch center line
        let pitchDiff = 180 - panAngle;
        while (pitchDiff < -180) pitchDiff += 360;
        while (pitchDiff > 180) pitchDiff -= 360;

        if (Math.abs(pitchDiff) < 60) {
          const px = w / 2 + (pitchDiff / 60) * (w / 2);
          
          // Draw green pitch block
          ctx.fillStyle = 'rgba(0, 197, 94, 0.1)';
          ctx.beginPath();
          ctx.ellipse(px, h * 0.6, 120, 60, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(px, h * 0.6, 120, 60, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // 2. Draw Interactive Hotspots
      scene.hotspots.forEach((hs) => {
        let diff = hs.angle - panAngle;
        while (diff < -180) diff += 360;
        while (diff > 180) diff -= 360;

        const fov = 100;
        if (Math.abs(diff) < fov / 2) {
          const x = w / 2 + (diff / (fov / 2)) * (w / 2);
          const y = h * 0.45;

          // Draw glowing hotspot bubble
          ctx.fillStyle = 'rgba(0, 197, 94, 0.15)';
          ctx.strokeStyle = '#00C55E';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, 24, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Icon
          ctx.font = '20px Inter';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#fff';
          ctx.fillText(hs.icon, x, y);

          // Label Box
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 1;
          const textWidth = ctx.measureText(hs.label).width + 24;
          const rx = x - textWidth / 2;
          const ry = y - 56;
          
          ctx.beginPath();
          ctx.roundRect(rx, ry, textWidth, 24, 6);
          ctx.fill();
          ctx.stroke();

          // Text
          ctx.font = 'bold 11px Figtree';
          ctx.fillStyle = '#00C55E';
          ctx.fillText(hs.label, x, ry + 12);
        }

      });

      // 3. Draw compass grid markings in the sky
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '10px Inter';
      ctx.textAlign = 'center';
      
      const cardinalAngles = [
        { label: 'N', val: 0 }, { label: 'E', val: 90 },
        { label: 'S', val: 180 }, { label: 'W', val: 270 }
      ];

      cardinalAngles.forEach((c) => {
        let diff = c.val - panAngle;
        while (diff < -180) diff += 360;
        while (diff > 180) diff -= 360;

        if (Math.abs(diff) < 60) {
          const cx = w / 2 + (diff / 60) * (w / 2);
          ctx.fillText(c.label, cx, 16);
          ctx.strokeStyle = 'rgba(255,255,255,0.2)';
          ctx.beginPath();
          ctx.moveTo(cx, 22);
          ctx.lineTo(cx, 28);
          ctx.stroke();
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [panAngle, scene, sceneIdx]);

  // Pointer event handlers for panning
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startX.current = e.clientX;
    startAngle.current = panAngle;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX.current;
    
    // Scale horizontal delta to degrees rotation
    const rotSpeed = 0.4;
    let nextAngle = startAngle.current - deltaX * rotSpeed;
    
    // Wrap around 360 degrees
    while (nextAngle < 0) nextAngle += 360;
    while (nextAngle >= 360) nextAngle -= 360;
    
    setPanAngle(nextAngle);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
      {/* 360 Viewport Container */}
      <div style={{ position: 'relative', width: '100%', height: '320px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none', cursor: isDragging ? 'grabbing' : 'grab' }}
          aria-label={`Concourse Street View showing: ${scene.title}. Drag left or right to look around.`}
        />
        
        {/* Sky HUD indicators */}
        <div style={{ position: 'absolute', top: '38px', left: '12px', background: 'rgba(13,17,23,0.85)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Eye size={12} color="var(--accent-green)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{scene.title}</span>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '8px', left: '8px', right: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none' }}>
          <div className="badge badge-glass" style={{ fontSize: '0.65rem', backdropFilter: 'blur(6px)' }}>
            🔀 Drag to look around in 360°
          </div>
          <button
            id="switch-to-2d-map-btn"
            className="badge badge-green"
            style={{ pointerEvents: 'auto', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={onFallbackTo2D}
            aria-label="Switch to 2D schematic map layout"
          >
            <RefreshCw size={10} aria-hidden /> Use 2D Map
          </button>
        </div>
      </div>

      {/* Street View checkpoints layout instructions */}
      <section className="surface-card" style={{ padding: '14px', borderTop: '2px solid var(--accent-green)' }}>
        <div className="flex items-center gap-xs" style={{ marginBottom: '8px' }}>
          <Accessibility size={16} color="var(--accent-green)" aria-hidden />
          <h3 className="h3" style={{ fontSize: '0.95rem' }}>Visual Street View Route Guidance</h3>
        </div>
        <p className="text-xs text-muted" style={{ lineHeight: 1.4 }}>
          {routeSteps && routeSteps[activeStepIndex] ? (
            <span>
              🚦 <strong>Step {activeStepIndex + 1}:</strong> {routeSteps[activeStepIndex].instruction}
              {routeSteps[activeStepIndex].landmark && ` (near ${routeSteps[activeStepIndex].landmark})`}
              {accessibleOnly && <span className="text-green" style={{ marginLeft: '6px', fontWeight: 600 }}>[Accessible Path]</span>}
            </span>
          ) : (
            <>
              {activeStepIndex === 0 && '🚦 Entrance Checkpoint: Proceed through Security lanes. Confirm wheelchair lane clearance on the right.'}
              {activeStepIndex === 1 && '🛒 Escalator Deck: Use the lift corridor just past Food Court 2 to ascend to Level 2 Concourse.'}
              {activeStepIndex === 2 && '🚪 Section Corridor: Section 114 entry deck is situated 25m past the First Aid medical station.'}
              {activeStepIndex >= 3 && '⚽ Seating View: Your seat at Row C is adjacent to the main wheelchair platforms looking at the center circle.'}
              {accessibleOnly && <span className="text-green" style={{ marginLeft: '6px', fontWeight: 600 }}>[Accessible Path]</span>}
            </>
          )}
        </p>
      </section>
    </div>
  );
}
