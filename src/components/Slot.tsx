import type { Player, Position, Section } from '@/types';
import { playerPhotoUrl } from '@/utils/playerPhoto';

/**
 * Slot — a single team-selection slot in the SelectTeam grid.
 *
 * Two visual variants keyed off `section`:
 *   - `starters`: translucent navy fill, sits on top of the pitch image
 *   - `bench`:    cyan border, transparent fill, sits on the card surface
 *
 * Two content states keyed off `player`:
 *   - empty:   centered "+" circle icon + position label ("Defender" / etc.)
 *   - filled:  player headshot photo cropped into the 80×80 circle, with the
 *              player's surname + position abbreviation and price stacked
 *              below (matches `mockups/Team selected view.png`)
 *
 * The slot is always rendered as a `<button>` so the entire 80×80 circle is
 * one tappable target. The caller wires `onClick` to either dispatch
 * `SET_ACTIVE_SLOT` + navigate to `/picker/...` (empty) or navigate directly
 * to `/player/:id` (filled, view-only branch).
 */

interface SlotProps {
  section: Section;
  position: Position;
  player: Player | null;
  onClick: () => void;
}

const POSITION_LABELS: Record<Position, string> = {
  D: 'Defender',
  M: 'Midfielder',
  F: 'Forward',
};

function surname(fullName: string): string {
  // Use the last whitespace-separated token. Handles "Kristen Edmonds" → "Edmonds"
  // and "Lo'eau LaBonta" → "LaBonta". For multi-word surnames like "Del Fava"
  // this returns "Fava" — a minor v1 trade-off; the player data could grow a
  // dedicated `displayName` field if this matters during demo.
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1] ?? fullName;
}

export default function Slot({ section, position, player, onClick }: SlotProps) {
  const isStarter = section === 'starters';
  const containerStyles = isStarter
    ? 'bg-[rgba(8,31,44,0.65)]'
    : 'border border-brand-accent';

  if (player) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`${player.name}, ${POSITION_LABELS[position]}`}
        className={`flex flex-col items-center gap-[3px] rounded-full active:opacity-90`}
      >
        <div
          className={`relative size-[80px] rounded-full overflow-hidden ${containerStyles}`}
        >
          <img
            src={playerPhotoUrl(player.id)}
            alt=""
            className="absolute inset-0 size-full object-cover object-top"
          />
        </div>
        <span className="font-body font-bold text-[10px] leading-[12px] text-on-surface whitespace-nowrap capitalize">
          {surname(player.name)} ({position})
        </span>
        <span className="font-body font-bold text-[10px] leading-[12px] text-brand-accent whitespace-nowrap">
          ${player.price}m
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Add ${POSITION_LABELS[position]} to ${section}`}
      className={`flex flex-col items-center justify-center gap-[3px] size-[80px] rounded-full p-[14px] active:opacity-80 ${containerStyles}`}
    >
      <svg
        viewBox="0 0 29 29"
        className="size-[29px] text-on-surface"
        aria-hidden="true"
      >
        <circle
          cx="14.5"
          cy="14.5"
          r="13.25"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="14.5"
          y1="8.5"
          x2="14.5"
          y2="20.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="8.5"
          y1="14.5"
          x2="20.5"
          y2="14.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-body font-bold text-[10px] leading-[12px] text-on-surface">
        {POSITION_LABELS[position]}
      </span>
    </button>
  );
}
