import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import type { Action, TeamSelectionState } from '@/types';
import { initialState, reducer } from './reducer';

interface ContextValue {
  state: TeamSelectionState;
  dispatch: Dispatch<Action>;
}

const TeamSelectionContext = createContext<ContextValue | null>(null);

export function TeamSelectionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <TeamSelectionContext.Provider value={{ state, dispatch }}>
      {children}
    </TeamSelectionContext.Provider>
  );
}

export function useTeamSelection(): ContextValue {
  const ctx = useContext(TeamSelectionContext);
  if (!ctx) {
    throw new Error('useTeamSelection must be used inside <TeamSelectionProvider>');
  }
  return ctx;
}
