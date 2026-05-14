import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DeadlinePill from '@/components/DeadlinePill';
import MatchDayPointsCard from '@/components/MatchDayPointsCard';
import MatchSummary from '@/components/MatchSummary';
import TeamSlot from '@/components/TeamSlot';
import { PLAYERS_BY_ID } from '@/data/players';
import {
  adjacentFixtures,
  deadlineFor,
  pickFixture,
  variantOf,
} from '@/data/matches';
import type { Fixture } from '@/data/matches';
import { useTeamSelection } from '@/state/TeamSelectionContext';
import type { Player, Position, Section, SlotKey } from '@/types';

/**
 * TeamView — screen 9. Read-only drill-down of the user's team for a
 * specific match. Reached from Home's Edit Team / View Team button.
 *
 * Three variants, picked by URL params (`?md=N` or `?match=…`) and the
 * fixture's status (see `pickFixture` in `data/matches.ts`):
 *
 *   - **upcoming**: cyan deadline pill counts down to lineup lock; Edit
 *     Team CTA enabled (navigates to `/select-team`); slots show
 *     player photo + name only.
 *   - **active**: Match Day Points card with running total; Edit Team
 *     disabled (lineup locked); slots additionally show each player's
 *     current points.
 *   - **previous**: Match Day Points card with final total; Edit Team
 *     disabled; slots show final points.
 *
 * Layout derived from Figma `1:1686` (upcoming variant) with the same
 * 100px shift-up applied across the app:
 *
 *   - Header (back arrow + team name): top 60
 *   - Match summary card: top 100, 340×60
 *   - Deadline pill (upcoming) or MatchDayPointsCard (active/previous):
 *     top 173–175 — slight gap variation so the active variant's taller
 *     card lines up with the team card below.
 *   - Team card: top 254 (upcoming) / 263 (active+previous), 340×380
 *
 * Captain logic for v1: whoever sits in `starters.M` is the captain.
 * Captain selection is out of scope per CLAUDE.md, so we hardcode the M
 * starter slot — fits the common 4-3-3 / 4-4-2 fantasy convention of
 * picking a midfielder.
 *
 * Navigation:
 *   - Back button → previous page in history (typically `/home`).
 *   - Match summary chevrons → adjacent fixture (preserves the matchDay
 *     URL param so subsequent renders stay in sync).
 *   - Edit Team (upcoming variant only) → `/select-team`.
 *   - Slot tap → `/player/:id` (existing read-only profile, with the
 *     Remove action available for already-selected players).
 */

const CAPTAIN_SLOT: SlotKey = 'starters.M';

export default function TeamView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state } = useTeamSelection();

  const fixture = pickFixture(searchParams);
  const variant = variantOf(fixture);
  const { previous, next } = adjacentFixtures(fixture);

  // Best-effort team name. Fall back to "MY TEAM" for empty state so the
  // header doesn't render as a hollow box.
  const teamName = state.teamName.trim() || 'My Team';

  function navTo(target: Fixture) {
    navigate(`/team-view?md=${target.matchDay}`);
  }

  // Match-day points are real for active/previous, hidden for upcoming.
  // For the demo, distribute the fixture's total across the 6 slots
  // deterministically so the numbers look plausible and stable per match.
  const slotPoints = useSlotPoints(fixture, state);

  return (
    <main className="relative w-full min-h-screen overflow-hidden animate-fade-in pb-[20px]">
      {/* Header: back arrow + team name, same pattern as Rules / Help. */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Back"
        className="absolute left-[21px] top-[60px] w-[32px] h-[32px] flex items-center justify-center text-on-accent active:opacity-70"
      >
        <svg viewBox="0 0 24 24" className="w-[20px] h-[20px]" aria-hidden="true">
          <path
            d="M15 6 L9 12 L15 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <h1 className="absolute left-1/2 -translate-x-1/2 top-[76px] -translate-y-1/2 font-body font-bold text-[20px] leading-none uppercase text-on-accent text-center whitespace-nowrap">
        {teamName}
      </h1>

      {/* Match summary card with chevrons for sibling fixtures. */}
      <MatchSummary
        fixture={fixture}
        variant={variant}
        top={100}
        onPrev={previous ? () => navTo(previous) : null}
        onNext={next ? () => navTo(next) : null}
      />

      {/* Below the match card: deadline pill (upcoming) or Match Day
          Points card (active/previous). */}
      {variant === 'upcoming' ? (
        <UpcomingDeadline kickoffAt={fixture.kickoffAt} />
      ) : (
        <MatchDayPointsCard top={170} points={fixture.points ?? 0} />
      )}

      {/* Team card with pitch + slots + Edit Team CTA. */}
      <TeamCard
        variant={variant}
        playerInSlot={(section, position) => playerInSlot(state, section, position)}
        slotPoints={slotPoints}
        onSlotClick={(player) => navigate(`/player/${player.id}`)}
        onEditTeam={() => navigate('/select-team')}
      />
    </main>
  );
}

/* --- Subcomponents --------------------------------------------------------- */

function UpcomingDeadline({ kickoffAt }: { kickoffAt: Date }) {
  const text = useCountdown(deadlineFor(kickoffAt));
  return <DeadlinePill top={173} variant="counting" text={`Deadline ${text}`} />;
}

interface TeamCardProps {
  variant: 'upcoming' | 'active' | 'previous';
  playerInSlot: (section: Section, position: Position) => Player | null;
  slotPoints: Record<SlotKey, number | null>;
  onSlotClick: (player: Player) => void;
  onEditTeam: () => void;
}

function TeamCard({ variant, playerInSlot, slotPoints, onSlotClick, onEditTeam }: TeamCardProps) {
  const top = variant === 'upcoming' ? 254 : 263;
  const editEnabled = variant === 'upcoming';

  // Render a slot at a fixed position. Hides the slot if the user
  // somehow doesn't have anyone in that slot (shouldn't happen post-
  // confirm, but better than crashing on a stray /team-view visit).
  function renderSlot(section: Section, position: Position, leftPx: number, topPx: number) {
    const player = playerInSlot(section, position);
    if (!player) return null;
    const slotKey: SlotKey = `${section}.${position}`;
    return (
      <div className="absolute" style={{ left: leftPx, top: topPx }}>
        <TeamSlot
          section={section}
          position={position}
          player={player}
          points={slotPoints[slotKey]}
          isCaptain={slotKey === CAPTAIN_SLOT}
          onClick={() => onSlotClick(player)}
        />
      </div>
    );
  }

  return (
    <section
      className="absolute left-1/2 -translate-x-1/2 w-[340px] h-[380px] bg-surface rounded-card shadow-accent-glow"
      style={{ top }}
    >
      {/* Starters label */}
      <p className="absolute left-[22px] top-[27px] -translate-y-1/2 font-body font-bold text-[15px] leading-none text-on-surface">
        Starters
      </p>

      {/* Pitch image */}
      <div className="absolute left-[13px] top-[45px] w-[315px] h-[150px] rounded-[10px] overflow-hidden bg-grass">
        <img src="/assets/pitch.png" alt="" className="absolute inset-0 size-full object-cover" />
      </div>

      {/* Starter slots overlaid on the pitch */}
      {renderSlot('starters', 'D', 36, 80)}
      {renderSlot('starters', 'M', 131, 80)}
      {renderSlot('starters', 'F', 226, 80)}

      {/* Bench label */}
      <p className="absolute left-[22px] top-[212px] -translate-y-1/2 font-body font-bold text-[15px] leading-none text-on-surface">
        Bench
      </p>

      {/* Bench slots */}
      {renderSlot('bench', 'D', 36, 227)}
      {renderSlot('bench', 'M', 131, 227)}
      {renderSlot('bench', 'F', 226, 227)}

      {/* Edit Team button — enabled for upcoming, disabled (lineup
          locked) for active and previous. */}
      <button
        type="button"
        onClick={editEnabled ? onEditTeam : undefined}
        disabled={!editEnabled}
        className={`absolute left-1/2 -translate-x-1/2 top-[322px] w-[290px] h-[39px] flex items-center justify-center px-[21px] py-[10px] bg-brand-accent text-on-accent rounded-button font-body font-bold text-[14px] leading-none whitespace-nowrap transition-opacity ${
          editEnabled ? 'active:opacity-90' : 'opacity-50 cursor-not-allowed'
        }`}
      >
        Edit Team
      </button>
    </section>
  );
}

/* --- Helpers --------------------------------------------------------------- */

function playerInSlot(
  state: ReturnType<typeof useTeamSelection>['state'],
  section: Section,
  position: Position,
): Player | null {
  const id = state.selections[section][position];
  return id ? PLAYERS_BY_ID[id] ?? null : null;
}

/**
 * Distribute a fixture's match-day points across the 6 slots in a way
 * that's stable across renders for the same fixture/team combination.
 * For upcoming matches, returns null for every slot so the slot UI hides
 * the points line.
 *
 * The actual product would track per-player points from a backend; this
 * is purely demo dressing so each slot shows a different plausible
 * number that adds up to roughly the fixture total.
 */
function useSlotPoints(
  fixture: Fixture,
  state: ReturnType<typeof useTeamSelection>['state'],
): Record<SlotKey, number | null> {
  // Deterministic spread (no useMemo dep complexity) — the seeded weights
  // approximate "starters score more, bench scores less", with the
  // captain (starters.M) getting a small bump.
  const weights: Record<SlotKey, number> = {
    'starters.D': 0.16,
    'starters.M': 0.24,
    'starters.F': 0.22,
    'bench.D': 0.12,
    'bench.M': 0.13,
    'bench.F': 0.13,
  };

  const empty: Record<SlotKey, number | null> = {
    'starters.D': null,
    'starters.M': null,
    'starters.F': null,
    'bench.D': null,
    'bench.M': null,
    'bench.F': null,
  };

  if (fixture.status === 'upcoming' || fixture.points === null) {
    return empty;
  }

  const total = fixture.points;
  const result = { ...empty };
  for (const key of Object.keys(weights) as SlotKey[]) {
    const [section, position] = key.split('.') as [Section, Position];
    if (state.selections[section][position]) {
      result[key] = Math.round(total * weights[key]);
    }
  }
  return result;
}

/**
 * Live countdown to a target date, formatted as "Xd Yh Zm". Same hook
 * that lives on Home — duplicated here so TeamView doesn't depend on
 * the Home module just to import a 15-line utility. If a third caller
 * shows up, lift it into `src/utils/`.
 */
function useCountdown(target: Date): string {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const ms = target.getTime() - now;
  if (ms <= 0) return '0d 0h 0m';

  const totalMinutes = Math.floor(ms / 60_000);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
