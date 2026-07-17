import { useEffect, useRef, useState } from 'react';
import { getSimulatedCrowdDensity } from '../../services/agents/CrowdHeatmap';
import { STADIUMS } from '../../data/stadiums';
import type { StadiumId } from '../../types';

interface CrowdHeatmapVizProps {
  stadiumId: StadiumId;
}

interface HeatmapNode {
  id: string;
  x: number;
  y: number;
  radius: number;
  targetDensity: number;
  currentDensity: number;
  label: string;
}

export function CrowdHeatmapViz({ stadiumId }: CrowdHeatmapVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const [hoveredNode, setHoveredNode] = useState<HeatmapNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Map stadium zones to 2D canvas coordinates
  const nodesRef = useRef<HeatmapNode[]>([]);

  useEffect(() => {
    const stadium = STADIUMS.find(s => s.id === stadiumId) || STADIUMS[0];
    
    // Convert 3D zones to 2D heatmap nodes
    nodesRef.current = stadium.zones.map(z => ({
      id: z.id,
      x: z.x,
      y: z.y,
      radius: z.type === 'gate' ? 40 : z.type === 'section' ? 60 : 30,
      targetDensity: getSimulatedCrowdDensity(z.id).percentage,
      currentDensity: getSimulatedCrowdDensity(z.id).percentage,
      label: z.label
    }));
  }, [stadiumId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const draw = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Update canvas size if needed to match CSS size
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate scale to fit 560x420 viewBox (which is what NavigatorPage uses)
      const scaleX = canvas.width / 560;
      const scaleY = canvas.height / 420;

      nodesRef.current.forEach(node => {
        // Refresh target occasionally
        if (Math.random() < 0.02) {
          node.targetDensity = getSimulatedCrowdDensity(node.id).percentage;
        }

        // Interpolate current density to target
        node.currentDensity += (node.targetDensity - node.currentDensity) * dt * 2;

        const x = node.x * scaleX;
        const y = node.y * scaleY;
        const r = node.radius * Math.min(scaleX, scaleY);

        // Draw radial gradient
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
        
        let colorStr = 'rgba(0, 197, 94,';
        if (node.currentDensity > 70) colorStr = 'rgba(255, 59, 59,';
        else if (node.currentDensity > 35) colorStr = 'rgba(245, 158, 11,';

        gradient.addColorStop(0, `${colorStr} 0.6)`);
        gradient.addColorStop(0.5, `${colorStr} 0.2)`);
        gradient.addColorStop(1, `${colorStr} 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [stadiumId]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const scaleX = canvas.width / 560;
    const scaleY = canvas.height / 420;

    // Find hovered node
    const hovered = nodesRef.current.find(node => {
      const nx = node.x * scaleX;
      const ny = node.y * scaleY;
      const r = node.radius * Math.min(scaleX, scaleY);
      return Math.hypot(x - nx, y - ny) < r;
    });

    if (hovered) {
      setHoveredNode(hovered);
      setTooltipPos({ x: e.clientX, y: e.clientY });
    } else {
      setHoveredNode(null);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredNode(null)}
      />
      {hoveredNode && (
        <div style={{
          position: 'fixed',
          left: tooltipPos.x + 15,
          top: tooltipPos.y + 15,
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-color)',
          padding: '8px 12px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 100,
          pointerEvents: 'none',
          fontFamily: 'Inter',
        }}>
          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{hoveredNode.label}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Density: {Math.round(hoveredNode.currentDensity)}%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Est Wait: {Math.round(hoveredNode.currentDensity / 5)} mins
          </div>
        </div>
      )}
    </div>
  );
}
