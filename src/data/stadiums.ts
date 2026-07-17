import type { Stadium } from '../types';

/**
 * Stadium data for the 3 FIFA World Cup 2026 venues in scope.
 * Coordinates are real; zone positions are schematic for SVG navigation.
 */
export const STADIUMS: Stadium[] = [
  {
    id: 'sofi',
    name: 'SoFi Stadium',
    city: 'Inglewood',
    state: 'California',
    country: 'USA',
    capacity: 70240,
    coordinates: { lat: 33.9535, lng: -118.3392 },
    gates: ['A', 'B', 'C', 'D'],
    parkingZones: [
      { id: 'sofi-p1', name: 'Lot 1 – North', status: 'open',    capacity: 800, occupied: 120, walkMinutes: 5, nearGate: 'A', coordinates: { lat: 33.9560, lng: -118.3392 } },
      { id: 'sofi-p2', name: 'Lot 2 – East',  status: 'filling', capacity: 600, occupied: 480, walkMinutes: 8, nearGate: 'B', coordinates: { lat: 33.9535, lng: -118.3360 } },
      { id: 'sofi-p3', name: 'Lot 3 – South', status: 'full',    capacity: 500, occupied: 500, walkMinutes: 12, nearGate: 'D', coordinates: { lat: 33.9510, lng: -118.3392 } },
    ],
    zones: [
      // Gates
      { id: 'gate-a', label: 'Gate A', type: 'gate', x: 200, y: 50, z: 0 },
      { id: 'gate-b', label: 'Gate B', type: 'gate', x: 350, y: 50, z: 0 },
      { id: 'gate-c', label: 'Gate C', type: 'gate', x: 200, y: 350, z: 0 },
      { id: 'gate-d', label: 'Gate D', type: 'gate', x: 350, y: 350, z: 0 },
      // Sections (simplified)
      { id: 'sec-100', label: '100s', type: 'section', x: 200, y: 180, z: 0 },
      { id: 'sec-200', label: '200s', type: 'section', x: 280, y: 120, z: 10 },
      { id: 'sec-300', label: '300s', type: 'section', x: 280, y: 280, z: 20 },
      // Amenities
      { id: 'food-1', label: 'Food Court 1', type: 'food', x: 150, y: 200, z: 0, accessible: true },
      { id: 'food-2', label: 'Food Court 2', type: 'food', x: 400, y: 200, z: 10, accessible: true },
      { id: 'toilet-1', label: 'Restrooms N', type: 'toilet', x: 200, y: 150, z: 0, accessible: true },
      { id: 'toilet-2', label: 'Restrooms S', type: 'toilet', x: 350, y: 290, z: 10, accessible: true },
      { id: 'medical-1', label: 'Medical Room', type: 'medical', x: 280, y: 200, z: 0, accessible: true },
      { id: 'exit-1', label: 'Main Exit', type: 'exit', x: 280, y: 380, z: 0 },
    ],
  },
  {
    id: 'atnt',
    name: 'AT&T Stadium',
    city: 'Arlington',
    state: 'Texas',
    country: 'USA',
    capacity: 80000,
    coordinates: { lat: 32.7480, lng: -97.0930 },
    gates: ['A', 'B', 'C', 'D', 'E'],
    parkingZones: [
      { id: 'atnt-p1', name: 'Red Lot – North',  status: 'open',    capacity: 1200, occupied: 400,  walkMinutes: 7, nearGate: 'A', coordinates: { lat: 32.7510, lng: -97.0930 } },
      { id: 'atnt-p2', name: 'Blue Lot – West',  status: 'filling', capacity: 900,  occupied: 720,  walkMinutes: 10, nearGate: 'C', coordinates: { lat: 32.7480, lng: -97.0960 } },
      { id: 'atnt-p3', name: 'Gold Lot – East',  status: 'open',    capacity: 700,  occupied: 210,  walkMinutes: 6, nearGate: 'B', coordinates: { lat: 32.7480, lng: -97.0900 } },
    ],
    zones: [
      { id: 'gate-a', label: 'Gate A', type: 'gate', x: 200, y: 50, z: 0 },
      { id: 'gate-b', label: 'Gate B', type: 'gate', x: 350, y: 50, z: 0 },
      { id: 'gate-c', label: 'Gate C', type: 'gate', x: 130, y: 200, z: 0 },
      { id: 'gate-d', label: 'Gate D', type: 'gate', x: 200, y: 350, z: 0 },
      { id: 'gate-e', label: 'Gate E', type: 'gate', x: 350, y: 350, z: 0 },
      { id: 'sec-100', label: '100s', type: 'section', x: 200, y: 180, z: 0 },
      { id: 'sec-200', label: '200s', type: 'section', x: 280, y: 130, z: 10 },
      { id: 'sec-300', label: '300s', type: 'section', x: 280, y: 270, z: 20 },
      { id: 'food-1', label: 'Food Court 1', type: 'food', x: 160, y: 200, z: 0, accessible: true },
      { id: 'food-2', label: 'Food Court 2', type: 'food', x: 400, y: 180, z: 10, accessible: true },
      { id: 'toilet-1', label: 'Restrooms N', type: 'toilet', x: 210, y: 140, z: 0, accessible: true },
      { id: 'toilet-2', label: 'Restrooms S', type: 'toilet', x: 360, y: 295, z: 10, accessible: true },
      { id: 'medical-1', label: 'Medical Room', type: 'medical', x: 280, y: 200, z: 0, accessible: true },
      { id: 'exit-1', label: 'Main Exit', type: 'exit', x: 280, y: 380, z: 0 },
    ],
  },
  {
    id: 'metlife',
    name: 'MetLife Stadium',
    city: 'East Rutherford',
    state: 'New Jersey',
    country: 'USA',
    capacity: 82500,
    coordinates: { lat: 40.8135, lng: -74.0745 },
    gates: ['A', 'B', 'C', 'D'],
    parkingZones: [
      { id: 'ml-p1', name: 'Lot A – North',  status: 'open',    capacity: 1000, occupied: 300,  walkMinutes: 6, nearGate: 'A', coordinates: { lat: 40.8165, lng: -74.0745 } },
      { id: 'ml-p2', name: 'Lot B – East',   status: 'filling', capacity: 800,  occupied: 600,  walkMinutes: 9, nearGate: 'B', coordinates: { lat: 40.8135, lng: -74.0710 } },
      { id: 'ml-p3', name: 'Lot C – South',  status: 'full',    capacity: 600,  occupied: 600,  walkMinutes: 14, nearGate: 'D', coordinates: { lat: 40.8105, lng: -74.0745 } },
    ],
    zones: [
      { id: 'gate-a', label: 'Gate A', type: 'gate', x: 200, y: 50, z: 0 },
      { id: 'gate-b', label: 'Gate B', type: 'gate', x: 360, y: 50, z: 0 },
      { id: 'gate-c', label: 'Gate C', type: 'gate', x: 200, y: 355, z: 0 },
      { id: 'gate-d', label: 'Gate D', type: 'gate', x: 360, y: 355, z: 0 },
      { id: 'sec-100', label: '100s', type: 'section', x: 200, y: 185, z: 0 },
      { id: 'sec-200', label: '200s', type: 'section', x: 280, y: 125, z: 10 },
      { id: 'sec-300', label: '300s', type: 'section', x: 280, y: 280, z: 20 },
      { id: 'food-1', label: 'Food Court 1', type: 'food', x: 155, y: 205, z: 0, accessible: true },
      { id: 'food-2', label: 'Food Court 2', type: 'food', x: 405, y: 205, z: 10, accessible: true },
      { id: 'toilet-1', label: 'Restrooms N', type: 'toilet', x: 205, y: 155, z: 0, accessible: true },
      { id: 'toilet-2', label: 'Restrooms S', type: 'toilet', x: 355, y: 295, z: 10, accessible: true },
      { id: 'medical-1', label: 'Medical Room', type: 'medical', x: 280, y: 205, z: 0, accessible: true },
      { id: 'exit-1', label: 'Main Exit', type: 'exit', x: 280, y: 385, z: 0 },
    ],
  },
];

/** Get a stadium by ID */
export function getStadiumById(id: string): Stadium | undefined {
  return STADIUMS.find((s) => s.id === id);
}
