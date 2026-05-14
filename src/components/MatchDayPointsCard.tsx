/**
 * Dark-navy card that displays the running fantasy points for a match.
 * Used on Home (active-game variant) and TeamView (active and previous
 * variants). The big italic display-font number is the focal point.
 *
 * Caller controls `top` because both screens stack it at slightly
 * different y-coordinates depending on what sits above it.
 */
interface MatchDayPointsCardProps {
  points: number;
  top?: number;
}

export default function MatchDayPointsCard({ points, top = 170 }: MatchDayPointsCardProps) {
  return (
    <section
      className="absolute left-1/2 -translate-x-1/2 w-[340px] h-[70px] bg-surface rounded-card shadow-accent-glow flex flex-col items-center justify-center gap-[2px]"
      style={{ top }}
      aria-label="Match Day Points"
    >
      <p className="font-body text-[12px] leading-none text-on-surface">Match Day Points</p>
      <p className="font-display italic text-[28px] leading-none text-brand-accent">{points}</p>
    </section>
  );
}
