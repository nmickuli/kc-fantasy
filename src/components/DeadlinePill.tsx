/**
 * Cyan deadline pill used by Home (counting down to lineup lock) and
 * TeamView (counting down on upcoming, locked at "0d 0h 0m" on active).
 *
 * Two visual variants:
 *   - `counting`: clock icon, live countdown text from the caller
 *   - `locked`:   closed-padlock icon, static "Deadline 0d 0h 0m" or similar
 *
 * Caller controls `top` because both screens position it at slightly
 * different y-coordinates depending on what's above it.
 */

interface DeadlinePillProps {
  top: number;
  variant: 'counting' | 'locked';
  text: string;
}

export default function DeadlinePill({ top, variant, text }: DeadlinePillProps) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 w-[340px] h-[60px] bg-brand-accent rounded-card flex items-center justify-center gap-[12px]"
      style={{ top }}
      role="status"
      aria-label={text}
    >
      {variant === 'counting' ? <ClockIcon /> : <LockIcon />}
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
      {/* Keyhole — punched out of the body in the same colour as the pill bg */}
      <circle cx="16" cy="19" r="1.4" fill="var(--color-brand-accent)" />
    </svg>
  );
}
