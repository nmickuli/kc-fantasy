import { useNavigate, useParams } from 'react-router-dom';
import ScreenHeader from '@/components/ScreenHeader';
import { PLAYERS_BY_ID } from '@/data/players';
import { useTeamSelection } from '@/state/TeamSelectionContext';
import { isOverBudget, isSelected, slotForPlayer } from '@/state/selectors';
import type { MatchDayResult } from '@/types';
import { playerPhotoUrl } from '@/utils/playerPhoto';

/**
 * PlayerProfile — screen 5.
 *
 * Modal-card profile for either:
 *   - picking flow:  /picker/:section/:position → row click → /player/:id.
 *     `activeSlot` is set; Select button fills that slot.
 *   - view-only:     /select-team filled slot tap → /player/:id.
 *     `activeSlot` is null; player is already on team; Select shows as
 *     disabled "Selected ✓" to communicate state.
 *
 * Layout derived from Figma frame `77:535`, shifted up 92px from the Figma
 * anchor to fit iPhone WebViews (see `components/ScreenHeader.tsx`):
 *   - Card: top 117 (Figma 209 minus 92), 340×491, cyan-glow.
 *   - "Player Details" cyan title + close X.
 *   - Hero photo: 130×130 circle, centered ~card-y 48.
 *   - PLAYER NAME (Custom Current Type uppercase) at card-y 179, with price
 *     (DIN Bold 20px cyan) at card-y 212.
 *   - Recent form: 4 cards in a row at card-y 245, each ~75×94 with MD#,
 *     opponent crest (stylized SVG with 3-letter code), opponent + venue,
 *     and points (DIN Bold 15.835px cyan).
 *   - Two stat cards at card-y 361: Match Day (lastMatchDayPoints) and
 *     Season (seasonPoints), both 100×50 with cyan bg + dark text.
 *   - Select button at card-y 427, 100×39.
 *
 * The Figma also shows a "Captain" toggle and "Substitute"/"Transfer" buttons
 * on the already-selected variants. Those are out of scope per CLAUDE.md
 * (transfers, captains, substitutions are deferred to monorepo migration), so
 * we render a single action button that adapts to context:
 *
 *   - already on team:  outlined "Remove" → CLEAR_SLOT, navigate back. Lets
 *                       the user free the slot so they can pick a different
 *                       player. Visually distinct from the filled Select
 *                       button so the action reads as "this changes state"
 *                       rather than "this is the disabled current state".
 *   - picker flow:      filled "Select" → SELECT_PLAYER, navigate back.
 *   - over budget /     filled "Select" disabled at 50% opacity. Tooltips via
 *     no active slot:   aria-label explain why.
 */
export default function PlayerProfile() {
  const navigate = useNavigate();
  const { state, dispatch } = useTeamSelection();
  const { playerId } = useParams<{ playerId: string }>();

  const player = playerId ? PLAYERS_BY_ID[playerId] : undefined;

  if (!player) {
    return (
      <main className="relative w-full min-h-screen overflow-hidden">
        <ScreenHeader />
        <section className="absolute left-1/2 -translate-x-1/2 top-[117px] w-[340px] h-[491px] bg-surface rounded-card shadow-accent-glow flex items-center justify-center px-8">
          <p className="font-body text-on-surface text-center">
            Unknown player.{' '}
            <button
              type="button"
              onClick={() => navigate('/select-team')}
              className="text-brand-accent underline"
            >
              Back to team
            </button>
          </p>
        </section>
      </main>
    );
  }

  const playerSelected = isSelected(state, player.id);
  const currentSlot = slotForPlayer(state, player.id);
  const overBudget = isOverBudget(state, PLAYERS_BY_ID, player.id);
  // Selectable only when we have an active slot (i.e. the user came from the
  // picker), the player isn't already on the team, and they fit the budget.
  const canSelect = !!state.activeSlot && !playerSelected && !overBudget;

  function handleSelect() {
    if (!canSelect || !player) return;
    dispatch({ type: 'SELECT_PLAYER', playerId: player.id });
    navigate('/select-team');
  }

  function handleRemove() {
    if (!currentSlot) return;
    dispatch({ type: 'CLEAR_SLOT', slot: currentSlot });
    navigate('/select-team');
  }

  function handleClose() {
    // Leaving the profile abandons any in-flight pick; clearing keeps state
    // clean even though tapping another empty slot will overwrite it.
    dispatch({ type: 'SET_ACTIVE_SLOT', slot: null });
    navigate('/select-team');
  }

  return (
    <main className="relative w-full min-h-screen overflow-hidden animate-fade-in">
      <ScreenHeader />

      {/* Modal dim overlay — matches Figma `77:577`. Fixed to the viewport so
          it covers the side margins outside the 420px design column on
          desktop too (same trick as Welcome's photo). The card renders on top
          via document order. */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-[rgba(8,31,44,0.65)] pointer-events-none animate-fade-in"
      />

      <section className="absolute left-1/2 -translate-x-1/2 top-[117px] w-[340px] h-[491px] bg-surface rounded-card shadow-accent-glow overflow-hidden">
        {/* Title */}
        <h2 className="absolute left-[15px] top-[27px] -translate-y-1/2 font-body font-bold text-[26px] leading-none text-brand-accent">
          Player Details
        </h2>

        {/* Close X */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close profile"
          className="absolute right-[8px] top-[10px] size-[32px] flex items-center justify-center text-brand-accent active:opacity-70"
        >
          <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden="true">
            <line x1="5" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="19" y1="5" x2="5" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Hero photo — 130×130 circle, centered */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[48px] size-[130px] rounded-full overflow-hidden">
          <img
            src={playerPhotoUrl(player.id)}
            alt=""
            className="absolute inset-0 size-full object-cover object-top"
          />
        </div>

        {/* Player name + price */}
        <p className="absolute left-1/2 -translate-x-1/2 top-[179px] font-display text-[17.5px] leading-none uppercase text-on-surface text-center whitespace-nowrap tracking-playername">
          {player.name}
        </p>
        <p className="absolute left-1/2 -translate-x-1/2 top-[212px] -translate-y-1/2 font-body font-bold text-[20px] leading-none text-brand-accent">
          ${player.price}m
        </p>

        {/* Recent form — 4 cards */}
        <div className="absolute left-[11px] right-[11px] top-[245px] h-[94px] flex gap-[6px]">
          {player.recentForm.map((md) => (
            <RecentFormCard key={md.matchDay} md={md} />
          ))}
        </div>

        {/* Match Day + Season stat cards */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[361px] flex gap-[18px]">
          <StatCard label="Match Day" value={player.lastMatchDayPoints} />
          <StatCard label="Season" value={player.seasonPoints} />
        </div>

        {/* Action button — Remove for already-on-team players (outlined cyan),
            Select otherwise (filled cyan). Disabled with reduced opacity when
            no action is available (no active slot from the picker flow). */}
        {playerSelected ? (
          <button
            type="button"
            onClick={handleRemove}
            aria-label={`Remove ${player.name} from team`}
            className="absolute left-1/2 -translate-x-1/2 top-[427px] w-[140px] h-[39px] flex items-center justify-center px-[21px] py-[10px] bg-transparent border border-brand-accent text-brand-accent rounded-button font-body font-bold text-[14px] leading-none whitespace-nowrap transition-colors active:bg-brand-accent/10"
          >
            Remove
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSelect}
            disabled={!canSelect}
            aria-label={`Select ${player.name}`}
            className={`absolute left-1/2 -translate-x-1/2 top-[427px] w-[140px] h-[39px] flex items-center justify-center px-[21px] py-[10px] bg-brand-accent text-on-accent rounded-button font-body font-bold text-[14px] leading-none whitespace-nowrap transition-opacity ${
              canSelect ? 'active:opacity-90' : 'opacity-50 cursor-not-allowed'
            }`}
          >
            Select
          </button>
        )}
      </section>
    </main>
  );
}

function RecentFormCard({ md }: { md: MatchDayResult }) {
  return (
    <div className="flex-1 bg-brand-accent/20 rounded-[6px] relative">
      <span className="absolute left-1/2 -translate-x-1/2 top-[9px] font-body font-bold text-[8px] leading-none text-on-surface whitespace-nowrap">
        MD {md.matchDay}
      </span>
      <div className="absolute left-1/2 -translate-x-1/2 top-[24px] size-[20px]">
        <OpponentCrest code={md.opponentCode} />
      </div>
      <span className="absolute left-1/2 -translate-x-1/2 top-[54px] font-body font-bold text-[8px] leading-none text-on-surface whitespace-nowrap">
        {titleCase(md.opponentCode)} ({md.isHome ? 'H' : 'A'})
      </span>
      <span className="absolute left-1/2 -translate-x-1/2 top-[70px] font-body font-bold text-[16px] leading-none text-brand-accent whitespace-nowrap">
        {md.points} pts
      </span>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center justify-center w-[100px] h-[50px] bg-brand-accent rounded-button px-[21px] py-[8px]">
      <span className="font-body text-[12px] leading-tight text-on-accent whitespace-nowrap">
        {label}
      </span>
      <span className="font-body font-bold text-[18px] leading-tight text-on-accent">
        {value}
      </span>
    </div>
  );
}

function titleCase(code: string): string {
  // "POR" → "Por", "SD" → "Sd". Used for the recent-form opponent label to
  // match Figma's mixed-case rendering ("Por (H)", "Chi (A)").
  if (!code) return code;
  return code[0] + code.slice(1).toLowerCase();
}

/**
 * Stylized opponent crest — a shield silhouette with the 3-letter team code.
 * We deliberately don't pull individual NWSL team bitmaps from Figma for v1;
 * a styled shield is consistent across all 8+ possible opponents and reads as
 * a deliberate prototype choice rather than missing assets.
 */
function OpponentCrest({ code }: { code: string }) {
  return (
    <svg viewBox="0 0 24 28" className="size-full" aria-hidden="true">
      <path
        d="M3 2 Q3 0 5 0 H19 Q21 0 21 2 V15 Q21 23 12 27 Q3 23 3 15 Z"
        fill="rgba(98,203,201,0.25)"
        stroke="#62cbc9"
        strokeWidth="1"
      />
      <text
        x="12"
        y="17"
        textAnchor="middle"
        fontSize="7"
        fontWeight="700"
        fill="#ffffff"
        style={{ fontFamily: 'var(--font-body)' }}
      >
        {code}
      </text>
    </svg>
  );
}
