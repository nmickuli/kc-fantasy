/**
 * Mock fixture list for the demo. Five matches spanning the recent past, a
 * "currently live" match, and an upcoming one — enough variety to populate
 * both the hero match card on Home and the horizontal fixtures carousel.
 *
 * Why dates are computed relative to `Date.now()` at module load (rather
 * than being hardcoded ISO strings):
 *
 *   - The Home screen's deadline countdown reads "Deadline Xd Yh Zm" off
 *     the next upcoming match. If we hardcoded e.g. 2026-05-14, then the
 *     moment that date passed, the demo would read "deadline passed" and
 *     the match would slide into the past.
 *   - Computing kickoffs as offsets from `Date.now()` keeps the demo
 *     looking fresh every time it loads: there's always a match ~3 days
 *     out, always a live one ~2h into the second half, always three
 *     finished matches in the recent past.
 *   - Side effect: refreshing the demo "resets" the countdown to ~3 days.
 *     Acceptable for a prototype; switch to fixed ISO dates if you ever
 *     wire this up to a backend.
 */

const HOURS = (h: number): number => h * 60 * 60 * 1000;
const DAYS = (d: number): number => d * HOURS(24);

const NOW = Date.now();

/**
 * Build a Date `days` from now, with the time-of-day pinned to a sensible
 * kickoff hour. Without this, kickoffs computed as raw `now + 3 days` end
 * up at whatever-second-the-page-loaded (e.g. "vs NC Courage 9:47pm")
 * which reads as accidental. Setting to 3pm local matches the Figma
 * mockup ("3pm") and feels intentional in the demo.
 */
function relativeKickoff(daysOffset: number, hour = 15): Date {
  const d = new Date(NOW + DAYS(daysOffset));
  d.setHours(hour, 0, 0, 0);
  return d;
}

export type FixtureStatus = 'final' | 'live' | 'upcoming';

export interface Fixture {
  matchDay: number;
  opponent: string;
  /** Three-letter team code used by `OpponentCrest` etc. */
  opponentCode: string;
  isHome: boolean;
  kickoffAt: Date;
  status: FixtureStatus;
  /** KC Current's score; null when status === 'upcoming'. */
  ourScore: number | null;
  theirScore: number | null;
  /** Fantasy points earned by the user's team; null for upcoming/live. */
  points: number | null;
}

export const FIXTURES: ReadonlyArray<Fixture> = [
  {
    matchDay: 8,
    opponent: 'San Diego Wave',
    opponentCode: 'SD',
    isHome: true,
    kickoffAt: relativeKickoff(-28),
    status: 'final',
    ourScore: 2,
    theirScore: 1,
    points: 65,
  },
  {
    matchDay: 9,
    opponent: 'Portland Thorns',
    opponentCode: 'POR',
    isHome: false,
    kickoffAt: relativeKickoff(-21),
    status: 'final',
    ourScore: 2,
    theirScore: 1,
    points: 65,
  },
  {
    matchDay: 10,
    opponent: 'Washington Spirit',
    opponentCode: 'WAS',
    isHome: true,
    kickoffAt: relativeKickoff(-14),
    status: 'final',
    ourScore: 3,
    theirScore: 0,
    points: 72,
  },
  {
    matchDay: 11,
    opponent: 'Chicago Stars',
    opponentCode: 'CHI',
    isHome: false,
    // ~75 minutes into the match — recognisably "live" without being on
    // the edge of full-time when the demo runs. Time-of-day not pinned
    // here because we explicitly want this fixture's kickoff to be in
    // the recent past relative to the page load.
    kickoffAt: new Date(NOW - HOURS(1.25)),
    status: 'live',
    ourScore: 2,
    theirScore: 1,
    // Mid-match running total. Real backend would compute this from live
    // match events; for the demo it's a plausible "halfway through scoring"
    // number that's lower than the finished MD10's 72.
    points: 48,
  },
  {
    matchDay: 12,
    opponent: 'NC Courage',
    opponentCode: 'NCC',
    isHome: false,
    // ~3 days out so the Home deadline countdown reads "2d Xh Ym"
    // initially (deadline is 1 hour before kickoff).
    kickoffAt: relativeKickoff(3),
    status: 'upcoming',
    ourScore: null,
    theirScore: null,
    points: null,
  },
];

/**
 * The hero match card on Home shows the next upcoming match. If somehow
 * none are upcoming (all played), fall back to the live one, then the last
 * final.
 */
export const NEXT_MATCH: Fixture =
  FIXTURES.find((f) => f.status === 'upcoming') ??
  FIXTURES.find((f) => f.status === 'live') ??
  FIXTURES[FIXTURES.length - 1];

/**
 * Fantasy convention: lineup lock 1h before kickoff. The Home deadline
 * pill counts down to this, not to kickoff itself.
 */
export function deadlineFor(kickoffAt: Date): Date {
  return new Date(kickoffAt.getTime() - HOURS(1));
}

/**
 * Map a fixture's status to the variant tag used in URL params and
 * rendering branches. Live → 'active', final → 'previous', upcoming →
 * 'upcoming'. Both Home and TeamView use this mapping.
 */
export type FixtureVariant = 'upcoming' | 'active' | 'previous';

export function variantOf(fixture: Fixture): FixtureVariant {
  if (fixture.status === 'live') return 'active';
  if (fixture.status === 'final') return 'previous';
  return 'upcoming';
}

/**
 * Pick which fixture to display, honoring URL search params and falling
 * back to a sensible default. Both Home and TeamView use this helper so
 * navigation between them stays in sync.
 *
 *   1. `?md=N` — show that specific match day exactly.
 *   2. `?match=upcoming|live|previous` — show the first matching fixture.
 *   3. Default — live > upcoming > most recent final.
 *
 * The "default" priority lands the demo on the richer active-game variant
 * when there's a live match in the data, which is what we want for client
 * review.
 */
export function pickFixture(searchParams: URLSearchParams): Fixture {
  const md = searchParams.get('md');
  if (md) {
    const found = FIXTURES.find((f) => String(f.matchDay) === md);
    if (found) return found;
  }

  const matchType = searchParams.get('match');
  if (matchType === 'upcoming') {
    const found = FIXTURES.find((f) => f.status === 'upcoming');
    if (found) return found;
  }
  if (matchType === 'live') {
    const found = FIXTURES.find((f) => f.status === 'live');
    if (found) return found;
  }
  if (matchType === 'previous') {
    // Most recent final, not the oldest.
    const finals = FIXTURES.filter((f) => f.status === 'final');
    if (finals.length > 0) return finals[finals.length - 1];
  }

  return (
    FIXTURES.find((f) => f.status === 'live') ??
    FIXTURES.find((f) => f.status === 'upcoming') ??
    FIXTURES[FIXTURES.length - 1]
  );
}

/**
 * Find adjacent fixtures for chevron navigation on TeamView. Returns null
 * for the previous/next slot when the current fixture is at an edge of
 * the FIXTURES list.
 */
export function adjacentFixtures(current: Fixture): {
  previous: Fixture | null;
  next: Fixture | null;
} {
  const idx = FIXTURES.findIndex((f) => f.matchDay === current.matchDay);
  return {
    previous: idx > 0 ? FIXTURES[idx - 1] : null,
    next: idx >= 0 && idx < FIXTURES.length - 1 ? FIXTURES[idx + 1] : null,
  };
}
