// Squad structure — 3 starters + 3 bench, one of each position per section.
// SlotKey is a templated string union so it round-trips cleanly with route
// params (/picker/:section/:position) without needing an adapter.
export type Section = 'starters' | 'bench';
export type Position = 'D' | 'M' | 'F';
export type SlotKey = `${Section}.${Position}`;

export type PlayerId = string;

export interface MatchDayResult {
  matchDay: number;
  opponentCode: string; // 3-letter NWSL team code, e.g. 'POR', 'CHI'
  isHome: boolean;
  points: number;
}

export interface Player {
  id: PlayerId;
  name: string;
  position: Position;
  price: number; // in $m
  seasonPoints: number;
  lastMatchDayPoints: number;
  recentForm: MatchDayResult[];
}

// activeSlot is modeled in state (not just route params) so the reducer knows
// which slot to fill when SELECT_PLAYER fires from the player profile screen.
// On entry to /picker, route params hydrate activeSlot via SET_ACTIVE_SLOT.
// On close or successful select, activeSlot returns to null.
export interface TeamSelectionState {
  teamName: string;
  selections: {
    starters: Partial<Record<Position, PlayerId>>;
    bench: Partial<Record<Position, PlayerId>>;
  };
  activeSlot: SlotKey | null;
}

export type Action =
  | { type: 'SET_TEAM_NAME'; name: string }
  | { type: 'SET_ACTIVE_SLOT'; slot: SlotKey | null }
  | { type: 'SELECT_PLAYER'; playerId: PlayerId }
  | { type: 'CLEAR_SLOT'; slot: SlotKey };

export const BUDGET_CAP = 50; // $50m
