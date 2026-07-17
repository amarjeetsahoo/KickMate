import { useEffect, useRef, useState } from 'react';
import { Stadium3DController } from '../../services/agents/Stadium3DController';
import type { Waypoint3D } from '../../services/agents/Stadium3DController';
import type { StadiumZone } from '../../types';
import { Accessibility, RefreshCw } from 'lucide-react';

interface Stadium3DViewProps {
  zones: StadiumZone[];
  routeSteps?: { instruction: string; landmark?: string; floor?: number }[];
  activeStepIndex: number;
  accessibleOnly: boolean;
  onSelectZone?: (zoneId: string) => void;
  onFallbackTo2D: () => void;
}

export function Stadium3DView({
  zones,
  routeSteps = [],
  activeStepIndex,
  accessibleOnly,
  onSelectZone,
  onFallbackTo2D
}: Stadium3DViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<Stadium3DController | null>(null);
  const [webGLSupportError, setWebGLSupportError] = useState(false);

  // Map StadiumZone object array to Waypoint3D array for the 3D controller
  const getWaypoints = (): Waypoint3D[] => {
    return zones.map(z => ({
      id: z.id,
      label: z.label,
      type: z.type,
      x: z.x,
      y: z.y,
      z: z.z ?? 0
    }));
  };

  // Convert step strings or matched landmarks to Waypoint3D path array
  const getRouteWaypoints = (): Waypoint3D[] => {
    const waypoints: Waypoint3D[] = [];
    routeSteps.forEach(step => {
      // Find matching zone in the stadium database based on landmark string matching
      const landmarkLower = (step.landmark || '').toLowerCase();
      const instructionLower = step.instruction.toLowerCase();

      let matchedZone = zones.find(z => {
        if (z.id === 'gate-a' && (instructionLower.includes('gate a') || landmarkLower.includes('gate a'))) return true;
        if (z.id === 'gate-b' && (instructionLower.includes('gate b') || landmarkLower.includes('gate b'))) return true;
        if (z.id === 'gate-c' && (instructionLower.includes('gate c') || landmarkLower.includes('gate c'))) return true;
        if (z.id === 'gate-d' && (instructionLower.includes('gate d') || landmarkLower.includes('gate d'))) return true;
        if (z.id === 'gate-e' && (instructionLower.includes('gate e') || landmarkLower.includes('gate e'))) return true;
        if (z.id === 'sec-100' && (instructionLower.includes('100') || landmarkLower.includes('100'))) return true;
        if (z.id === 'sec-200' && (instructionLower.includes('200') || landmarkLower.includes('200'))) return true;
        if (z.id === 'sec-300' && (instructionLower.includes('300') || landmarkLower.includes('300'))) return true;
        if (z.id === 'food-1' && (instructionLower.includes('food court 1') || landmarkLower.includes('food court 1') || instructionLower.includes('concession'))) return true;
        if (z.id === 'food-2' && (instructionLower.includes('food court 2') || landmarkLower.includes('food court 2'))) return true;
        if (z.id === 'toilet-1' && (instructionLower.includes('restroom') || landmarkLower.includes('restroom'))) return true;
        if (z.id === 'medical-1' && (instructionLower.includes('medical') || landmarkLower.includes('medical') || instructionLower.includes('first aid'))) return true;
        return false;
      });

      if (!matchedZone && landmarkLower) {
        // Fallback fuzzy match
        matchedZone = zones.find(z => landmarkLower.includes(z.label.toLowerCase()) || z.label.toLowerCase().includes(landmarkLower));
      }

      if (matchedZone) {
        waypoints.push({
          id: matchedZone.id,
          label: matchedZone.label,
          type: matchedZone.type,
          x: matchedZone.x,
          y: matchedZone.y,
          z: matchedZone.z ?? 0
        });
      }
    });

    return waypoints;
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      // Check if WebGL context can be established using a temporary offscreen canvas
      const tempCanvas = document.createElement('canvas');
      const gl = tempCanvas.getContext('webgl') || tempCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGLSupportError(true);
        return;
      }

      // Initialize Three.js Controller
      const controller = new Stadium3DController(canvasRef.current, (zoneId) => {
        if (onSelectZone) onSelectZone(zoneId);
      });

      controllerRef.current = controller;

      // Populate waypoints
      const allWaypoints = getWaypoints();
      controller.setWaypoints(allWaypoints);

      // Draw initial route
      const routeWaypoints = getRouteWaypoints();
      controller.drawRoute(routeWaypoints);

      // Focus on initial step if available
      if (routeWaypoints.length > 0 && activeStepIndex < routeWaypoints.length) {
        const target = routeWaypoints[activeStepIndex];
        controller.focusOn(target.x, target.y, target.z);
      }

      return () => {
        controller.destroy();
        controllerRef.current = null;
      };
    } catch {
      setWebGLSupportError(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zones]);

  // Redraw route line when steps change
  useEffect(() => {
    if (!controllerRef.current) return;
    const routeWaypoints = getRouteWaypoints();
    controllerRef.current.drawRoute(routeWaypoints);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeSteps]);

  // Smoothly pan camera to the active step's focus point
  useEffect(() => {
    if (!controllerRef.current) return;
    const routeWaypoints = getRouteWaypoints();
    if (routeWaypoints.length > 0 && activeStepIndex < routeWaypoints.length) {
      const target = routeWaypoints[activeStepIndex];
      controllerRef.current.focusOn(target.x, target.y, target.z);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStepIndex]);

  if (webGLSupportError) {
    return (
      <div className="surface-card text-center" style={{ padding: '24px', margin: '16px' }}>
        <h3 className="h3" style={{ marginBottom: '8px', color: 'var(--accent-red)' }}>3D WebGL Not Supported</h3>
        <p className="text-sm text-muted" style={{ marginBottom: '16px' }}>
          Your device or browser doesn't support WebGL graphics acceleration.
        </p>
        <button
          id="webgl-fallback-btn"
          className="btn btn-primary"
          onClick={onFallbackTo2D}
          aria-label="Switch to 2D Map fallback"
        >
          Use 2D Schematic Map
        </button>
      </div>
    );
  }

  // Accessibility Checkpoints details with mock photo descriptors
  const accessibilityCheckpoints = [
    {
      title: "Entrance Gate Elevator Access",
      desc: "Step-free ramp entry at Gate B leading to the East Lift terminal.",
      badge: "Ramp Entrance",
      photoDesc: "Visual Checkpoint: Look for the blue wheelchair symbol at Gate B pillar."
    },
    {
      title: "Main Level Concourse Elevator",
      desc: "East Elevator corridor near Section 118, accesses Levels 2 and 3.",
      badge: "Elevator Panel",
      photoDesc: "Visual Checkpoint: Lifts are marked with overhead lit indicators."
    },
    {
      title: "Wheelchair Seating Row 14",
      desc: "Platform seating row with companion seats and power outlets.",
      badge: "Platform Spot",
      photoDesc: "Visual Checkpoint: Dedicated flat deck marked with floor decals."
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
      {/* 3D WebGL Viewport */}
      <div style={{ position: 'relative', width: '100%', height: '320px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <canvas
          ref={canvasRef}
          id="stadium-3d-canvas"
          style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
          aria-label="3D Interactive Stadium Map. Drag to rotate, pinch to zoom."
        />
        
        <div style={{ position: 'absolute', bottom: '8px', left: '8px', right: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none' }}>
          <div className="badge badge-glass" style={{ fontSize: '0.65rem', backdropFilter: 'blur(6px)' }}>
            🖱️ Drag to rotate • Pinch to zoom
          </div>
          <button
            id="switch-to-2d-map-btn"
            className="badge badge-green"
            style={{ pointerEvents: 'auto', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={onFallbackTo2D}
            aria-label="Switch to 2D schematic map layout"
          >
            <RefreshCw size={10} aria-hidden /> Switch to 2D
          </button>
        </div>
      </div>

      {/* Accessible Split-Screen Photo Checkpoints */}
      {accessibleOnly && (
        <section
          id="accessibility-checkpoints-panel"
          className="surface-card animate-slide-up"
          style={{ padding: '14px', borderTop: '2px solid var(--accent-green)' }}
          aria-label="Wheelchair accessible checkpoints"
        >
          <div className="flex items-center gap-xs" style={{ marginBottom: '10px' }}>
            <Accessibility size={16} color="var(--accent-green)" aria-hidden />
            <h3 className="h3" style={{ fontSize: '0.95rem' }}>Accessible Verification Checkpoints</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {accessibilityCheckpoints.map((cp, idx) => (
              <div
                key={idx}
                id={`accessibility-checkpoint-item-${idx}`}
                className="flex gap-sm items-start"
                style={{
                  padding: '8px 10px',
                  background: activeStepIndex === idx ? 'var(--accent-green-dim)' : 'var(--bg-glass)',
                  border: activeStepIndex === idx ? '1px solid var(--accent-green)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  transition: 'all 0.2s ease-key'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-xs" style={{ marginBottom: '2px' }}>
                    <span className="badge badge-glass" style={{ fontSize: '0.6rem', padding: '2px 6px', color: 'var(--accent-green)' }}>{cp.badge}</span>
                    <strong style={{ fontSize: '0.85rem' }}>{cp.title}</strong>
                  </div>
                  <p className="text-xs text-muted" style={{ lineHeight: 1.3 }}>{cp.desc}</p>
                  
                  {/* Photo details container */}
                  <div style={{
                    marginTop: '6px',
                    padding: '6px',
                    borderRadius: '4px',
                    background: 'var(--bg-card)',
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: '1px dashed var(--border)'
                  }}>
                    <span aria-hidden>📸</span>
                    <span className="text-green" style={{ fontWeight: 500 }}>{cp.photoDesc}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
