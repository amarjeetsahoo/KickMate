export interface Formation {
  id: string;
  name: string;
  description: string;
  positions: { x: number, y: number, label: string }[];
}

export const FORMATIONS: Formation[] = [
  {
    id: '4-3-3',
    name: '4-3-3 Attacking',
    description: 'Balanced formation with strong attacking presence on the wings.',
    positions: [
      { x: 50, y: 90, label: 'GK' },
      { x: 15, y: 70, label: 'LB' },
      { x: 35, y: 75, label: 'CB' },
      { x: 65, y: 75, label: 'CB' },
      { x: 85, y: 70, label: 'RB' },
      { x: 50, y: 55, label: 'CDM' },
      { x: 30, y: 40, label: 'CM' },
      { x: 70, y: 40, label: 'CM' },
      { x: 20, y: 20, label: 'LW' },
      { x: 50, y: 15, label: 'ST' },
      { x: 80, y: 20, label: 'RW' },
    ]
  },
  {
    id: '4-2-3-1',
    name: '4-2-3-1 Wide',
    description: 'Solid defensive base with four attacking players up front.',
    positions: [
      { x: 50, y: 90, label: 'GK' },
      { x: 15, y: 75, label: 'LB' },
      { x: 35, y: 80, label: 'CB' },
      { x: 65, y: 80, label: 'CB' },
      { x: 85, y: 75, label: 'RB' },
      { x: 35, y: 60, label: 'CDM' },
      { x: 65, y: 60, label: 'CDM' },
      { x: 20, y: 35, label: 'LM' },
      { x: 50, y: 35, label: 'CAM' },
      { x: 80, y: 35, label: 'RM' },
      { x: 50, y: 15, label: 'ST' },
    ]
  },
  {
    id: '3-5-2',
    name: '3-5-2',
    description: 'Midfield dominance with two strikers.',
    positions: [
      { x: 50, y: 90, label: 'GK' },
      { x: 25, y: 75, label: 'CB' },
      { x: 50, y: 80, label: 'CB' },
      { x: 75, y: 75, label: 'CB' },
      { x: 15, y: 45, label: 'LWB' },
      { x: 35, y: 55, label: 'CDM' },
      { x: 65, y: 55, label: 'CDM' },
      { x: 50, y: 40, label: 'CAM' },
      { x: 85, y: 45, label: 'RWB' },
      { x: 35, y: 15, label: 'ST' },
      { x: 65, y: 15, label: 'ST' },
    ]
  }
];
