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
    kickoffAt: new Date(NOW - DAYS(28)),
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
    kickoffAt: new Date(NOW - DAYS(21)),
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
    kickoffAt: new Date(NOW - DAYS(14)),
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
    // the edge of full-time when the demo runs.
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
    kickoffAt: new Date(NOW + DAYS(3)),
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
