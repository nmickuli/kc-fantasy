import type { Action, Position, Section, TeamSelectionState } from '@/types';

export const initialState: TeamSelectionState = {
  teamName: '',
  selections: { starters: {}, bench: {} },
  activeSlot: null,
};

export function reducer(state: TeamSelectionState, action: Action): TeamSelectionState {
  switch (action.type) {
    case 'SET_TEAM_NAME':
      return { ...state, teamName: action.name };

    case 'SET_ACTIVE_SLOT':
      return { ...state, activeSlot: action.slot };

    case 'SELECT_PLAYER': {
      // Guard: only fill if there's an active slot. Defensive — the UI gates
      // this action, but if it fires unexpectedly we no-op rather than blow up.
      if (!state.activeSlot) return state;
      const [section, position] = state.activeSlot.split('.') as [Section, Position];
      return {
        ...state,
        selections: {
          ...state.selections,
          [section]: { ...state.selections[section], [position]: action.playerId },
        },
        activeSlot: null, // clear after fill — prevents stale-slot bugs
      };
    }

    case 'CLEAR_SLOT': {
      const [section, position] = action.slot.split('.') as [Section, Position];
      const next = { ...state.selections[section] };
      delete next[position];
      return {
        ...state,
        selections: { ...state.selections, [section]: next },
      };
    }

    default:
      return state;
  }
}
