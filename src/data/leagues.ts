/**
 * Mock league memberships for the demo. The Home screen's "My Leagues"
 * section shows these; the leagues flow itself (create/join/share/view)
 * is out of scope for the current iteration — see HANDOFF.md for the
 * broader product roadmap.
 *
 * Just one league for now so the Home layout reads as "this is what your
 * leagues panel looks like" without committing to multi-row visuals.
 * Adding more entries is a one-line change here; the Home screen renders
 * them in order.
 */

export interface League {
  id: string;
  name: string;
  /** Total number of teams currently in this league. */
  teamCount: number;
  /** Current user's rank within the league. */
  myRank: number;
}

export const LEAGUES: ReadonlyArray<League> = [
  {
    id: 'kcc-official',
    name: 'KC Current League',
    teamCount: 156,
    myRank: 1,
  },
];
