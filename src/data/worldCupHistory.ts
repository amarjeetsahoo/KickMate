export interface Tournament {
  year: number;
  host: string;
  winner: string;
  runnerUp: string;
  goldenBoot: string;
  bestPlayer: string;
  summary: string;
  icon: string;
}

export const TOURNAMENTS: Tournament[] = [
  {
    year: 2022,
    host: 'Qatar',
    winner: 'Argentina',
    runnerUp: 'France',
    goldenBoot: 'Kylian Mbappe (8)',
    bestPlayer: 'Lionel Messi',
    summary: 'A spectacular winter tournament culminating in arguably the greatest final ever, with Messi finally lifting the trophy after a penalty shootout against France.',
    icon: '🏆'
  },
  {
    year: 2018,
    host: 'Russia',
    winner: 'France',
    runnerUp: 'Croatia',
    goldenBoot: 'Harry Kane (6)',
    bestPlayer: 'Luka Modric',
    summary: 'France secured their second star with a dynamic squad led by Mbappe and Griezmann, defeating a resilient Croatian team in the final.',
    icon: '🇫🇷'
  },
  {
    year: 2014,
    host: 'Brazil',
    winner: 'Germany',
    runnerUp: 'Argentina',
    goldenBoot: 'James Rodriguez (6)',
    bestPlayer: 'Lionel Messi',
    summary: 'Germany triumphed in Maracana thanks to Gotze\'s extra-time winner. The tournament is infamous for the 7-1 semi-final where Germany stunned hosts Brazil.',
    icon: '🇩🇪'
  },
  {
    year: 2010,
    host: 'South Africa',
    winner: 'Spain',
    runnerUp: 'Netherlands',
    goldenBoot: 'Thomas Muller (5)',
    bestPlayer: 'Diego Forlan',
    summary: 'The first World Cup in Africa was won by Spain\'s tiki-taka masters. Iniesta scored the dramatic late winner against the Netherlands.',
    icon: '🇪🇸'
  },
  {
    year: 2006,
    host: 'Germany',
    winner: 'Italy',
    runnerUp: 'France',
    goldenBoot: 'Miroslav Klose (5)',
    bestPlayer: 'Zinedine Zidane',
    summary: 'Italy won their fourth title in a penalty shootout. The final is remembered for Zidane\'s shocking headbutt on Materazzi in his final match.',
    icon: '🇮🇹'
  },
  {
    year: 2002,
    host: 'South Korea / Japan',
    winner: 'Brazil',
    runnerUp: 'Germany',
    goldenBoot: 'Ronaldo (8)',
    bestPlayer: 'Oliver Kahn',
    summary: 'The first co-hosted tournament saw a resurgent Ronaldo score twice in the final to give Brazil their record fifth title.',
    icon: '🇧🇷'
  },
  {
    year: 1998,
    host: 'France',
    winner: 'France',
    runnerUp: 'Brazil',
    goldenBoot: 'Davor Suker (6)',
    bestPlayer: 'Ronaldo',
    summary: 'Hosts France won their maiden title led by Zidane, who scored two headers in the final against defending champions Brazil.',
    icon: '🇫🇷'
  },
  {
    year: 1994,
    host: 'USA',
    winner: 'Brazil',
    runnerUp: 'Italy',
    goldenBoot: 'Hristo Stoichkov (6)',
    bestPlayer: 'Romario',
    summary: 'Brazil secured their fourth title in the first final decided on penalties, famous for Roberto Baggio\'s crucial miss.',
    icon: '🇧🇷'
  }
];
