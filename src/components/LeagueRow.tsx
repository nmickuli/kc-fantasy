import type { League } from '@/data/leagues';

/**
 * One league entry inside the My Leagues card on Home. Visual treatment from
 * Figma `1:759` — a translucent cyan-tinted rectangle with the league name,
 * team count, and the user's current rank on the right.
 *
 * Sized to fit inside the parent `My Leagues` card (340 wide), with a small
 * inset so the card border isn't flush with the row edge. Width and corner
 * radius match the Figma frame; everything inside is flex-laid-out so longer
 * league names don't visually collide with the rank pill on the right.
 */
export default function LeagueRow({ league }: { league: League }) {
  return (
    <div className="relative h-[60px] w-[319px] bg-brand-accent/20 rounded-card flex items-center pl-[12px] pr-[15px]">
      <div className="flex-1 min-w-0">
        <p className="font-body font-bold text-[15px] leading-tight text-on-surface truncate">
          {league.name}
        </p>
        <p className="font-body text-[15px] leading-tight text-on-surface">
          {league.teamCount} teams
        </p>
      </div>
      <p className="font-body font-bold text-[20px] leading-none text-brand-accent ml-[8px] whitespace-nowrap">
        #{league.myRank}
      </p>
    </div>
  );
}
