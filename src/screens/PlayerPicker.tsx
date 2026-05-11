import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ScreenHeader from '@/components/ScreenHeader';
import { PLAYERS, PLAYERS_BY_ID } from '@/data/players';
import { useTeamSelection } from '@/state/TeamSelectionContext';
import { budgetRemaining, isOverBudget, isSelected } from '@/state/selectors';
import type { Player, Position, Section } from '@/types';
import { playerPhotoUrl } from '@/utils/playerPhoto';

/**
 * PlayerPicker — screen 4.
 *
 * Modal-card list of players for filling the active slot. Layout from the
 * Figma frames `77:786` (expanded) and the "Players List" mockup.
 *
 *   - Card: top 166px (Figma 258 minus the universal 92px shift-up for iPhone
 *     WebView fit) with `bottom-[20px]` instead of a fixed height. The card
 *     stretches to fill the remaining viewport so the scrollable player list
 *     inside always has somewhere to live — the Figma's fixed 554px height
 *     overflowed the bottom of iPhone WebViews. Width stays 340px.
 *   - "Select player" title (cyan DIN Bold 26px) and close ✕ button (top 8 right).
 *   - "Budget remaining: $Xm" (dynamic).
 *   - Filter pills: All / Defenders / Midfielders / Forwards. Defaults to the
 *     slot's position so a Defender slot opens to a pre-filtered defender list.
 *   - Scrollable list — each row has photo, name, season+last stats, price,
 *     and a `+` action button. Rows render with a cyan-bordered rounded box.
 *     The `<ul>` is already `top-[140px] bottom-[10px]` inside the card, so
 *     it shrinks/grows in lockstep with the card height.
 *
 * Interactions:
 *   - Tap `+` → dispatch SELECT_PLAYER and navigate back to /select-team.
 *   - Tap the row body → navigate to /player/:id (profile, with activeSlot
 *     still set so the profile's Select button will fill the same slot).
 *   - Tap ✕ → clear activeSlot and navigate back to /select-team.
 *
 * The `+` is disabled when the player would put us over budget, when the
 * player is already on the team, or when their position doesn't match the
 * active slot's position (latter only matters if the user manually switches
 * to a non-matching filter — the data model assumes slot.position ===
 * player.position).
 */

type Filter = 'all' | Position;

const POSITION_TO_FILTER: Record<Position, Filter> = {
  D: 'D',
  M: 'M',
  F: 'F',
};

const FILTER_PILLS: ReadonlyArray<{ id: Filter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'D', label: 'Defenders' },
  { id: 'M', label: 'Midfielders' },
  { id: 'F', label: 'Forwards' },
];

export default function PlayerPicker() {
  const navigate = useNavigate();
  const { state, dispatch } = useTeamSelection();
  const { section, position } = useParams<{ section: Section; position: Position }>();

  // Default the filter to the slot's position so the user lands on a useful
  // pre-filtered list. They can opt into "All" or another position from here.
  const [filter, setFilter] = useState<Filter>(
    position ? POSITION_TO_FILTER[position] : 'all',
  );

  const remaining = budgetRemaining(state, PLAYERS_BY_ID);

  const visiblePlayers = useMemo(() => {
    if (filter === 'all') return PLAYERS;
    return PLAYERS.filter((p) => p.position === filter);
  }, [filter]);

  function handleSelect(player: Player) {
    if (!section || !position) return;
    // The slot was set when the user tapped the empty slot on /select-team,
    // so the reducer already knows where to put this player.
    dispatch({ type: 'SELECT_PLAYER', playerId: player.id });
    navigate('/select-team');
  }

  function handleRowClick(player: Player) {
    navigate(`/player/${player.id}`);
  }

  function handleClose() {
    dispatch({ type: 'SET_ACTIVE_SLOT', slot: null });
    navigate('/select-team');
  }

  return (
    <main className="relative w-full min-h-screen overflow-hidden animate-fade-in">
      <ScreenHeader />

      <section className="absolute left-1/2 -translate-x-1/2 top-[166px] bottom-[20px] w-[340px] bg-surface rounded-card shadow-accent-glow overflow-hidden">
        {/* Title */}
        <h2 className="absolute left-[15px] top-[25px] -translate-y-1/2 font-body font-bold text-[26px] leading-none text-brand-accent">
          Select player
        </h2>

        {/* Close X */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close picker"
          className="absolute right-[7px] top-[8px] size-[32px] flex items-center justify-center text-brand-accent active:opacity-70"
        >
          <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden="true">
            <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Budget remaining */}
        <p className="absolute left-[15px] top-[61.5px] -translate-y-1/2 font-body text-[14px] leading-none text-on-surface">
          Budget remaining: ${remaining}m
        </p>

        {/* Filter pills — padding and gaps tuned to the Figma's tight 310px row
            so all four labels fit without horizontal overflow. */}
        <div className="absolute left-[15px] top-[89px] right-[15px] flex items-center gap-[5px]">
          {FILTER_PILLS.map((pill) => {
            const active = filter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setFilter(pill.id)}
                className={`h-[39px] px-[10px] py-[10px] rounded-button border border-brand-accent font-body font-bold text-[14px] leading-none whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-brand-accent text-on-accent'
                    : 'bg-transparent text-on-surface'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Player list — scrollable when content exceeds visible space. Keyed
            on filter so React remounts on filter change, re-running the
            fade-in animation and giving a soft refresh when the list content
            swaps. Side effect: scroll position resets on filter change, which
            is fine here (the list is short and the user is re-engaging). */}
        <ul
          key={filter}
          className="absolute left-0 right-0 top-[140px] bottom-[10px] overflow-y-auto px-[15px] py-[12px] space-y-[9px] animate-fade-in"
        >
          {visiblePlayers.map((player) => {
            const selected = isSelected(state, player.id);
            const overBudget = isOverBudget(state, PLAYERS_BY_ID, player.id);
            const positionMatches = !position || player.position === position;
            const addDisabled = selected || overBudget || !positionMatches;
            return (
              <li key={player.id}>
                <div className="relative h-[51px] w-full border border-brand-accent rounded-[7px] flex items-center">
                  {/* Row tap target (everything except the + button) */}
                  <button
                    type="button"
                    onClick={() => handleRowClick(player)}
                    className="absolute inset-0 right-[44px] flex items-center pl-[47px] pr-[10px] text-left active:bg-white/5"
                    aria-label={`View ${player.name} profile`}
                  >
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-body font-bold text-[15px] leading-tight text-on-surface capitalize tracking-playername truncate">
                        {player.name}
                      </span>
                      <span className="font-body text-[10px] leading-tight text-on-surface/80 mt-[2px] whitespace-nowrap">
                        Season: {player.seasonPoints} pts · Last: {player.lastMatchDayPoints} pts
                      </span>
                    </div>
                    <span className="font-body font-bold text-[15px] leading-none text-brand-accent ml-[8px] whitespace-nowrap">
                      ${player.price}m
                    </span>
                  </button>

                  {/* Photo — sits over the left edge of the bordered row */}
                  <div className="absolute left-[5px] top-1/2 -translate-y-1/2 size-[40px] rounded-full overflow-hidden pointer-events-none">
                    <img
                      src={playerPhotoUrl(player.id)}
                      alt=""
                      className="absolute inset-0 size-full object-cover object-top"
                    />
                  </div>

                  {/* + action button */}
                  <button
                    type="button"
                    onClick={() => handleSelect(player)}
                    disabled={addDisabled}
                    aria-label={
                      selected
                        ? `${player.name} already selected`
                        : overBudget
                          ? `${player.name} over budget`
                          : !positionMatches
                            ? `${player.name} position does not match slot`
                            : `Select ${player.name}`
                    }
                    className={`absolute right-[10px] top-1/2 -translate-y-1/2 size-[29px] flex items-center justify-center rounded-full text-brand-accent transition-opacity ${
                      addDisabled ? 'opacity-30 cursor-not-allowed' : 'active:opacity-70'
                    }`}
                  >
                    <svg viewBox="0 0 29 29" className="size-full" aria-hidden="true">
                      <circle
                        cx="14.5"
                        cy="14.5"
                        r="13.25"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <line x1="14.5" y1="8.5" x2="14.5" y2="20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="8.5" y1="14.5" x2="20.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
