import OpponentCrest from '@/components/OpponentCrest';
import type { Fixture } from '@/data/matches';

/**
 * Two related but visually distinct cards used on the Home screen, co-located
 * here because they both render `Fixture` data and share the crest layout.
 *
 *   - `HeroMatchCard`: the big card at the top of Home showing the current
 *     match. 340×130 from Figma `1:739`. The Figma puts the action button
 *     INSIDE the card (at card-y:75) — not below it. The button label
 *     varies by variant: "Edit Team" (upcoming, before lineup lock) or
 *     "View Team" (active game, lineup locked).
 *   - `FixtureCard`: a compact 95×119 card used in the horizontal fixtures
 *     carousel further down. Adapts its visual to the fixture's status:
 *     past finals show score + points; the live match adds a "LIVE" badge;
 *     upcoming shows a clock icon + days countdown. Figma `1:773`.
 *
 * Crests use our shared `OpponentCrest` (stylized SVG shield with team
 * code) — KC's own crest comes from the real `public/assets/kc-crest.png`
 * bitmap when available, falling back to `kc-crest.svg`.
 */

const KC_CREST_SRC = '/assets/kc-crest.png';
const KC_CREST_FALLBACK = '/assets/kc-crest.svg';

/** Format a kickoff Date as "Apr 26, 2024" — matches the Figma hero card. */
function formatMatchDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Format days remaining as e.g. "4d", "2d", "1d", "<1d". Used by FixtureCard for upcoming matches. */
function formatDaysUntil(d: Date): string {
  const ms = d.getTime() - Date.now();
  const days = Math.ceil(ms / (24 * 60 * 60 * 1000));
  if (days <= 0) return '<1d';
  return `${days}d`;
}

interface HeroMatchCardProps {
  fixture: Fixture;
  /** Button label inside the card. "Edit Team" pre-deadline, "View Team" post-deadline / live. */
  actionLabel: string;
  onAction: () => void;
}

export function HeroMatchCard({ fixture, actionLabel, onAction }: HeroMatchCardProps) {
  const venueLabel = fixture.isHome ? '(H)' : '(A)';
  return (
    <section
      className="absolute left-1/2 -translate-x-1/2 top-[30px] w-[340px] h-[130px] bg-surface rounded-card shadow-accent-glow"
      data-testid="hero-match-card"
    >
      {/* Match info text column — MD #, opponent line, date — all centered
          horizontally between the two crests. Figma puts these at card-y
          14.5 / 34.5 / 52.5 with `translate-y-1/2` (the y is the text
          center, not its top). */}
      <p className="absolute left-1/2 -translate-x-1/2 top-[14.5px] -translate-y-1/2 font-body text-[10px] leading-none text-on-surface whitespace-nowrap">
        MD {fixture.matchDay}
      </p>
      <p className="absolute left-1/2 -translate-x-1/2 top-[34.5px] -translate-y-1/2 font-body font-bold text-[13px] leading-none text-on-surface whitespace-nowrap">
        vs {fixture.opponent} {venueLabel}
      </p>
      <p className="absolute left-1/2 -translate-x-1/2 top-[52.5px] -translate-y-1/2 font-body text-[10px] leading-none text-on-surface whitespace-nowrap">
        {formatMatchDate(fixture.kickoffAt)}
      </p>

      {/* Opponent crest (left side), shield-styled with team code */}
      <div className="absolute left-[35px] top-[18px] w-[35px] h-[46px]">
        <OpponentCrest code={fixture.opponentCode} />
      </div>

      {/* KC crest (right side) — real bitmap when available */}
      <img
        src={KC_CREST_SRC}
        alt="KC Current"
        className="absolute right-[35px] top-[18px] w-[39px] h-[46px] object-contain"
        onError={(e) => {
          const img = e.currentTarget;
          if (!img.src.endsWith('.svg')) img.src = KC_CREST_FALLBACK;
        }}
      />

      {/* Action button INSIDE the card. Card is 130 tall; button sits at
          card-y:75 with ~37px height (px-21 py-10 + 14px text), leaving
          ~18px below the button to the card's bottom edge. Cyan fill on
          the dark navy card matches the Figma + both upcoming/active
          mockups. */}
      <button
        type="button"
        onClick={onAction}
        className="absolute left-1/2 -translate-x-1/2 top-[75px] w-[290px] flex items-center justify-center px-[21px] py-[10px] bg-brand-accent text-on-accent rounded-button font-body font-bold text-[14px] leading-none whitespace-nowrap transition-opacity active:opacity-90"
      >
        {actionLabel}
      </button>
    </section>
  );
}

export function FixtureCard({ fixture }: { fixture: Fixture }) {
  const isLive = fixture.status === 'live';
  const isUpcoming = fixture.status === 'upcoming';

  return (
    <div className="relative shrink-0 w-[95px] h-[119px] rounded-card bg-brand-accent/20 overflow-hidden">
      {/* MD label (top-left) */}
      <p className="absolute left-[6px] top-[11.5px] -translate-y-1/2 font-body font-bold text-[10px] leading-none text-on-surface whitespace-nowrap">
        MD {fixture.matchDay}
      </p>

      {/* LIVE badge (top-right, only when live) */}
      {isLive && (
        <p className="absolute right-[6px] top-[11.5px] -translate-y-1/2 font-body font-bold text-[10px] leading-none text-on-surface whitespace-nowrap flex items-center gap-[3px]">
          <span aria-hidden="true" className="inline-block w-[6px] h-[6px] rounded-full bg-state-over-budget animate-pulse" />
          LIVE
        </p>
      )}

      {/* Crests — KC on left, opponent on right (note: Figma puts opponent
          left and KC right on the hero card, but the fixture card uses a
          mirrored layout. Keeping per Figma.) */}
      <img
        src={KC_CREST_SRC}
        alt=""
        className="absolute left-[8px] top-[24px] w-[22px] h-[25px] object-contain"
        onError={(e) => {
          const img = e.currentTarget;
          if (!img.src.endsWith('.svg')) img.src = KC_CREST_FALLBACK;
        }}
      />
      <div className="absolute right-[8px] top-[24px] w-[22px] h-[25px]">
        <OpponentCrest code={fixture.opponentCode} />
      </div>

      {/* Score (or "vs" for upcoming) — centered horizontally between the crests */}
      <p className="absolute left-1/2 -translate-x-1/2 top-[37.5px] -translate-y-1/2 font-body font-bold text-[16px] leading-none text-on-surface whitespace-nowrap">
        {isUpcoming ? 'vs' : `${fixture.ourScore}-${fixture.theirScore}`}
      </p>

      {/* Opponent name (mid-card) */}
      <p className="absolute left-1/2 -translate-x-1/2 top-[67.5px] -translate-y-1/2 font-body font-bold text-[10px] leading-none text-on-surface whitespace-nowrap">
        {fixture.opponent.split(' ')[0]}
      </p>

      {/* Bottom: points for past/live, countdown for upcoming */}
      {isUpcoming ? (
        <>
          {/* Clock icon (inline SVG so we don't pull yet another asset) */}
          <svg
            viewBox="0 0 32 32"
            className="absolute left-1/2 -translate-x-1/2 top-[82px] w-[20px] h-[20px] text-brand-accent"
            aria-hidden="true"
          >
            <circle cx="16" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="16" y1="16" x2="16" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="16" x2="20" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p className="absolute left-1/2 -translate-x-1/2 top-[104px] -translate-y-1/2 font-body font-bold text-[20px] leading-none text-brand-accent text-center whitespace-nowrap">
            {formatDaysUntil(fixture.kickoffAt)}
          </p>
        </>
      ) : (
        fixture.points !== null && (
          <p className="absolute left-1/2 -translate-x-1/2 top-[94.5px] -translate-y-1/2 font-body font-bold text-[20px] leading-none text-brand-accent text-center whitespace-nowrap">
            {fixture.points} pts
          </p>
        )
      )}
    </div>
  );
}
