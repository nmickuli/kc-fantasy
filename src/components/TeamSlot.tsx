import type { Player, Position, Section } from '@/types';
import { playerPhotoUrl } from '@/utils/playerPhoto';

/**
 * Read-only player slot used on TeamView. Visually mirrors the filled
 * variant of `Slot` (used on SelectTeam) but with two key differences:
 *
 *   - **Captain marker**: a small white pill with "C" in the top-right of
 *     the photo circle when `isCaptain` is true. Display-only — no
 *     captain-toggle interaction in v1, just rendering.
 *   - **Bottom text**: instead of the player's price, this slot can show
 *     the match-day points the player scored. `points: null` (or omit)
 *     hides the bottom text entirely, matching the upcoming-variant
 *     mockup where points haven't accrued yet.
 *
 * The slot is a button so the entire 80×80 area is one tap target →
 * navigates to the player profile (where the Remove action lives).
 */

interface TeamSlotProps {
  section: Section;
  position: Position;
  player: Player;
  /** Match-day points for the player. `null` hides the points line. */
  points?: number | null;
  isCaptain?: boolean;
  onClick?: () => void;
}

const POSITION_LABELS: Record<Position, string> = {
  D: 'Defender',
  M: 'Midfielder',
  F: 'Forward',
};

function surname(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1] ?? fullName;
}

export default function TeamSlot({
  section,
  position,
  player,
  points = null,
  isCaptain = false,
  onClick,
}: TeamSlotProps) {
  const isStarter = section === 'starters';
  // Starters get a translucent navy ring like the SelectTeam pattern; bench
  // gets the cyan border. Keeps Team View visually consistent with the
  // editor it shadows.
  const containerStyles = isStarter
    ? 'bg-[rgba(8,31,44,0.65)]'
    : 'border border-brand-accent';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${player.name}, ${POSITION_LABELS[position]}${
        isCaptain ? ' (captain)' : ''
      }${points !== null ? `, ${points} points` : ''}`}
      className="flex flex-col items-center gap-[3px] active:opacity-90"
    >
      <div className={`relative size-[80px] rounded-full overflow-hidden ${containerStyles}`}>
        <img
          src={playerPhotoUrl(player.id)}
          alt=""
          className="absolute inset-0 size-full object-cover object-top"
        />
        {/* Captain marker — small white pill in the top-right of the
            circle, with the letter C in dark navy. Position from Figma
            `1:1708` (54px from slot left, 8px from top). */}
        {isCaptain && (
          <div
            className="absolute top-[6px] right-[6px] flex items-center justify-center min-w-[14px] h-[12px] px-[3px] bg-white rounded-[5px]"
            aria-hidden="true"
          >
            <span className="font-body font-bold text-[8px] leading-none text-on-accent">C</span>
          </div>
        )}
      </div>
      <span className="font-body font-bold text-[10px] leading-[12px] text-on-surface whitespace-nowrap capitalize">
        {surname(player.name)} ({position})
      </span>
      {points !== null && (
        <span className="font-body font-bold text-[10px] leading-[12px] text-on-surface whitespace-nowrap">
          {points}
        </span>
      )}
    </button>
  );
}
