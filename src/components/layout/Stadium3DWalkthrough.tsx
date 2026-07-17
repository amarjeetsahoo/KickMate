import { useRef, useEffect, useState, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Play, Pause, SkipForward, Globe, AlertTriangle } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Stadium3DWalkthroughProps {
  activeStepIndex: number;
  onAdvanceStep?: () => void;
}

// ─── Camera Waypoints ────────────────────────────────────────────────────────
const WAYPOINTS = [
  {
    label: 'Gate B – Entrance',
    description: 'Main entrance portal. Proceed through security screening.',
    eye: new THREE.Vector3(0, 22, 52),
    target: new THREE.Vector3(0, 0, 0),
  },
  {
    label: 'Concourse Level 2',
    description: 'Follow signs past Food Court 2, take escalator on your left.',
    eye: new THREE.Vector3(-32, 14, 22),
    target: new THREE.Vector3(-10, 4, 0),
  },
  {
    label: 'Section 114 Entry',
    description: 'Enter through section portal – watch for step markers.',
    eye: new THREE.Vector3(-14, 10, 18),
    target: new THREE.Vector3(0, 4, 0),
  },
  {
    label: 'Row C – Your Seat',
    description: 'You have arrived! Row C, Seat 22. Enjoy the match! ⚽',
    eye: new THREE.Vector3(2, 6, 32),
    target: new THREE.Vector3(0, 0, 0),
  },
];

// ─── Animated Camera (lerp-based, no shadows, single useFrame) ──────────────
function CameraRig({ targetEye, targetLookAt }: { targetEye: THREE.Vector3; targetLookAt: THREE.Vector3 }) {
  const { camera } = useThree();
  const eyeRef = useRef(new THREE.Vector3().copy(targetEye));
  const lookRef = useRef(new THREE.Vector3().copy(targetLookAt));

  useFrame(() => {
    eyeRef.current.lerp(targetEye, 0.04);
    lookRef.current.lerp(targetLookAt, 0.04);
    camera.position.copy(eyeRef.current);
    camera.lookAt(lookRef.current);
  });

  return null;
}

// ─── Pitch ────────────────────────────────────────────────────────────────────
// Uses a single textured plane — no per-line meshes
function Pitch() {
  const pitchGeo = useMemo(() => new THREE.PlaneGeometry(60, 38), []);
  const pitchMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2d7a3a' }), []);

  // Build pitch lines as a single LineSegments object
  const linesGeo = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const add = (x1: number, z1: number, x2: number, z2: number) => {
      points.push(new THREE.Vector3(x1, 0.05, z1));
      points.push(new THREE.Vector3(x2, 0.05, z2));
    };
    // Boundary
    add(-30, -19, 30, -19); add(-30, 19, 30, 19);
    add(-30, -19, -30, 19); add(30, -19, 30, 19);
    // Halfway
    add(0, -19, 0, 19);
    // Centre circle (approximated as 16-segment polygon)
    const r = 9.15;
    const segs = 32;
    for (let i = 0; i < segs; i++) {
      const a1 = (i / segs) * Math.PI * 2;
      const a2 = ((i + 1) / segs) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(a1) * r, 0.05, Math.sin(a1) * r));
      points.push(new THREE.Vector3(Math.cos(a2) * r, 0.05, Math.sin(a2) * r));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, []);
  const linesMat = useMemo(() => new THREE.LineBasicMaterial({ color: '#e8f5e9' }), []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={pitchGeo} material={pitchMat} />
      <lineSegments geometry={linesGeo} material={linesMat} />
      {/* Goal posts — 2 goals, 5 cylinders each: minimal */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 30.5, 0, 0]}>
          <mesh position={[0, 1.22, -3.66]}>
            <cylinderGeometry args={[0.1, 0.1, 2.44, 8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 1.22, 3.66]}>
            <cylinderGeometry args={[0.1, 0.1, 2.44, 8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 2.44, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 7.32, 8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── Stand Tier — ONE mesh per stand, no individual seats ─────────────────────
function StandTier({
  position,
  rotation,
  length,
  color,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  length: number;
  color: string;
}) {
  // Each stand is a single tapered box — just 1 mesh, 1 draw call
  const geo = useMemo(() => new THREE.BoxGeometry(length, 10, 9), [length]);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color }), [color]);

  // Stripe overlay — single plane on top face
  const stripeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff', transparent: true, opacity: 0.06,
  }), []);

  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geo} material={mat} />
      {/* Thin white stripe accent */}
      <mesh position={[0, 5.1, 0]}>
        <planeGeometry args={[length, 9]} />
        <primitive object={stripeMat} />
      </mesh>
    </group>
  );
}

// ─── Stadium Shell — roof + outer wall ───────────────────────────────────────
function StadiumShell() {
  return (
    <group>
      {/* Outer facade cylinder */}
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[42, 44, 18, 48, 1, true]} />
        <meshStandardMaterial color="#0f172a" side={THREE.BackSide} />
      </mesh>
      {/* Roof ring */}
      <mesh position={[0, 14.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[38, 2, 8, 48]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Roof canopy */}
      <mesh position={[0, 16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[22, 40, 48]} />
        <meshStandardMaterial color="#e8edf5" transparent opacity={0.75} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ─── Gate Markers — HTML labels only, no heavy 3D arches ─────────────────────
function GateMarkers({ activeStep }: { activeStep: number }) {
  const gates = useMemo(() => [
    { pos: [0, 1, 43] as [number, number, number], label: 'Gate A' },
    { pos: [-43, 1, 0] as [number, number, number], label: 'Gate B ★' },
    { pos: [0, 1, -43] as [number, number, number], label: 'Gate C' },
    { pos: [43, 1, 0] as [number, number, number], label: 'Gate D' },
  ], []);

  return (
    <>
      {gates.map((g, i) => {
        const isActive = i === 1 && activeStep === 0; // Gate B on step 0
        return (
          <Html key={g.label} position={g.pos} center distanceFactor={18}>
            <div style={{
              background: isActive ? 'rgba(34,197,94,0.9)' : 'rgba(15,23,42,0.8)',
              color: '#fff', padding: '3px 8px', borderRadius: 6,
              fontSize: 11, fontWeight: 700, fontFamily: 'Figtree, sans-serif',
              border: `1px solid ${isActive ? '#22c55e' : '#334155'}`,
              whiteSpace: 'nowrap', pointerEvents: 'none',
            }}>
              {g.label}
            </div>
          </Html>
        );
      })}
    </>
  );
}

// ─── Nav path dots ────────────────────────────────────────────────────────────
const PATH_POINTS: [number, number, number][] = [
  [-38, 1, 0], [-28, 3, 8], [-18, 6, 14], [-10, 7, 18],
];

function NavDot({ position, done, active }: { position: [number, number, number]; done: boolean; active: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (active && meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 4) * 0.15);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.55, 12, 12]} />
      <meshStandardMaterial
        color={done || active ? '#22c55e' : '#334155'}
        emissive={active ? '#22c55e' : '#000000'}
        emissiveIntensity={active ? 1.5 : 0}
      />
    </mesh>
  );
}

function NavPath({ activeStep }: { activeStep: number }) {
  const currentPos = PATH_POINTS[Math.min(activeStep, PATH_POINTS.length - 1)];

  return (
    <>
      {PATH_POINTS.map((pos, i) => (
        <NavDot key={i} position={pos} done={i < activeStep} active={i === activeStep} />
      ))}
      <Html position={[currentPos[0], currentPos[1] + 2.5, currentPos[2]]} center distanceFactor={14}>
        <div style={{
          background: 'rgba(34,197,94,0.92)', color: '#fff',
          padding: '3px 10px', borderRadius: 8,
          fontSize: 11, fontWeight: 800, fontFamily: 'Figtree, sans-serif',
          whiteSpace: 'nowrap', pointerEvents: 'none',
        }}>
          ▼ You are here
        </div>
      </Html>
    </>
  );
}

// ─── Floodlights — 4 towers, each 2 meshes ───────────────────────────────────
const TOWER_POSITIONS: [number, number, number][] = [
  [-34, 0, -22], [34, 0, -22], [-34, 0, 22], [34, 0, 22],
];

function Floodlights() {
  return (
    <>
      {TOWER_POSITIONS.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh>
            <cylinderGeometry args={[0.35, 0.55, 20, 6]} />
            <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 11, 0]}>
            <boxGeometry args={[2.5, 0.6, 2.5]} />
            <meshStandardMaterial color="#e2e8f0" emissive="#fffde7" emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}
    </>
  );
}

// ─── Full scene ───────────────────────────────────────────────────────────────
function StadiumScene({ activeStep }: { activeStep: number }) {
  const wp = WAYPOINTS[Math.min(activeStep, WAYPOINTS.length - 1)];

  return (
    <>
      <CameraRig targetEye={wp.eye} targetLookAt={wp.target} />

      {/* Lights — no shadow maps */}
      <ambientLight intensity={0.9} />
      <directionalLight position={[30, 40, 30]} intensity={1.5} />
      <directionalLight position={[-30, 20, -30]} intensity={0.55} color="#aaddff" />
      <pointLight position={[0, 18, 0]} intensity={0.7} color="#fffbea" />

      {/* Starfield background */}
      <color attach="background" args={['#020617']} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#0a0f1a" />
      </mesh>

      <Pitch />
      <StadiumShell />

      {/* Stands — 4 tiers, 1 mesh each */}
      <StandTier position={[0, -1, 24]} rotation={[0.3, 0, 0]} length={62} color="#7f1d1d" />
      <StandTier position={[0, -1, -24]} rotation={[-0.3, 0, 0]} length={62} color="#7f1d1d" />
      <StandTier position={[35, -1, 0]} rotation={[0, -Math.PI / 2, 0.3]} length={44} color="#1e3a8a" />
      <StandTier position={[-35, -1, 0]} rotation={[0, Math.PI / 2, 0.3]} length={44} color="#1e3a8a" />

      <GateMarkers activeStep={activeStep} />
      <NavPath activeStep={activeStep} />
      <Floodlights />
    </>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function Stadium3DWalkthrough({ activeStepIndex, onAdvanceStep }: Stadium3DWalkthroughProps) {
  const [autoTour, setAutoTour] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const currentWaypoint = WAYPOINTS[Math.min(activeStepIndex, WAYPOINTS.length - 1)];

  // Auto-tour
  useEffect(() => {
    if (!autoTour) return;
    const timer = setInterval(() => {
      if (onAdvanceStep) onAdvanceStep();
    }, 6000);
    return () => clearInterval(timer);
  }, [autoTour, onAdvanceStep]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Viewport */}
      <div style={{
        position: 'relative', width: '100%', height: '360px',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        border: '1px solid var(--border)', background: '#020617',
      }}>
        {contextLost ? (
          /* Graceful fallback when WebGL context is unavailable */
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '24px',
          }}>
            <AlertTriangle size={32} color="var(--accent-amber)" />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '260px', lineHeight: 1.5 }}>
              GPU context lost. Try switching to <strong>Satellite Map</strong> view, or reload the page.
            </p>
            <button
              className="btn btn-glass"
              style={{ fontSize: '0.8rem', padding: '8px 16px' }}
              onClick={() => { setContextLost(false); }}
            >
              Retry 3D
            </button>
          </div>
        ) : (
          <Canvas
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: 'default',
              failIfMajorPerformanceCaveat: false,
            }}
            dpr={Math.min(window.devicePixelRatio, 1.5)}
            onCreated={({ gl }) => {
              gl.domElement.addEventListener('webglcontextlost', () => {
                setContextLost(true);
              });
            }}
            aria-label="Interactive 3D stadium navigation view"
          >
            <PerspectiveCamera makeDefault fov={55} near={0.5} far={400} />
            <Suspense fallback={null}>
              <StadiumScene activeStep={activeStepIndex} />
            </Suspense>
            <OrbitControls
              enablePan={false}
              minDistance={8}
              maxDistance={80}
              minPolarAngle={0.1}
              maxPolarAngle={Math.PI / 2.1}
            />
          </Canvas>
        )}

        {/* Step HUD */}
        {!contextLost && (
          <div style={{
            position: 'absolute', top: '10px', left: '10px',
            background: 'rgba(15,23,42,0.92)', padding: '6px 12px',
            borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-green)',
            display: 'flex', alignItems: 'center', gap: '6px', pointerEvents: 'none',
          }}>
            <Globe size={11} color="var(--accent-green)" />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>
              {activeStepIndex + 1}/{WAYPOINTS.length} · {currentWaypoint.label}
            </span>
          </div>
        )}

        {/* Auto-tour badge */}
        {autoTour && !contextLost && (
          <div style={{
            position: 'absolute', top: '10px', right: '10px',
            background: 'rgba(245,158,11,0.18)', padding: '4px 10px',
            borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-amber)',
            fontSize: '0.65rem', color: 'var(--accent-amber)', fontWeight: 700, pointerEvents: 'none',
          }}>
            ▶ AUTO-TOUR
          </div>
        )}

        {/* Hint */}
        {!contextLost && (
          <div style={{
            position: 'absolute', bottom: '8px', right: '8px',
            background: 'rgba(15,23,42,0.65)', padding: '3px 7px',
            borderRadius: 4, fontSize: '0.6rem', color: 'var(--text-muted)', pointerEvents: 'none',
          }}>
            🖱 Drag · Scroll
          </div>
        )}
      </div>

      {/* Controls */}
      <section className="surface-card" style={{ padding: '14px' }}>
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)',
              boxShadow: '0 0 8px var(--accent-green)',
            }} />
            <strong style={{ fontSize: '0.9rem' }}>{currentWaypoint.label}</strong>
          </div>
          <p className="text-xs text-muted" style={{ lineHeight: 1.4, paddingLeft: '16px' }}>
            {currentWaypoint.description}
          </p>
        </div>

        {/* Waypoint quick-jump */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {WAYPOINTS.map((wp, idx) => (
            <button
              key={idx}
              id={`walkthrough-waypoint-${idx}`}
              className={`badge ${idx === activeStepIndex ? 'badge-green' : 'badge-glass'}`}
              style={{ cursor: 'pointer', border: 'none', fontSize: '0.65rem', padding: '5px 10px' }}
              aria-label={`Jump to ${wp.label}`}
            >
              {idx + 1}. {wp.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            id="walkthrough-prev-btn"
            className="btn btn-glass"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', fontSize: '0.8rem' }}
            disabled={activeStepIndex === 0}
            aria-label="Previous waypoint"
          >
            ← Prev
          </button>
          <button
            id="walkthrough-auto-tour-btn"
            className="btn btn-glass"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.8rem',
              background: autoTour ? 'rgba(245,158,11,0.15)' : undefined,
              borderColor: autoTour ? 'var(--accent-amber)' : undefined,
              color: autoTour ? 'var(--accent-amber)' : undefined,
            }}
            onClick={() => setAutoTour(p => !p)}
            aria-label={autoTour ? 'Pause auto-tour' : 'Start auto-tour'}
          >
            {autoTour ? <Pause size={14} /> : <Play size={14} />}
            {autoTour ? 'Pause' : 'Auto Tour'}
          </button>
          <button
            id="walkthrough-next-btn"
            className="btn btn-primary"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', fontSize: '0.8rem' }}
            disabled={activeStepIndex >= WAYPOINTS.length - 1}
            onClick={() => { if (onAdvanceStep) onAdvanceStep(); }}
            aria-label="Next waypoint"
          >
            Next <SkipForward size={14} />
          </button>
        </div>
      </section>
    </div>
  );
}
