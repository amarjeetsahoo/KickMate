export interface Player {
  id: string;
  name: string;
  number: number;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  club: string;
  age: number;
  caps: number;
  goals: number;
  marketValue: string;
  photoUrl?: string;
}

export interface Squad {
  code: string;
  name: string;
  flag: string;
  group: string;
  coach: string;
  players: Player[];
}

export const SQUADS: Squad[] = [
  {
    code: 'USA',
    name: 'United States',
    flag: '🇺🇸',
    group: 'Group A',
    coach: 'Gregg Berhalter',
    players: [
      { id: 'us-1', name: 'Matt Turner', number: 1, position: 'GK', club: 'Nottingham Forest', age: 31, caps: 50, goals: 0, marketValue: '€10M' },
      { id: 'us-2', name: 'Sergiño Dest', number: 2, position: 'DEF', club: 'PSV', age: 25, caps: 40, goals: 3, marketValue: '€20M' },
      { id: 'us-8', name: 'Weston McKennie', number: 8, position: 'MID', club: 'Juventus', age: 27, caps: 60, goals: 12, marketValue: '€30M' },
      { id: 'us-10', name: 'Christian Pulisic', number: 10, position: 'FWD', club: 'AC Milan', age: 27, caps: 75, goals: 35, marketValue: '€45M' },
      { id: 'us-9', name: 'Folarin Balogun', number: 9, position: 'FWD', club: 'Monaco', age: 24, caps: 25, goals: 10, marketValue: '€35M' },
    ]
  },
  {
    code: 'ARG',
    name: 'Argentina',
    flag: '🇦🇷',
    group: 'Group C',
    coach: 'Lionel Scaloni',
    players: [
      { id: 'ar-23', name: 'Emi Martinez', number: 23, position: 'GK', club: 'Aston Villa', age: 33, caps: 55, goals: 0, marketValue: '€28M' },
      { id: 'ar-7', name: 'Rodrigo De Paul', number: 7, position: 'MID', club: 'Atletico Madrid', age: 32, caps: 80, goals: 4, marketValue: '€30M' },
      { id: 'ar-10', name: 'Lionel Messi', number: 10, position: 'FWD', club: 'Inter Miami', age: 38, caps: 200, goals: 115, marketValue: '€15M' },
      { id: 'ar-9', name: 'Julian Alvarez', number: 9, position: 'FWD', club: 'Man City', age: 26, caps: 45, goals: 15, marketValue: '€90M' },
    ]
  },
  {
    code: 'FRA',
    name: 'France',
    flag: '🇫🇷',
    group: 'Group D',
    coach: 'Didier Deschamps',
    players: [
      { id: 'fr-16', name: 'Mike Maignan', number: 16, position: 'GK', club: 'AC Milan', age: 30, caps: 35, goals: 0, marketValue: '€40M' },
      { id: 'fr-8', name: 'Aurelien Tchouameni', number: 8, position: 'MID', club: 'Real Madrid', age: 26, caps: 50, goals: 5, marketValue: '€90M' },
      { id: 'fr-10', name: 'Kylian Mbappe', number: 10, position: 'FWD', club: 'Real Madrid', age: 27, caps: 95, goals: 60, marketValue: '€180M' },
      { id: 'fr-7', name: 'Antoine Griezmann', number: 7, position: 'MID', club: 'Atletico Madrid', age: 35, caps: 140, goals: 45, marketValue: '€15M' },
    ]
  },
  {
    code: 'BRA',
    name: 'Brazil',
    flag: '🇧🇷',
    group: 'Group E',
    coach: 'Dorival Junior',
    players: [
      { id: 'br-1', name: 'Alisson', number: 1, position: 'GK', club: 'Liverpool', age: 33, caps: 75, goals: 0, marketValue: '€25M' },
      { id: 'br-7', name: 'Vinicius Jr', number: 7, position: 'FWD', club: 'Real Madrid', age: 25, caps: 40, goals: 12, marketValue: '€150M' },
      { id: 'br-9', name: 'Endrick', number: 9, position: 'FWD', club: 'Real Madrid', age: 19, caps: 15, goals: 5, marketValue: '€60M' },
      { id: 'br-10', name: 'Neymar Jr', number: 10, position: 'FWD', club: 'Al Hilal', age: 34, caps: 135, goals: 80, marketValue: '€30M' },
    ]
  },
  {
    code: 'ENG',
    name: 'England',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    group: 'Group B',
    coach: 'Gareth Southgate',
    players: [
      { id: 'en-1', name: 'Jordan Pickford', number: 1, position: 'GK', club: 'Everton', age: 32, caps: 80, goals: 0, marketValue: '€20M' },
      { id: 'en-10', name: 'Jude Bellingham', number: 10, position: 'MID', club: 'Real Madrid', age: 22, caps: 45, goals: 12, marketValue: '€180M' },
      { id: 'en-9', name: 'Harry Kane', number: 9, position: 'FWD', club: 'Bayern Munich', age: 32, caps: 105, goals: 70, marketValue: '€90M' },
      { id: 'en-7', name: 'Bukayo Saka', number: 7, position: 'FWD', club: 'Arsenal', age: 24, caps: 50, goals: 15, marketValue: '€130M' },
    ]
  },
  {
    code: 'CAN',
    name: 'Canada',
    flag: '🇨🇦',
    group: 'Group F',
    coach: 'Jesse Marsch',
    players: [
      { id: 'ca-19', name: 'Alphonso Davies', number: 19, position: 'DEF', club: 'Bayern Munich', age: 25, caps: 60, goals: 18, marketValue: '€60M' },
      { id: 'ca-20', name: 'Jonathan David', number: 20, position: 'FWD', club: 'Lille', age: 26, caps: 65, goals: 35, marketValue: '€50M' },
    ]
  },
  {
    code: 'MEX',
    name: 'Mexico',
    flag: '🇲🇽',
    group: 'Group A',
    coach: 'Jaime Lozano',
    players: [
      { id: 'mx-13', name: 'Guillermo Ochoa', number: 13, position: 'GK', club: 'Salernitana', age: 40, caps: 160, goals: 0, marketValue: '€1M' },
      { id: 'mx-4', name: 'Edson Alvarez', number: 4, position: 'MID', club: 'West Ham', age: 28, caps: 85, goals: 6, marketValue: '€35M' },
      { id: 'mx-22', name: 'Hirving Lozano', number: 22, position: 'FWD', club: 'PSV', age: 30, caps: 75, goals: 20, marketValue: '€15M' },
    ]
  },
  {
    code: 'GER',
    name: 'Germany',
    flag: '🇩🇪',
    group: 'Group F',
    coach: 'Julian Nagelsmann',
    players: [
      { id: 'de-1', name: 'Manuel Neuer', number: 1, position: 'GK', club: 'Bayern Munich', age: 40, caps: 130, goals: 0, marketValue: '€2M' },
      { id: 'de-10', name: 'Jamal Musiala', number: 10, position: 'MID', club: 'Bayern Munich', age: 23, caps: 45, goals: 10, marketValue: '€120M' },
      { id: 'de-17', name: 'Florian Wirtz', number: 17, position: 'MID', club: 'Bayer Leverkusen', age: 23, caps: 35, goals: 8, marketValue: '€110M' },
    ]
  }
];
