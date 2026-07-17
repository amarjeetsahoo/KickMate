import { describe, it, expect } from 'vitest';
import { STADIUMS, getStadiumById } from '../data/stadiums';

describe('Stadium data', () => {
  it('exports exactly 3 stadiums', () => {
    expect(STADIUMS).toHaveLength(3);
  });

  it('all stadiums have required fields', () => {
    STADIUMS.forEach((s) => {
      expect(s.id).toBeTruthy();
      expect(s.name).toBeTruthy();
      expect(s.capacity).toBeGreaterThan(0);
      expect(s.parkingZones.length).toBeGreaterThan(0);
      expect(s.zones.length).toBeGreaterThan(0);
      expect(s.gates.length).toBeGreaterThan(0);
    });
  });

  it('getStadiumById returns correct stadium', () => {
    expect(getStadiumById('sofi')?.name).toBe('SoFi Stadium');
    expect(getStadiumById('atnt')?.name).toBe('AT&T Stadium');
    expect(getStadiumById('metlife')?.name).toBe('MetLife Stadium');
  });

  it('returns undefined for unknown stadium ID', () => {
    expect(getStadiumById('unknown')).toBeUndefined();
  });

  it('all parking zones have valid status', () => {
    STADIUMS.forEach((s) => {
      s.parkingZones.forEach((z) => {
        expect(['open', 'filling', 'full']).toContain(z.status);
        expect(z.capacity).toBeGreaterThan(0);
        expect(z.walkMinutes).toBeGreaterThan(0);
      });
    });
  });

  it('all zones have valid coordinates', () => {
    STADIUMS.forEach((s) => {
      s.zones.forEach((z) => {
        expect(typeof z.x).toBe('number');
        expect(typeof z.y).toBe('number');
      });
    });
  });
});
