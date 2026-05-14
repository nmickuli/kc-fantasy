import { useNavigate } from 'react-router-dom';

/**
 * Rules — screen 7.
 *
 * Layout derived from Figma frame `77:3630` (375×812). Two stacked cards
 * ("How to Play" and "Scoring") with a small back-arrow + title header
 * above them.
 *
 * Figma → CSS mapping:
 *   - Header (back arrow + "RULES & SCORING"): top 60px (Figma's 118 felt
 *     low against the top of the screen now that we've shifted everything
 *     up on the other screens; using 60 keeps it aligned with the
 *     `ScreenHeader` pattern).
 *   - How to Play card: top 110px, 311×219px, opaque navy with cyan glow.
 *   - Scoring card: top 355px, 311 wide, flex height (bottom 20px) — its
 *     inner content overflows by ~28px even in the Figma frame, so we
 *     scroll the rules list inside the card rather than clip it.
 *
 * Why scroll the Scoring card instead of fixed-height: there are 11
 * scoring rows in the Figma content and they don't all fit in the 339px
 * Figma card (the inner rectangle is 367px tall — Figma itself was hiding
 * the last couple of rules). On short iPhone WebViews the card needs to
 * shrink further; flex-height + inner scroll handles every viewport.
 *
 * Note: the Figma file also shows a close-X in the top-right of the
 * Scoring card. Skipped because we already have a back arrow at the top
 * for navigation, and the X read as confusing UI duplication.
 */

interface ScoringRule {
  label: string;
  points: number;
}

const SCORING_RULES: ReadonlyArray<ScoringRule> = [
  { label: 'Playing up to 60 minutes', points: 1 },
  { label: 'Playing 60+ minutes', points: 2 },
  { label: 'Goal (GK)', points: 10 },
  { label: 'Goal (Defender)', points: 6 },
  { label: 'Goal (Midfielder)', points: 5 },
  { label: 'Goal (Forward)', points: 4 },
  { label: 'Assist', points: 3 },
  { label: 'Clean sheet (GK/Def)', points: 4 },
  { label: 'Penalty save', points: 5 },
  { label: 'Yellow card', points: -1 },
  { label: 'Red card', points: -3 },
];

const HOW_TO_PLAY: ReadonlyArray<string> = [
  'Select 6 players (2 defenders, 2 midfielders, 2 forwards)',
  'Split between starting lineup and bench',
  'Stay within $50m budget',
  'Use 1 transfer per week (max 3 accumulated)',
];

export default function Rules() {
  const navigate = useNavigate();

  return (
    <main className="relative w-full min-h-screen overflow-hidden animate-fade-in pb-[20px]">
      {/* Header: back arrow on the left, title centered horizontally. */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Back"
        className="absolute left-[21px] top-[60px] w-[32px] h-[32px] flex items-center justify-center text-on-accent active:opacity-70"
      >
        <svg viewBox="0 0 24 24" className="w-[20px] h-[20px]" aria-hidden="true">
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
      <h1 className="absolute left-1/2 -translate-x-1/2 top-[76px] -translate-y-1/2 font-body font-bold text-[20px] leading-none uppercase text-on-accent text-center whitespace-nowrap">
        Rules &amp; Scoring
      </h1>

      {/* How to Play card */}
      <section className="absolute left-1/2 -translate-x-1/2 top-[110px] w-[311px] h-[219px] bg-surface rounded-card shadow-accent-glow">
        <h2 className="absolute left-[13px] top-[31px] -translate-y-1/2 font-body font-bold text-[26px] leading-none text-brand-accent">
          How to Play
        </h2>
        <ul className="absolute left-[13px] right-[13px] top-[55px] font-body text-[15px] leading-[1.5] text-on-surface space-y-[2px]">
          {HOW_TO_PLAY.map((rule) => (
            <li key={rule}>• {rule}</li>
          ))}
        </ul>
      </section>

      {/* Scoring card — flex height with inner scroll for the rules list.
          The card stretches from top:355 to 20px from the bottom of the
          viewport, and the rules table inside scrolls when it overflows. */}
      <section className="absolute left-1/2 -translate-x-1/2 top-[355px] bottom-[20px] w-[311px] bg-surface rounded-card shadow-accent-glow overflow-hidden">
        <h2 className="absolute left-[13px] top-[31px] -translate-y-1/2 font-body font-bold text-[26px] leading-none text-brand-accent">
          Scoring
        </h2>

        <ul className="absolute left-0 right-0 top-[55px] bottom-[10px] overflow-y-auto px-[13px]">
          {SCORING_RULES.map((rule, idx) => (
            <li
              key={rule.label}
              className={`flex items-center justify-between py-[8px] font-body text-[15px] leading-none ${
                idx > 0 ? 'border-t border-white/10' : ''
              }`}
            >
              <span className="text-on-surface">{rule.label}</span>
              <span className="font-bold text-brand-accent ml-[8px] whitespace-nowrap">
                {rule.points > 0 ? `+${rule.points}` : rule.points}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
