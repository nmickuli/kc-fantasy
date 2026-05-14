# Session handoff

Generated 2026-05-11 by a chat.claude.ai session. Picks up where we left off:
scaffold complete, Welcome screen implemented (v3), four screens still to go.

## Status

**Scaffold:** complete. `npm install && npm run dev` boots the app at
http://localhost:5173.

**Screens implemented:**
- [x] Welcome — `src/screens/Welcome.tsx` (full-bleed photo, fixed Figma px coords)
- [x] Team name — `src/screens/TeamName.tsx` (input bound directly to context state; submit trims and navigates to `/select-team`)
- [x] Select team — `src/screens/SelectTeam.tsx` (pitch + 3 starter slots + 3 bench slots + dynamic budget readout + Confirm button that navigates to `/home` once all 6 slots are filled)
- [x] Player picker — `src/screens/PlayerPicker.tsx` (modal-card with filter pills defaulting to slot's position, scrollable list, +/row-tap navigation)
- [x] Player profile — `src/screens/PlayerProfile.tsx` (modal-card with hero photo, recent-form 4-card carousel, Match Day + Season stat cards, Select button with `Selected ✓` disabled state for already-picked players)
- [x] Home — `src/screens/Home.tsx` (post-onboarding landing with two variants — upcoming and active-game — picked from fixture data; URL `?match=upcoming|live` forces a variant. Hero match card with internal action button (Edit Team / View Team), live deadline countdown or locked padlock, Match Day Points card in active variant, My Leagues, fixtures carousel with functional chevron arrows, Rules/Help footer)
- [x] Rules — `src/screens/Rules.tsx` (How to Play + Scoring scrollable rules list)
- [x] Help — `src/screens/Help.tsx` (HELP & FAQS — single card with multi-open accordion items; CSS grid-rows trick for smooth height animation without measuring content)
- [x] Team View — `src/screens/TeamView.tsx` (read-only drill-down of the user's team for one match; three variants — upcoming/active/previous — picked from `?md=N` or `?match=…`. Captain marker on the M starter slot; per-slot match-day points distributed proportionally from the fixture total. Functional `<` `>` chevrons navigate to the adjacent fixture. Edit Team button enabled only on upcoming.)

**Out of scope per CLAUDE.md** (intentionally not implemented even though the
Figma frames hint at them): Captain toggle, Substitute button, Transfer button,
Active Game variant of the profile, and the full Leagues create/join/share flow
(the + button on Home is a no-op for v1).

**Shared components introduced this session:**
- `src/components/ScreenHeader.tsx` — the "FANTASY FOOTBALL" / "BUILD YOUR DREAM TEAM" heading, reused across TeamName, SelectTeam, Picker, Profile.
- `src/components/Slot.tsx` — the 80×80 round slot with empty/filled variants (used 6× per SelectTeam render).
- `src/components/OpponentCrest.tsx` — stylized SVG shield with 3-letter team code. Used by PlayerProfile's recent-form cards, the Home hero match card, and the FixtureCard variant.
- `src/components/MatchCard.tsx` — exports both `HeroMatchCard` (340×130 with crests and date, with the action button INSIDE the card) and `FixtureCard` (95×119 compact card for the horizontal carousel). FixtureCard branches on `status` (`final` / `live` / `upcoming`) and adds a LIVE badge with a pulsing dot for in-progress matches.
- `src/components/MatchSummary.tsx` — cyan match-info card used on TeamView. Renders crests + score (active/previous) or kickoff time (upcoming), plus optional `<` `>` chevrons for navigating between fixtures. Status badge ("LIVE" / "Full-Time") on the bottom row.
- `src/components/TeamSlot.tsx` — read-only player slot used on TeamView. Same 80×80 photo + name pattern as `Slot`, but with optional captain marker (white pill with "C" in the top-right) and optional match-day points line (replaces the price).
- `src/components/DeadlinePill.tsx` — extracted from Home so TeamView can also use it. Two variants: counting (clock icon + live countdown) and locked (padlock icon + static text).
- `src/components/MatchDayPointsCard.tsx` — extracted from Home so TeamView can also use it. Dark-navy card with the running points as a big italic display-font number.
- `src/components/LeagueRow.tsx` — one league entry inside the My Leagues card on Home.
- `src/utils/playerPhoto.ts` — maps a `PlayerId` to a photo asset URL. 5 real KC Current photos ship in `public/assets/player-*.png`; the 11 other players in `players.ts` hash to one of those 5 deterministically.

**Mock data added for Home:**
- `src/data/matches.ts` — 5 fixtures spanning the recent past (MD 8-10 final), a live match (MD 11), and an upcoming one (MD 12 vs NC Courage). Dates are computed as offsets from `Date.now()` at module load so the deadline countdown reads ~3 days out regardless of when the demo runs.
- `src/data/leagues.ts` — one mock league (`KC Current League`, 156 teams, rank #1) so the My Leagues card has a single populated row to display.

**Motion (polish pass):**
- `--animate-fade-in` (240ms ease-out opacity 0→1), defined in `index.css` under `@theme`. Applied to every screen's `<main>` so routes mount with a soft fade rather than a hard snap. Also applied to the Profile dim overlay (so it doesn't flash) and to the picker's list `<ul>` (keyed on the filter, so changing pills re-runs the fade and softly refreshes the list).
- Confirm button on SelectTeam uses `transition-opacity duration-300 ease-out`, so the "lights up" moment when the 6th player is picked reads as deliberate.
- `prefers-reduced-motion: reduce` collapses every animation and transition to ~instant. Honors accessibility preferences without a code-level toggle.
- All animations are opacity-only; transforms would fight Tailwind's `-translate-x-1/2` positioning on modal cards.

**Assets pulled this session** (via `scripts/pull-assets.sh`):
- `pitch.png` — soccer pitch backdrop behind the starter slots
- `player-edmonds.png`, `player-labonta.png`, `player-winebrenner.png`, `player-johnson.png`, `player-mccain.png` — 5 KC Current player headshots from Figma

**Deliberate prototype shortcuts** (all flagged in the relevant file's JSDoc
in case a future polish pass wants to address them):
- Opponent crests on the recent-form cards are stylized SVG shields with the
  3-letter team code, not real NWSL bitmaps. Consistent across all opponents.
- The 11 players without a dedicated Figma photo reuse one of the 5 real
  photos via a deterministic hash. Side effect: some players in the picker
  list will share thumbnails. Backend will provide per-player photos later.
- Slot surname derivation uses the last whitespace-separated token, so
  "Kate Del Fava" displays as "Fava (D)". If this matters for the demo, add
  a `displayName` field to `players.ts`.

## Fonts (current state)

All three brand fonts referenced by the Figma are now self-hosted from
`public/fonts/`:

- `CustomCurrentType-Regular.otf` — display font (heading + brand text)
- `DIN-Regular.otf` + `DIN-Bold.otf` — registered under `font-family: 'DIN 2014'`
  in `fonts.css`. The shipped kit contains the original DIN cuts rather than
  the commercial DIN 2014 (Parachute), but they're the same family group and
  visually equivalent for this prototype. When/if a true DIN 2014 license is
  added, swap the OTF src URLs without touching the family-name or any
  component code.

`--font-body` is `"DIN 2014", Montserrat, sans-serif` — Montserrat (loaded via
Google Fonts CDN in `index.html`) remains as a glyph-coverage fallback.

## Assets

The three Figma bitmaps in `public/assets/` (`welcome-bg.png`, `bg-pattern.png`,
`kc-crest.png`) are pulled via `bash scripts/pull-assets.sh`. The implementation
falls back gracefully if any are missing (solid teal-deep for the photo, the
placeholder SVG for the crest).

## Traps to avoid

These are mistakes from earlier iterations — don't repeat them:

- **Don't make the welcome card fill all available vertical space.** The card
  has a fixed height (22.4% of viewport) in the Figma. Stretching it to
  `bottom-24` creates a tall empty navy block. Use the proportions in
  `Welcome.tsx`.
- **Don't make the welcome button cyan.** The Figma button is `bg-surface`
  (dark navy) with `text-on-surface` (white). The cyan accent color is for the
  subhead "Build Your Dream Team" only.
- **Don't make the welcome card opaque.** Use `bg-surface-translucent` so the
  player photo bleeds through behind it. That's the design intent.
- **Don't round the crest as a circle.** The KC crest is shield-shaped. Use
  `w-[82px] h-[98px]` with no `rounded-*` class. The `onError` fallback to the
  placeholder SVG handles the case where the bitmap isn't pulled yet.
- **Don't position text inside a card with absolute coordinates.** Use flex
  layout — text wraps differently with system sans fallback vs Custom Current
  Type, and absolute positioning causes overlaps. See the Welcome.tsx pattern.
- **Don't bypass the Figma reference.** Before implementing a screen, call
  `Figma:get_design_context` on the node ID (see CLAUDE.md for the list) to
  pull exact dimensions, font sizes, and text strings. Eyeballing from the
  mockup leads to mismatches.

## Working agreements observed during the prior session

- Pause for sign-off before each screen implementation. Render a mockup or
  pull the Figma screenshot, walk through state interactions, get a green
  light, then implement.
- Mock data choices: 16 KC Current 2024 players, prices $4-12m, spread to
  force budget tradeoffs against $50m cap. See `src/data/players.ts`.
- The conversation moved to Claude Code at this point because the chat round-
  trip (download zip → extract → reload → screenshot back) was too slow for
  iterative UI work. HMR is the right loop.

## Next step

Start on `/select-team`. Figma frame `77:355`. This is the most complex of the
remaining screens — a soccer pitch SVG with 3 starter slots (D/M/F) overlaid in
position, a bench row below with 3 more slots, a budget readout (probably top
or bottom), and a "Confirm Team" button gated by `canConfirmTeam(state)`.

Empty slots tap → `SET_ACTIVE_SLOT` then `navigate('/picker/:section/:position')`.
Filled slots tap → `navigate('/player/:playerId')` (view-only, no SET_ACTIVE_SLOT).
The selectors `budgetRemaining` and `canConfirmTeam` are already wired and ready.

Mockup-first pattern: pull `Figma:get_design_context` for `77:355`, then either
render a mockup or describe the layout, then implement once Nathan signs off.

The `<Pitch />` SVG should live as a separate component under `src/components/`
since it'll likely also be referenced when previewing a confirmed lineup later.

## Resume instructions

```bash
cd kc-fantasy
npm install        # if not already done
npm run dev        # http://localhost:5173
```

Read `CLAUDE.md` first for project conventions. Then this file. Then proceed
to implement `/team-name`.
