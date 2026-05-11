import { BUDGET_CAP, type Player, type PlayerId, type Position, type Section, type SlotKey, type TeamSelectionState } from '@/types';

export function parseSlot(slot: SlotKey): [Section, Position] {
  return slot.split('.') as [Section, Position];
}

function allSelectedIds(state: TeamSelectionState): PlayerId[] {
  return [
    ...Object.values(state.selections.starters),
    ...Object.values(state.selections.bench),
  ].filter((id): id is PlayerId => Boolean(id));
}

export function totalSpent(state: TeamSelectionState, players: Record<PlayerId, Player>): number {
  return allSelectedIds(state).reduce((sum, id) => sum + (players[id]?.price ?? 0), 0);
}

export function budgetRemaining(state: TeamSelectionState, players: Record<PlayerId, Player>): number {
  return BUDGET_CAP - totalSpent(state, players);
}

export function isSelected(state: TeamSelectionState, playerId: PlayerId): boolean {
  return allSelectedIds(state).includes(playerId);
}

// Find which slot (if any) currently holds this player. Used by the player
// profile to enable the "Remove" action on already-selected players.
export function slotForPlayer(
  state: TeamSelectionState,
  playerId: PlayerId,
): SlotKey | null {
  for (const section of ['starters', 'bench'] as const) {
    for (const position of ['D', 'M', 'F'] as const) {
      if (state.selections[section][position] === playerId) {
        return `${section}.${position}`;
      }
    }
  }
  return null;
}

// Over budget = picking this player would push us past the cap.
// Already-selected players are not over budget (they're already counted).
export function isOverBudget(
  state: TeamSelectionState,
  players: Record<PlayerId, Player>,
  playerId: PlayerId,
): boolean {
  if (isSelected(state, playerId)) return false;
  return (players[playerId]?.price ?? 0) > budgetRemaining(state, players);
}

export function canConfirmTeam(state: TeamSelectionState): boolean {
  const starterCount = Object.values(state.selections.starters).filter(Boolean).length;
  const benchCount = Object.values(state.selections.bench).filter(Boolean).length;
  return starterCount === 3 && benchCount === 3;
}

// Helper for the picker — filter the roster to the active slot's position.
export function playersForSlot(
  slot: SlotKey | null,
  allPlayers: Player[],
): Player[] {
  if (!slot) return allPlayers;
  const [, position] = parseSlot(slot);
  return allPlayers.filter((p) => p.position === position);
}
