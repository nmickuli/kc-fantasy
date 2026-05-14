import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DeadlinePill from '@/components/DeadlinePill';
import MatchDayPointsCard from '@/components/MatchDayPointsCard';
import { FixtureCard, HeroMatchCard } from '@/components/MatchCard';
import LeagueRow from '@/components/LeagueRow';
import { FIXTURES, deadlineFor, pickFixture, variantOf } from '@/data/matches';
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
 *   - Edit Team / View Team → /team-view (the read-only drill-down for
 *     this match day; from there the upcoming variant has its own Edit
 *     Team button that takes the user into /select-team).
 *   - Rules → /rules.
 *   - Help → /help.
 */
export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const currentMatch = pickFixture(searchParams);
  const isLive = variantOf(currentMatch) === 'active';
  const deadlineText = useCountdown(deadlineFor(currentMatch.kickoffAt));

  // Pass the currently-displayed matchDay through to TeamView so the
  // two screens stay in sync if the user is demo-ing a non-default
  // variant via `?match=…` or `?md=…`.
  function navToTeamView() {
    navigate(`/team-view?md=${currentMatch.matchDay}`);
  }

  return (
    <main className="relative w-full min-h-screen overflow-hidden animate-fade-in pb-[40px]">
      <HeroMatchCard
        fixture={currentMatch}
        actionLabel={isLive ? 'View Team' : 'Edit Team'}
        onAction={navToTeamView}
      />

      {isLive ? (
        <>
          <MatchDayPointsCard points={currentMatch.points ?? 0} top={170} />
          <DeadlinePill top={250} variant="locked" text="Deadline 0d 0h 0m" />
        </>
      ) : (
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

/* --- Inline subcomponents -------------------------------------------------- */

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
