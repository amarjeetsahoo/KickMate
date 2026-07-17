import { describe, it, expect } from 'vitest';
import { MOCK_LIVE_MATCH, createMockAlert, getSimulatedParkingStatus, SUSTAINABILITY_TIPS, ASSISTANT_SUGGESTIONS } from '../data/mockData';

describe('Mock data', () => {
  it('live match has valid structure', () => {
    expect(MOCK_LIVE_MATCH.homeTeam.name).toBeTruthy();
    expect(MOCK_LIVE_MATCH.awayTeam.name).toBeTruthy();
    expect(MOCK_LIVE_MATCH.stats.possession.home + MOCK_LIVE_MATCH.stats.possession.away).toBe(100);
    expect(Array.isArray(MOCK_LIVE_MATCH.events)).toBe(true);
  });

  it('createMockAlert generates valid SOS alert', () => {
    const alert = createMockAlert('medical', '114', 'SoFi Stadium');
    expect(alert.id).toMatch(/^sos-/);
    expect(alert.type).toBe('medical');
    expect(alert.status).toBe('pending');
    expect(alert.estimatedMinutes).toBeGreaterThan(0);
    expect(alert.stadium).toBe('SoFi Stadium');
  });

  it('createMockAlert works without optional params', () => {
    const alert = createMockAlert('general');
    expect(alert.type).toBe('general');
    expect(alert.seatInfo).toBeUndefined();
  });

  it('medical alerts respond faster than general alerts', () => {
    const med = createMockAlert('medical');
    const gen = createMockAlert('general');
    expect(med.estimatedMinutes).toBeLessThan(gen.estimatedMinutes);
  });

  it('getSimulatedParkingStatus stays within bounds', () => {
    for (let i = 0; i < 50; i++) {
      const result = getSimulatedParkingStatus(300, 600);
      expect(result.occupied).toBeGreaterThanOrEqual(0);
      expect(result.occupied).toBeLessThanOrEqual(600);
      expect(['open', 'filling', 'full']).toContain(result.status);
    }
  });

  it('sustainability tips and suggestions are non-empty arrays', () => {
    expect(SUSTAINABILITY_TIPS.length).toBeGreaterThan(0);
    expect(ASSISTANT_SUGGESTIONS.length).toBeGreaterThan(0);
  });
});
