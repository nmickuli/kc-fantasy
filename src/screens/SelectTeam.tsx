import { useNavigate } from 'react-router-dom';
import ScreenHeader from '@/components/ScreenHeader';
import Slot from '@/components/Slot';
import { PLAYERS_BY_ID } from '@/data/players';
import { useTeamSelection } from '@/state/TeamSelectionContext';
import { budgetRemaining, canConfirmTeam } from '@/state/selectors';
import type { Player, Position, Section, SlotKey } from '@/types';

/**
 * SelectTeam — screen 3.
 *
 * Layout from the 375×812 Figma frame `77:355`, with absolute px coordinates
 * derived from the frame and shifted up 92px to fit iPhone WebViews:
 *
 *   - Card: top 166px (Figma 258 minus 92), 340×460px, centered. Opaque navy
 *     with cyan glow. The Figma empty-state frame draws the card at h=425,
 *     but the filled state stacks player surname + price BELOW each 80px
 *     slot circle (the `Team selected view.png` mockup shows this). Sticking
 *     with h=425 hides the bench prices behind the Confirm button. We use
 *     h=460 so both states fit comfortably, and the empty state just gets a
 *     touch more breathing room below the bench row (matches the relaxed
 *     bench-to-button spacing in the empty mockup too).
 *   - Budget readout (top-left of card, cyan DIN Bold 26px) is dynamic:
 *     reflects `budgetRemaining(state)`, starts at "$50m".
 *   - "Select 6 players" hint (top-right, DIN Regular 14px white).
 *   - "Starters" label (left, DIN Bold 15px white) at card-y 70.
 *   - Pitch image at card-y 85, 315×150, with three starter Slots overlaid
 *     at card-y 120 (their centers align with the pitch's vertical middle).
 *   - "Bench" label at card-y 252.
 *   - Three bench Slots at card-y 267.
 *   - "Confirm Team Selection" button at card-y 395, 290×38 (was 362 in the
 *     Figma empty frame; pushed down 33px to clear the bench filled-state
 *     price labels). Disabled (50% opacity) until all 6 slots are filled —
 *     then lights up fully and navigates to /home (the post-onboarding
 *     landing page added when the Home screen shipped).
 *
 * State interactions:
 *   - Empty slot tap → SET_ACTIVE_SLOT then navigate to `/picker/:s/:p`.
 *   - Filled slot tap → navigate to `/player/:id` (view-only, no
 *     SET_ACTIVE_SLOT per the reducer contract).
 */
export default function SelectTeam() {
  const navigate = useNavigate();
  const { state, dispatch } = useTeamSelection();
  const remaining = budgetRemaining(state, PLAYERS_BY_ID);
  const teamComplete = canConfirmTeam(state);

  function handleSlotClick(section: Section, position: Position) {
    const slot: SlotKey = `${section}.${position}`;
    const playerId = state.selections[section][position];
    if (playerId) {
      navigate(`/player/${playerId}`);
      return;
    }
    dispatch({ type: 'SET_ACTIVE_SLOT', slot });
    navigate(`/picker/${section}/${position}`);
  }

  const playerInSlot = (section: Section, position: Position): Player | null => {
    const id = state.selections[section][position];
    return id ? PLAYERS_BY_ID[id] ?? null : null;
  };

  return (
    <main className="relative w-full min-h-screen overflow-hidden animate-fade-in">
      <ScreenHeader />

      {/* Main card — opaque navy with cyan glow. Height bumped from Figma's
          425 to 460 so filled bench slots' price labels don't collide with
          the Confirm button (see component-level JSDoc for the rationale).
          top:166 = Figma's 258 minus the universal 92px shift-up. */}
      <section className="absolute left-1/2 -translate-x-1/2 top-[166px] w-[340px] h-[460px] bg-surface rounded-card shadow-accent-glow">
        {/* Budget header (left) */}
        <p className="absolute left-[13px] top-[25.5px] -translate-y-1/2 font-body font-bold text-[26px] leading-none text-brand-accent">
          Budget: ${remaining}m
        </p>

        {/* "Select 6 players" hint (right) */}
        <p className="absolute right-[17px] top-[28.5px] -translate-y-1/2 font-body text-[14px] leading-none text-on-surface whitespace-nowrap">
          Select 6 players
        </p>

        {/* "Starters" label */}
        <p className="absolute left-[13px] top-[70px] -translate-y-1/2 font-body font-bold text-[15px] leading-none text-on-surface">
          Starters
        </p>

        {/* Pitch image + 3 starter slots overlaid */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[85px] w-[315px] h-[150px] rounded-[10px] overflow-hidden bg-grass">
          <img
            src="/assets/pitch.png"
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        </div>

        <div className="absolute left-[36px] top-[120px]">
          <Slot
            section="starters"
            position="D"
            player={playerInSlot('starters', 'D')}
            onClick={() => handleSlotClick('starters', 'D')}
          />
        </div>
        <div className="absolute left-[131px] top-[120px]">
          <Slot
            section="starters"
            position="M"
            player={playerInSlot('starters', 'M')}
            onClick={() => handleSlotClick('starters', 'M')}
          />
        </div>
        <div className="absolute left-[227px] top-[120px]">
          <Slot
            section="starters"
            position="F"
            player={playerInSlot('starters', 'F')}
            onClick={() => handleSlotClick('starters', 'F')}
          />
        </div>

        {/* "Bench" label */}
        <p className="absolute left-[13px] top-[252px] -translate-y-1/2 font-body font-bold text-[15px] leading-none text-on-surface">
          Bench
        </p>

        {/* 3 bench slots */}
        <div className="absolute left-[36px] top-[267px]">
          <Slot
            section="bench"
            position="D"
            player={playerInSlot('bench', 'D')}
            onClick={() => handleSlotClick('bench', 'D')}
          />
        </div>
        <div className="absolute left-[131px] top-[267px]">
          <Slot
            section="bench"
            position="M"
            player={playerInSlot('bench', 'M')}
            onClick={() => handleSlotClick('bench', 'M')}
          />
        </div>
        <div className="absolute left-[227px] top-[267px]">
          <Slot
            section="bench"
            position="F"
            player={playerInSlot('bench', 'F')}
            onClick={() => handleSlotClick('bench', 'F')}
          />
        </div>

        {/* Confirm button — lights up at full opacity when team is complete
            and navigates to /home. Disabled (50% opacity) until all 6 slots
            are filled. */}
        <button
          type="button"
          disabled={!teamComplete}
          onClick={() => teamComplete && navigate('/home')}
          className={`absolute left-1/2 -translate-x-1/2 top-[395px] w-[290px] h-[38px] flex items-center justify-center bg-brand-accent text-on-accent rounded-button font-body font-bold text-[14px] capitalize whitespace-nowrap transition-opacity duration-300 ease-out ${
            teamComplete ? 'active:opacity-90' : 'opacity-50 cursor-not-allowed'
          }`}
        >
          Confirm Team Selection
        </button>
      </section>
    </main>
  );
}
