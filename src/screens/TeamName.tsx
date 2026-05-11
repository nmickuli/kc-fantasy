import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeamSelection } from '@/state/TeamSelectionContext';

/**
 * TeamName — screen 2.
 *
 * Layout uses absolute px coordinates derived from the 375×812 Figma frame
 * `77:1032`, cross-checked against `mockups/Team name.png`. Horizontal
 * sizing stays as percentages so the design flexes inside the 420px
 * max-width container, but vertical positioning is in px so the composition
 * doesn't stretch on tall viewports. The whole stack is shifted up 92px
 * from the Figma anchors to fit iPhone WebViews — see
 * `components/ScreenHeader.tsx` for the rationale.
 *
 * Figma → CSS mapping (shifted up 92px from Figma's frame):
 *   - h1 "Fantasy Football":      top 60px,    35px / leading 35px, on-accent
 *   - subhead "Build Your...":    top 111.5px (center), 19px, white
 *   - Card:                       top 227px,   height 182px, inset-x 8.5%
 *
 *   Inside the card (relative to card top, unchanged from Figma):
 *   - Card title "Name Your...":  top 19px,   25px / leading 28px, white
 *   - Input:                      top 66px,   width 87.8% (273/311), h 38px
 *   - Button:                     top 124px,  width 87.8%,           h 38px
 *
 * Note on the two Figma variants (`77:1041` and `77:1048`): the file shows two
 * stacked card variants with different button widths/labels. Those were design
 * exploration. The provided mockup is the canonical single design — white card
 * glow, full-width input + button, "Confirm Team" label.
 *
 * State flow: input is bound directly to context state via SET_TEAM_NAME on
 * every keystroke (back-nav from /select-team preserves the name). Submit
 * trims whitespace, persists the trimmed value, and navigates to /select-team.
 * Empty/whitespace-only names cannot submit.
 */
export default function TeamName() {
  const navigate = useNavigate();
  const { state, dispatch } = useTeamSelection();
  const trimmed = state.teamName.trim();
  const canSubmit = trimmed.length > 0;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    if (trimmed !== state.teamName) {
      dispatch({ type: 'SET_TEAM_NAME', name: trimmed });
    }
    navigate('/select-team');
  }

  return (
    <main className="relative w-full min-h-screen overflow-hidden animate-fade-in">
      <h1 className="absolute left-1/2 -translate-x-1/2 top-[60px] w-[82.9%] font-display text-[35px] leading-[35px] uppercase text-on-accent text-center">
        Fantasy Football
      </h1>

      <p className="absolute left-1/2 -translate-x-1/2 top-[111.5px] -translate-y-1/2 font-display text-[19px] uppercase text-on-surface whitespace-nowrap">
        Build Your Dream Team
      </p>

      <form
        onSubmit={handleSubmit}
        className="absolute inset-x-[8.5%] top-[227px] h-[182px] bg-surface rounded-card shadow-card-glow"
      >
        <p
          className="absolute left-1/2 -translate-x-1/2 top-[19px] w-[81.4%] font-display text-[25px] leading-[28px] uppercase text-on-surface text-center"
          style={{ textShadow: '0 1px 6px rgba(34, 34, 34, 0.62)' }}
        >
          Name Your Team
        </p>

        <input
          type="text"
          value={state.teamName}
          onChange={(e) => dispatch({ type: 'SET_TEAM_NAME', name: e.target.value })}
          placeholder="Enter Team Name"
          maxLength={30}
          autoFocus
          autoComplete="off"
          autoCapitalize="words"
          spellCheck={false}
          aria-label="Team name"
          className={`absolute left-1/2 -translate-x-1/2 top-[66px] w-[87.8%] h-[38px] bg-transparent border border-brand-accent rounded-button px-[21px] font-body font-bold text-[14px] text-center capitalize placeholder:text-brand-accent placeholder:capitalize focus:outline-none focus:ring-2 focus:ring-brand-accent ${
            canSubmit ? 'text-on-surface' : 'text-brand-accent'
          }`}
        />

        <button
          type="submit"
          disabled={!canSubmit}
          className="absolute left-1/2 -translate-x-1/2 top-[124px] w-[87.8%] h-[38px] bg-brand-accent text-on-accent rounded-button font-body font-bold text-[14px] capitalize transition-opacity active:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Confirm Team
        </button>
      </form>
    </main>
  );
}
