import type { Player, PlayerId } from '@/types';

// Realistic-ish KC Current 2024 roster. Prices spread $4-12m so a $50m budget
// forces real tradeoffs: picking all stars overspends; balanced picks fit.
//
// Stat numbers are illustrative — production data will replace this when the
// backend lands. See MIGRATION.md for the API contract this shape implies.
export const PLAYERS: Player[] = [
  // Defenders
  {
    id: 'edmonds',
    name: 'Kristen Edmonds',
    position: 'D',
    price: 9,
    seasonPoints: 178,
    lastMatchDayPoints: 15,
    recentForm: [
      { matchDay: 11, opponentCode: 'POR', isHome: true,  points: 15 },
      { matchDay: 10, opponentCode: 'WAS', isHome: false, points: 8  },
      { matchDay: 9,  opponentCode: 'CHI', isHome: true,  points: 12 },
      { matchDay: 8,  opponentCode: 'SD',  isHome: false, points: 6  },
    ],
  },
  {
    id: 'delfava',
    name: 'Kate Del Fava',
    position: 'D',
    price: 8,
    seasonPoints: 142,
    lastMatchDayPoints: 9,
    recentForm: [
      { matchDay: 11, opponentCode: 'POR', isHome: true,  points: 9  },
      { matchDay: 10, opponentCode: 'WAS', isHome: false, points: 11 },
      { matchDay: 9,  opponentCode: 'CHI', isHome: true,  points: 7  },
      { matchDay: 8,  opponentCode: 'SD',  isHome: false, points: 5  },
    ],
  },
  {
    id: 'mace',
    name: 'Hailie Mace',
    position: 'D',
    price: 7,
    seasonPoints: 124,
    lastMatchDayPoints: 7,
    recentForm: [
      { matchDay: 11, opponentCode: 'POR', isHome: true,  points: 7  },
      { matchDay: 10, opponentCode: 'WAS', isHome: false, points: 10 },
      { matchDay: 9,  opponentCode: 'CHI', isHome: true,  points: 6  },
      { matchDay: 8,  opponentCode: 'SD',  isHome: false, points: 8  },
    ],
  },
  {
    id: 'sharples',
    name: 'Kayla Sharples',
    position: 'D',
    price: 6,
    seasonPoints: 108,
    lastMatchDayPoints: 5,
    recentForm: [
      { matchDay: 11, opponentCode: 'POR', isHome: true,  points: 5  },
      { matchDay: 10, opponentCode: 'WAS', isHome: false, points: 6  },
      { matchDay: 9,  opponentCode: 'CHI', isHome: true,  points: 4  },
      { matchDay: 8,  opponentCode: 'SD',  isHome: false, points: 7  },
    ],
  },
  {
    id: 'rodriguez',
    name: 'Izzy Rodriguez',
    position: 'D',
    price: 5,
    seasonPoints: 88,
    lastMatchDayPoints: 4,
    recentForm: [
      { matchDay: 11, opponentCode: 'POR', isHome: true,  points: 4 },
      { matchDay: 10, opponentCode: 'WAS', isHome: false, points: 5 },
      { matchDay: 9,  opponentCode: 'CHI', isHome: true,  points: 3 },
      { matchDay: 8,  opponentCode: 'SD',  isHome: false, points: 6 },
    ],
  },

  // Midfielders
  {
    id: 'labonta',
    name: 'Lo\u2019eau LaBonta',
    position: 'M',
    price: 8,
    seasonPoints: 156,
    lastMatchDayPoints: 10,
    recentForm: [
      { matchDay: 11, opponentCode: 'POR', isHome: true,  points: 10 },
      { matchDay: 10, opponentCode: 'WAS', isHome: false, points: 8  },
      { matchDay: 9,  opponentCode: 'CHI', isHome: true,  points: 12 },
      { matchDay: 8,  opponentCode: 'SD',  isHome: false, points: 7  },
    ],
  },
  {
    id: 'dibernardo',
    name: 'Vanessa DiBernardo',
    position: 'M',
    price: 7,
    seasonPoints: 134,
    lastMatchDayPoints: 8,
    recentForm: [
      { matchDay: 11, opponentCode: 'POR', isHome: true,  points: 8  },
      { matchDay: 10, opponentCode: 'WAS', isHome: false, points: 9  },
      { matchDay: 9,  opponentCode: 'CHI', isHome: true,  points: 6  },
      { matchDay: 8,  opponentCode: 'SD',  isHome: false, points: 10 },
    ],
  },
  {
    id: 'winebrenner',
    name: 'Jenna Winebrenner',
    position: 'M',
    price: 7,
    seasonPoints: 142,
    lastMatchDayPoints: 9,
    recentForm: [
      { matchDay: 11, opponentCode: 'POR', isHome: true,  points: 9 },
      { matchDay: 10, opponentCode: 'WAS', isHome: false, points: 7 },
      { matchDay: 9,  opponentCode: 'CHI', isHome: true,  points: 8 },
      { matchDay: 8,  opponentCode: 'SD',  isHome: false, points: 6 },
    ],
  },
  {
    id: 'hutton',
    name: 'Claire Hutton',
    position: 'M',
    price: 6,
    seasonPoints: 102,
    lastMatchDayPoints: 6,
    recentForm: [
      { matchDay: 11, opponentCode: 'POR', isHome: true,  points: 6 },
      { matchDay: 10, opponentCode: 'WAS', isHome: false, points: 7 },
      { matchDay: 9,  opponentCode: 'CHI', isHome: true,  points: 5 },
      { matchDay: 8,  opponentCode: 'SD',  isHome: false, points: 8 },
    ],
  },
  {
    id: 'mccain',
    name: 'Addie McCain',
    position: 'M',
    price: 5,
    seasonPoints: 88,
    lastMatchDayPoints: 5,
    recentForm: [
      { matchDay: 11, opponentCode: 'POR', isHome: true,  points: 5 },
      { matchDay: 10, opponentCode: 'WAS', isHome: false, points: 4 },
      { matchDay: 9,  opponentCode: 'CHI', isHome: true,  points: 6 },
      { matchDay: 8,  opponentCode: 'SD',  isHome: false, points: 7 },
    ],
  },
  {
    id: 'long',
    name: 'Mary Long',
    position: 'M',
    price: 4,
    seasonPoints: 64,
    lastMatchDayPoints: 3,
    recentForm: [
      { matchDay: 11, opponentCode: 'POR', isHome: true,  points: 3 },
      { matchDay: 10, opponentCode: 'WAS', isHome: false, points: 5 },
      { matchDay: 9,  opponentCode: 'CHI', isHome: true,  points: 2 },
      { matchDay: 8,  opponentCode: 'SD',  isHome: false, points: 4 },
    ],
  },

  // Forwards
  {
    id: 'chawinga',
    name: 'Temwa Chawinga',
    position: 'F',
    price: 12,
    seasonPoints: 210,
    lastMatchDayPoints: 18,
    recentForm: [
      { matchDay: 11, opponentCode: 'POR', isHome: true,  points: 18 },
      { matchDay: 10, opponentCode: 'WAS', isHome: false, points: 14 },
      { matchDay: 9,  opponentCode: 'CHI', isHome: true,  points: 22 },
      { matchDay: 8,  opponentCode: 'SD',  isHome: false, points: 11 },
    ],
  },
  {
    id: 'zaneratto',
    name: 'Bia Zaneratto',
    position: 'F',
    price: 10,
    seasonPoints: 164,
    lastMatchDayPoints: 12,
    recentForm: [
      { matchDay: 11, opponentCode: 'POR', isHome: true,  points: 12 },
      { matchDay: 10, opponentCode: 'WAS', isHome: false, points: 15 },
      { matchDay: 9,  opponentCode: 'CHI', isHome: true,  points: 9  },
      { matchDay: 8,  opponentCode: 'SD',  isHome: false, points: 13 },
    ],
  },
  {
    id: 'cooper',
    name: 'Michelle Cooper',
    position: 'F',
    price: 9,
    seasonPoints: 148,
    lastMatchDayPoints: 11,
    recentForm: [
      { matchDay: 11, opponentCode: 'POR', isHome: true,  points: 11 },
      { matchDay: 10, opponentCode: 'WAS', isHome: false, points: 8  },
      { matchDay: 9,  opponentCode: 'CHI', isHome: true,  points: 14 },
      { matchDay: 8,  opponentCode: 'SD',  isHome: false, points: 10 },
    ],
  },
  {
    id: 'bennett',
    name: 'Elyse Bennett',
    position: 'F',
    price: 6,
    seasonPoints: 96,
    lastMatchDayPoints: 6,
    recentForm: [
      { matchDay: 11, opponentCode: 'POR', isHome: true,  points: 6 },
      { matchDay: 10, opponentCode: 'WAS', isHome: false, points: 8 },
      { matchDay: 9,  opponentCode: 'CHI', isHome: true,  points: 5 },
      { matchDay: 8,  opponentCode: 'SD',  isHome: false, points: 7 },
    ],
  },
  {
    id: 'johnson',
    name: 'Jaycie Johnson',
    position: 'F',
    price: 6,
    seasonPoints: 108,
    lastMatchDayPoints: 5,
    recentForm: [
      { matchDay: 11, opponentCode: 'POR', isHome: true,  points: 5 },
      { matchDay: 10, opponentCode: 'WAS', isHome: false, points: 9 },
      { matchDay: 9,  opponentCode: 'CHI', isHome: true,  points: 4 },
      { matchDay: 8,  opponentCode: 'SD',  isHome: false, points: 8 },
    ],
  },
];

// Lookup table built once at module load. Indexed access in components.
export const PLAYERS_BY_ID: Record<PlayerId, Player> = Object.fromEntries(
  PLAYERS.map((p) => [p.id, p]),
);
