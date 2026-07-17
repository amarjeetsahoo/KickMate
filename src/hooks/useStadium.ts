import { useState, useCallback } from 'react';
import { storage } from '../services/storage';
import { getStadiumById } from '../data/stadiums';
import type { Stadium, StadiumId, SeatInfo, DestinationType, NavigationRoute, NavigationStep } from '../types';

/**
 * Hook for stadium navigation logic: seat parsing, route generation, step tracking.
 */
export function useStadium() {
  const [selectedStadiumId, setSelectedStadiumId] = useState<StadiumId | null>(
    () => storage.getStadium() as StadiumId | null
  );
  const [seatInfo, setSeatInfo] = useState<Partial<SeatInfo> | null>(null);
  const [destination, setDestination] = useState<DestinationType>('seat');
  const [activeRoute, setActiveRoute] = useState<NavigationRoute | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [accessibleOnly, setAccessibleOnly] = useState(false);

  const stadium: Stadium | undefined = selectedStadiumId
    ? getStadiumById(selectedStadiumId)
    : undefined;

  const selectStadium = useCallback((id: StadiumId) => {
    setSelectedStadiumId(id);
    storage.setStadium(id);
    setActiveRoute(null);
    setCurrentStep(0);
  }, []);

  /** Parse a seat string like "Section 114, Row C, Seat 22" */
  const parseSeatString = useCallback((input: string): Partial<SeatInfo> => {
    const sectionMatch = input.match(/(?:section|sec|blk|block)?\s*(\d{3}[A-Za-z]?)/i);
    const rowMatch = input.match(/row\s*([A-Za-z]\d?)/i);
    const seatMatch = input.match(/seat\s*(\d+)/i);
    return {
      section: sectionMatch?.[1] ?? '',
      row: rowMatch?.[1]?.toUpperCase() ?? '',
      seat: seatMatch?.[1] ?? '',
      gate: sectionMatch ? getGateForSection(sectionMatch[1]) : 'A',
    };
  }, []);

  /** Build a navigation route for the given destination */
  const buildRoute = useCallback(
    (dest: DestinationType, seat?: Partial<SeatInfo>): NavigationRoute => {
      const steps = generateSteps(dest, seat, stadium?.name ?? 'the stadium', accessibleOnly);
      const dotPath = generateDotPath(dest, stadium?.id ?? 'sofi');
      return {
        from: 'Entry Gate',
        to: dest,
        steps,
        estimatedMinutes: steps.length * 2,
        isAccessible: accessibleOnly,
        dotPath,
      };
    },
    [stadium, accessibleOnly]
  );

  const navigate = useCallback(
    (dest: DestinationType, seat?: Partial<SeatInfo>) => {
      if (seat) setSeatInfo(seat);
      setDestination(dest);
      const route = buildRoute(dest, seat);
      setActiveRoute(route);
      setCurrentStep(0);
    },
    [buildRoute]
  );

  const advanceStep = useCallback(() => {
    if (!activeRoute) return;
    const next = Math.min(currentStep + 1, activeRoute.steps.length - 1);
    setCurrentStep(next);
    if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
  }, [activeRoute, currentStep]);

  const clearRoute = useCallback(() => {
    setActiveRoute(null);
    setCurrentStep(0);
    setSeatInfo(null);
  }, []);

  return {
    stadium,
    selectedStadiumId,
    seatInfo,
    destination,
    activeRoute,
    currentStep,
    accessibleOnly,
    selectStadium,
    parseSeatString,
    navigate,
    advanceStep,
    clearRoute,
    setAccessibleOnly,
    setSeatInfo,
    setDestination,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGateForSection(section: string): string {
  const num = parseInt(section, 10);
  if (isNaN(num)) return 'A';
  if (num <= 120) return 'A';
  if (num <= 220) return 'B';
  if (num <= 320) return 'C';
  return 'D';
}

function generateSteps(
  dest: DestinationType,
  seat: Partial<SeatInfo> | undefined,
  _stadiumName: string,
  accessible: boolean
): NavigationStep[] {
  const gate = seat?.gate ?? 'B';
  const transport = accessible ? 'elevator' : 'escalator';

  const baseSteps: Record<DestinationType, NavigationStep[]> = {
    seat: [
      { id: 's1', instruction: `Enter through Gate ${gate}`, status: 'completed', landmark: 'Security checkpoint' },
      { id: 's2', instruction: `Take the ${transport} to Level 2`, status: 'current', floor: 2 },
      { id: 's3', instruction: `Walk straight for approximately 180 meters`, status: 'upcoming' },
      { id: 's4', instruction: `Turn right at Food Court 3`, status: 'upcoming', landmark: 'Food Court 3' },
      { id: 's5', instruction: `Section ${seat?.section ?? '114'} is on your left`, status: 'upcoming' },
      { id: 's6', instruction: `Row ${seat?.row ?? 'C'}, Seat ${seat?.seat ?? '22'} ⭐`, status: 'upcoming' },
    ],
    food: [
      { id: 'f1', instruction: `Enter through Gate ${gate}`, status: 'completed' },
      { id: 'f2', instruction: 'Stay on Level 1 concourse', status: 'current', floor: 1 },
      { id: 'f3', instruction: 'Turn left at the main concourse', status: 'upcoming', landmark: 'KickMate Welcome Desk' },
      { id: 'f4', instruction: 'Food Court 1 is 50m ahead on your right 🍔', status: 'upcoming' },
    ],
    toilet: [
      { id: 't1', instruction: `Enter through Gate ${gate}`, status: 'completed' },
      { id: 't2', instruction: 'Follow the blue restroom signs on Level 1', status: 'current', floor: 1 },
      { id: 't3', instruction: `Restrooms are ${accessible ? '(accessible) ' : ''}40m ahead 🚻`, status: 'upcoming' },
    ],
    medical: [
      { id: 'm1', instruction: `Enter through Gate ${gate}`, status: 'completed' },
      { id: 'm2', instruction: `Take the ${transport} to Level 1`, status: 'current', floor: 1 },
      { id: 'm3', instruction: 'Follow the red cross signage', status: 'upcoming', landmark: 'Red cross signs' },
      { id: 'm4', instruction: 'Medical Room is near Section 110 ⚕️', status: 'upcoming' },
    ],
    exit: [
      { id: 'e1', instruction: 'Head towards the nearest concourse exit sign', status: 'current' },
      { id: 'e2', instruction: 'Follow the green EXIT arrows', status: 'upcoming', landmark: 'Green EXIT arrow' },
      { id: 'e3', instruction: `Main exit is at Gate ${gate} 🚪`, status: 'upcoming' },
    ],
  };

  return baseSteps[dest] ?? baseSteps.seat;
}

function generateDotPath(dest: DestinationType, _stadiumId: string): Array<{ x: number; y: number }> {
  // Schematic SVG dot paths from Gate B entry point to each destination type
  const paths: Record<string, Array<{ x: number; y: number }>> = {
    seat:    [{ x: 280, y: 55 }, { x: 280, y: 100 }, { x: 280, y: 150 }, { x: 250, y: 180 }, { x: 210, y: 185 }],
    food:    [{ x: 280, y: 55 }, { x: 280, y: 100 }, { x: 200, y: 130 }, { x: 155, y: 200 }],
    toilet:  [{ x: 280, y: 55 }, { x: 260, y: 90 }, { x: 210, y: 150 }],
    medical: [{ x: 280, y: 55 }, { x: 280, y: 110 }, { x: 280, y: 200 }],
    exit:    [{ x: 280, y: 55 }, { x: 280, y: 200 }, { x: 280, y: 385 }],
  };
  return paths[dest] ?? paths.seat;
}
