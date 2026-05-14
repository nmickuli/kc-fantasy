import OpponentCrest from '@/components/OpponentCrest';
import type { Fixture, FixtureVariant } from '@/data/matches';

/**
 * Cyan match-summary card used on TeamView. Shows the opponent crests on
 * either side and stacks match metadata in the centre. Three visual
 * variants:
 *
 *   - **upcoming**: "MD N" / "vs Opponent (H/A) Time" / "Date"
 *   - **active**:   "MD N" / "[KC score] vs Opponent (H/A) [opponent score]" / "Date | LIVE"
 *   - **previous**: same shell as active, with "Full-Time" instead of "LIVE"
 *
 * Layout from Figma `1:1659` (active) / `1:1763` (upcoming). Score
 * positions, crest positions, and font sizes are taken verbatim from
 * the Figma frame so the visual matches the mockup exactly.
 *
 * Score convention (matches Figma): the LEFT-side score is **KC's** score
 * (`ourScore`); the RIGHT-side score is the **opponent's** (`theirScore`).
 * Reads naturally as "[implicit KC] X vs Opponent Y". This is opposite
 * the "score-next-to-its-own-crest" intuition — keep it as Figma has it.
 *
 * Optional `onPrev` / `onNext` render the < and > chevrons. The caller
 * computes whether each adjacent fixture exists and supplies a handler;
 * if `null`, the chevron isn't rendered.
 */

const KC_CREST_SRC = '/assets/kc-crest.png';
const KC_CREST_FALLBACK = '/assets/kc-crest.svg';

interface MatchSummaryProps {
  fixture: Fixture;
  variant: FixtureVariant;
  /** Top position in screen coordinates. */
  top: number;
  /** Click handler for the left chevron; null to hide. */
  onPrev?: (() => void) | null;
  /** Click handler for the right chevron; null to hide. */
  onNext?: (() => void) | null;
}

function formatMatchDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatKickoffTime(d: Date): string {
  // Match the Figma's "3pm" formatting: lowercase, no minutes when on the hour.
  const hour = d.getHours();
  const minutes = d.getMinutes();
  const period = hour >= 12 ? 'pm' : 'am';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  if (minutes === 0) return `${displayHour}${period}`;
  return `${displayHour}:${minutes.toString().padStart(2, '0')}${period}`;
}

export default function MatchSummary({ fixture, variant, top, onPrev, onNext }: MatchSummaryProps) {
  const venueLabel = fixture.isHome ? '(H)' : '(A)';
  const showScore = variant === 'active' || variant === 'previous';

  return (
    <section
      className="absolute left-1/2 -translate-x-1/2 w-[340px] h-[60px] bg-brand-accent rounded-card"
      style={{ top }}
      aria-label={`Match Day ${fixture.matchDay} versus ${fixture.opponent}`}
    >
      {/* Opponent crest on the left side. Light theme so the dark navy
          shield is visible on the cyan card background. Position from
          Figma `1:1669` (active variant): left:32, 34×34. */}
      <div className="absolute left-[32px] top-[13px] w-[34px] h-[34px]">
        <OpponentCrest code={fixture.opponentCode} theme="light" />
      </div>

      {/* KC crest on the right side. Real bitmap when available, falls
          back to the inline SVG. Position from Figma `1:1668`. */}
      <img
        src={KC_CREST_SRC}
        alt="KC Current"
        className="absolute right-[29px] top-[13px] w-[28px] h-[34px] object-contain"
        onError={(e) => {
          const img = e.currentTarget;
          if (!img.src.endsWith('.svg')) img.src = KC_CREST_FALLBACK;
        }}
      />

      {/* KC's score, sits to the LEFT of the centre text (next to the
          opponent crest). 17px DIN Bold, dark navy. Center-anchored at
          x:76 from the card's left edge — Figma `1:1664`. */}
      {showScore && fixture.ourScore !== null && (
        <p className="absolute left-[76px] -translate-x-1/2 top-[30px] -translate-y-1/2 font-body font-bold text-[17px] leading-none text-on-accent whitespace-nowrap">
          {fixture.ourScore}
        </p>
      )}

      {/* Opponent's score, sits to the RIGHT of the centre text (next to
          the KC crest). Center-anchored at x:264 — Figma `1:1665`. */}
      {showScore && fixture.theirScore !== null && (
        <p className="absolute left-[264px] -translate-x-1/2 top-[30px] -translate-y-1/2 font-body font-bold text-[17px] leading-none text-on-accent whitespace-nowrap">
          {fixture.theirScore}
        </p>
      )}

      {/* Match Day label — top of card, centred horizontally. */}
      <p className="absolute left-1/2 -translate-x-1/2 top-[10.5px] -translate-y-1/2 font-body text-[10px] leading-none text-on-accent whitespace-nowrap">
        MD {fixture.matchDay}
      </p>

      {/* Centre line — opponent name. "vs " in regular weight, opponent
          name in bold, venue label (and kickoff time, upcoming only) in
          smaller bold. Mixed weights match Figma `1:1663`. */}
      <p className="absolute left-1/2 -translate-x-1/2 top-[30px] -translate-y-1/2 font-body text-[17px] leading-none text-on-accent text-center whitespace-nowrap">
        <span className="font-normal">vs </span>
        <span className="font-bold">{fixture.opponent} </span>
        <span className="font-bold text-[13px]">{venueLabel}</span>
        {variant === 'upcoming' && (
          <span className="font-bold text-[13px]"> {formatKickoffTime(fixture.kickoffAt)}</span>
        )}
      </p>

      {/* Bottom line — date + optional status badge. */}
      <p className="absolute left-1/2 -translate-x-1/2 top-[48.5px] -translate-y-1/2 font-body text-[10px] leading-none text-on-accent whitespace-nowrap">
        {formatMatchDate(fixture.kickoffAt)}
        {variant === 'active' && (
          <>
            {' | '}
            <span className="font-bold text-state-over-budget">
              <span aria-hidden="true">●</span> LIVE
            </span>
          </>
        )}
        {variant === 'previous' && <span> | Full-Time</span>}
      </p>

      {/* Left chevron — visible when `onPrev` is provided. Position from
          Figma `1:1666` — flush against the left edge. */}
      {onPrev && (
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous match"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[32px] h-[32px] flex items-center justify-center text-on-accent active:opacity-70"
        >
          <svg viewBox="0 0 24 24" className="w-[14px] h-[14px]" aria-hidden="true">
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
      )}

      {/* Right chevron — visible when `onNext` is provided. Mirrors the
          left chevron's edge-aligned position. */}
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          aria-label="Next match"
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[32px] h-[32px] flex items-center justify-center text-on-accent active:opacity-70"
        >
          <svg viewBox="0 0 24 24" className="w-[14px] h-[14px]" aria-hidden="true">
            <path
              d="M9 6 L15 12 L9 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </section>
  );
}
