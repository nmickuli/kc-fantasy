import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FixtureCard, HeroMatchCard } from '@/components/MatchCard';
import LeagueRow from '@/components/LeagueRow';
import { FIXTURES, deadlineFor } from '@/data/matches';
import type { Fixture } from '@/data/matches';
import { LEAGUES } from '@/data/leagues';

/**
 * Home — screen 6.
 *
 * Post-onboarding landing page reached after Confirm Team Selection. Layout
 * derived from Figma frame `1:736` (upcoming variant) and `1:843` (active
 * game variant) — different page from the 77:X onboarding screens.
 * Everything is shifted up 100px from the Figma anchors because the Figma
 * reserves the top 110px for the KC Current app's brand header (which our
 * standalone prototype doesn't render).
 *
 * Two variants, picked at runtime from the fixtures data:
 *
 *   - **Upcoming**: shows the next upcoming match. Hero card has an
 *     "Edit Team" button. Deadline pill shows a clock + counts down. No
 *     Match Day Points card.
 *   - **Active game**: shows the currently-live match. Hero card has a
 *     "View Team" button (deadline has passed, lineup is locked). A
 *     dedicated Match Day Points card appears between hero and deadline,
 *     showing the running fantasy points for the in-progress match.
 *     Deadline pill shows a closed lock + reads `0d 0h 0m`.
 *
 * Variant selection priority:
 *   1. URL `?match=upcoming` or `?match=live` forces a specific variant
 *      (useful for the demo — flip between states without editing data).
 *   2. Otherwise, if any fixture is `live`, show active game variant for it.
 *   3. Otherwise, show upcoming variant for the next upcoming fixture.
 *
 * Figma → CSS layout (frame anchor – 100px shift, plus tighter gaps in the
 * active variant so the extra Match Day Points card still fits on iPhone
 * WebViews around 700px tall):
 *
 *   Upcoming variant:
 *   - Hero card:          top 30,  340×130, button at card-y 75 (inside)
 *   - Deadline pill:      top 170, 340×60
 *   - My Leagues:         top 240, 340×120
 *   - Fixtures:           top 370, 340×185
 *   - Rules/Help footer:  top 565
 *
 *   Active game variant:
 *   - Hero card:          top 30,  340×130
 *   - Match Day Points:   top 170, 340×70
 *   - Deadline pill:      top 250, 340×60
 *   - My Leagues:         top 320, 340×120
 *   - Fixtures:           top 450, 340×185 (or flex-shrink on short WebViews)
 *   - Rules/Help footer:  top 645
 *
 * State:
 *   - Deadline countdown re-renders every 30s (minute precision is enough
 *     for "Xd Yh Zm" formatting; seconds would just be wasted reconciles).
 *
 * Navigation:
 *   - Edit Team / View Team → /select-team (re-enter the picker flow; for
 *     v1 this navigates to the same edit screen for both variants, since
 *     we don't have a separate read-only Team View screen yet).
 *   - Rules → /rules.
 *   - Help → /help.
 */
export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const forcedVariant = searchParams.get('match'); // 'live' | 'upcoming' | null

  const { fixture: currentMatch, isLive } = pickCurrentMatch(forcedVariant);
  const deadlineText = useCountdown(deadlineFor(currentMatch.kickoffAt));

  return (
    <main className="relative w-full min-h-screen overflow-hidden animate-fade-in pb-[40px]">
      <HeroMatchCard
        fixture={currentMatch}
        actionLabel={isLive ? 'View Team' : 'Edit Team'}
        onAction={() => navigate('/select-team')}
      />

      {isLive ? (
        <>
          {/* Match Day Points — only in active game variant. The running
              fantasy points for the in-progress match, big italic display
              font, cyan accent. Sits between hero and deadline pill. */}
          <MatchDayPointsCard points={currentMatch.points ?? 0} />

          {/* Locked deadline pill — deadline has passed; lock icon
              instead of clock; text reads "Deadline 0d 0h 0m". */}
          <DeadlinePill top={250} variant="locked" text="Deadline 0d 0h 0m" />
        </>
      ) : (
        /* Upcoming variant — clock icon, live countdown. */
        <DeadlinePill top={170} variant="counting" text={`Deadline ${deadlineText}`} />
      )}

      {/* My Leagues — position shifts down by 80px in active variant to
          make room for the Match Day Points card above. */}
      <MyLeaguesCard top={isLive ? 320 : 240} />

      {/* Fixtures carousel — same horizontal scroll for both variants,
          with chevron scroll arrows overlaid. */}
      <FixturesCard top={isLive ? 450 : 370} />

      {/* Footer: Rules + Help. */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 ${isLive ? 'top-[645px]' : 'top-[565px]'} flex gap-[19px]`}
      >
        <button
          type="button"
          onClick={() => navigate('/rules')}
          className="w-[160px] h-[39px] flex items-center justify-center px-[21px] py-[10px] bg-surface text-brand-accent rounded-button font-body font-bold text-[14px] active:opacity-90"
        >
          Rules
        </button>
        <button
          type="button"
          onClick={() => navigate('/help')}
          className="w-[160px] h-[39px] flex items-center justify-center px-[21px] py-[10px] bg-surface text-brand-accent rounded-button font-body font-bold text-[14px] active:opacity-90"
        >
          Help
        </button>
      </div>
    </main>
  );
}

/* --- Variant selection ----------------------------------------------------- */

function pickCurrentMatch(forced: string | null): { fixture: Fixture; isLive: boolean } {
  const live = FIXTURES.find((f) => f.status === 'live');
  const upcoming = FIXTURES.find((f) => f.status === 'upcoming');

  if (forced === 'upcoming' && upcoming) {
    return { fixture: upcoming, isLive: false };
  }
  if (forced === 'live' && live) {
    return { fixture: live, isLive: true };
  }

  // Default: prefer live over upcoming so the demo lands on the richer
  // active-game variant. Falls back gracefully if there's no live match.
  if (live) return { fixture: live, isLive: true };
  if (upcoming) return { fixture: upcoming, isLive: false };
  // Edge case: no live or upcoming. Use the most-recent fixture.
  return { fixture: FIXTURES[FIXTURES.length - 1], isLive: false };
}

/* --- Inline subcomponents -------------------------------------------------- */

function MatchDayPointsCard({ points }: { points: number }) {
  return (
    <section
      className="absolute left-1/2 -translate-x-1/2 top-[170px] w-[340px] h-[70px] bg-surface rounded-card shadow-accent-glow flex flex-col items-center justify-center gap-[2px]"
      aria-label="Match Day Points"
    >
      <p className="font-body text-[12px] leading-none text-on-surface">Match Day Points</p>
      <p className="font-display italic text-[28px] leading-none text-brand-accent">{points}</p>
    </section>
  );
}

interface DeadlinePillProps {
  top: number;
  variant: 'counting' | 'locked';
  text: string;
}

function DeadlinePill({ top, variant, text }: DeadlinePillProps) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 w-[340px] h-[60px] bg-brand-accent rounded-card flex items-center justify-center gap-[12px]"
      style={{ top }}
      role="status"
      aria-label={text}
    >
      {variant === 'counting' ? (
        <ClockIcon />
      ) : (
        <LockIcon />
      )}
      <p className="font-body font-bold text-[18px] leading-none text-on-accent whitespace-nowrap">
        {text}
      </p>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 32 32" className="w-[24px] h-[24px] text-on-accent" aria-hidden="true">
      <circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <line x1="16" y1="16" x2="16" y2="9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="16" y1="16" x2="21" y2="18.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 32 32" className="w-[24px] h-[24px] text-on-accent" aria-hidden="true">
      {/* Shackle */}
      <path
        d="M11 14 V11 a5 5 0 0 1 10 0 V14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Body */}
      <rect x="9" y="14" width="14" height="11" rx="1.5" fill="currentColor" />
      {/* Keyhole */}
      <circle cx="16" cy="19" r="1.4" fill="var(--color-brand-accent)" />
    </svg>
  );
}

function MyLeaguesCard({ top }: { top: number }) {
  return (
    <section
      className="absolute left-1/2 -translate-x-1/2 w-[340px] h-[120px] bg-surface rounded-card shadow-accent-glow"
      style={{ top }}
    >
      <p className="absolute left-[12px] top-[25px] -translate-y-1/2 font-body font-bold text-[26px] leading-none text-brand-accent">
        My Leagues
      </p>
      <button
        type="button"
        aria-label="Add or join a league"
        // No-op for v1 — the leagues create/join flow is out of scope.
        className="absolute right-[10px] top-[10px] w-[30px] h-[30px] flex items-center justify-center bg-brand-accent rounded-[4px] text-on-accent active:opacity-90"
      >
        <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>

      <div className="absolute left-1/2 -translate-x-1/2 top-[49px]">
        {LEAGUES.map((league) => (
          <LeagueRow key={league.id} league={league} />
        ))}
      </div>
    </section>
  );
}

function FixturesCard({ top }: { top: number }) {
  return (
    <section
      className="absolute left-1/2 -translate-x-1/2 w-[340px] h-[185px] bg-surface rounded-card shadow-accent-glow overflow-hidden"
      style={{ top }}
    >
      <p className="absolute left-[12px] top-[24px] -translate-y-1/2 font-body font-bold text-[26px] leading-none text-brand-accent">
        Fixtures
      </p>

      <FixturesCarousel />
    </section>
  );
}

/**
 * Horizontal carousel of fixture cards with chevron scroll arrows overlaid
 * on the left and right edges (per Figma `1:778` / `1:827`). The arrows are
 * functional — clicking either scrolls the list by roughly one card width.
 * They auto-hide when the list is already scrolled to that end so users
 * don't see a useless button.
 */
function FixturesCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Re-evaluate "can I scroll further?" on mount and after every scroll, so
  // the chevrons accurately reflect the current scroll position.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    return () => el.removeEventListener('scroll', update);
  }, []);

  function scrollBy(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    // Card width 95 + gap 8 = 103; scroll by one card per tap.
    el.scrollBy({ left: direction * 103, behavior: 'smooth' });
  }

  return (
    <>
      <div
        ref={scrollerRef}
        className="absolute left-0 right-0 top-[52px] h-[132px] flex items-center gap-[8px] overflow-x-auto pl-[8px] pr-[8px] py-[8px]"
        style={{ scrollbarWidth: 'none' }}
      >
        <style>{`section ::-webkit-scrollbar { display: none; }`}</style>
        {FIXTURES.map((fixture) => (
          <FixtureCard key={fixture.matchDay} fixture={fixture} />
        ))}
      </div>

      {/* Scroll chevrons — overlaid on the scroller, auto-hide at edges. */}
      <CarouselChevron direction="left" visible={canScrollLeft} onClick={() => scrollBy(-1)} />
      <CarouselChevron direction="right" visible={canScrollRight} onClick={() => scrollBy(1)} />
    </>
  );
}

function CarouselChevron({
  direction,
  visible,
  onClick,
}: {
  direction: 'left' | 'right';
  visible: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'left' ? 'Scroll fixtures left' : 'Scroll fixtures right'}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      // Vertical center over the 132-tall scroll container at card-y 52
      // → center y = 52 + 66 = 118 in card coords.
      className={`absolute ${
        direction === 'left' ? 'left-[6px]' : 'right-[6px]'
      } top-[118px] -translate-y-1/2 w-[28px] h-[28px] flex items-center justify-center rounded-full bg-surface/85 text-brand-accent shadow-[0_2px_8px_rgba(8,31,44,0.5)] transition-opacity duration-150 active:opacity-70 ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <svg viewBox="0 0 24 24" className="w-[16px] h-[16px]" aria-hidden="true">
        <path
          d={direction === 'left' ? 'M15 6 L9 12 L15 18' : 'M9 6 L15 12 L9 18'}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/* --- Hooks ----------------------------------------------------------------- */

/**
 * Live countdown to a target date, formatted as "Xd Yh Zm" with parts
 * collapsing as the target approaches ("14h 30m", "30m", "now").
 *
 * Re-renders every 30 seconds — minute precision is enough for the
 * formatter, and 30s keeps the displayed value within 30s of accurate
 * without spamming React reconciliation.
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
