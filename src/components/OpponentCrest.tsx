/**
 * Stylized opponent crest — a tinted shield silhouette with the 3-letter
 * team code in the center. Used by PlayerProfile's recent-form cards,
 * the Home screen's MatchCard, FixtureCard, and TeamView's MatchSummary.
 *
 * Two themes for the two background contexts in the app:
 *   - `'dark'` (default): cyan shield + white text. Used on dark navy
 *     backgrounds (PlayerProfile, MatchCard hero/fixture cards).
 *   - `'light'`: dark navy shield + dark navy text. Used on the cyan
 *     match-summary card on TeamView, where a cyan-on-cyan crest would
 *     be invisible.
 *
 * Why stylized instead of real NWSL bitmaps: pulling a separate crest
 * asset per opponent team would either (a) require 8+ extra PNGs in
 * `public/assets/` we don't have licensed assets for, or (b) leave a lot
 * of empty placeholders mid-demo. A consistent styled shield with the
 * team code reads as a deliberate prototype choice — and trivially
 * scales to any new opponent without an asset pipeline change.
 *
 * Replace with real bitmaps at backend-integration time if Rich wants
 * them — `code` → bitmap mapping can live in a separate utility and
 * `OpponentCrest` can fall back to the styled shield if a bitmap is
 * missing.
 */
interface OpponentCrestProps {
  code: string;
  theme?: 'dark' | 'light';
}

export default function OpponentCrest({ code, theme = 'dark' }: OpponentCrestProps) {
  const fill = theme === 'dark' ? 'rgba(98,203,201,0.25)' : 'rgba(8,31,44,0.18)';
  const stroke = theme === 'dark' ? '#62cbc9' : '#081f2c';
  const textFill = theme === 'dark' ? '#ffffff' : '#081f2c';

  return (
    <svg viewBox="0 0 24 28" className="size-full" aria-hidden="true">
      <path
        d="M3 2 Q3 0 5 0 H19 Q21 0 21 2 V15 Q21 23 12 27 Q3 23 3 15 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.2"
      />
      <text
        x="12"
        y="17"
        textAnchor="middle"
        fontSize="7"
        fontWeight="700"
        fill={textFill}
        style={{ fontFamily: 'var(--font-body)' }}
      >
        {code}
      </text>
    </svg>
  );
}
