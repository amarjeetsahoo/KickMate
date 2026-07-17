

export type DensityLevel = 'low' | 'medium' | 'high';

export interface CrowdDensity {
  zoneId: string;
  level: DensityLevel;
  percentage: number;
}

// Generate deterministic simulated density based on section ID and time
export function getSimulatedCrowdDensity(zoneId: string): CrowdDensity {
  const hash = zoneId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Create dynamic updates using time
  const minuteSeed = Math.floor(Date.now() / 15000); // changes every 15s
  const val = (hash + minuteSeed) % 100;

  let level: DensityLevel = 'low';
  if (val > 70) {
    level = 'high';
  } else if (val > 35) {
    level = 'medium';
  }

  return {
    zoneId,
    level,
    percentage: val,
  };
}

export function getStadiumCrowdStatus(zoneIds: string[]): Record<string, CrowdDensity> {
  const status: Record<string, CrowdDensity> = {};
  zoneIds.forEach((id) => {
    status[id] = getSimulatedCrowdDensity(id);
  });
  return status;
}
