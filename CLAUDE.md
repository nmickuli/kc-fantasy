# KC Current Fantasy Football — Prototype

A standalone Vite + React + TypeScript prototype of the KC Current fantasy
football web app for internal testing, built ahead of monorepo integration with
the backend and admin tool.

**Client:** KC Current (NWSL). Contact: Rich.
**Owner:** Nathan Mickulicz, VP of Engineering at YinzCam.
**Scope:** 5 screens — Welcome, Team Name, Select Team, Player Picker, Player Profile.
**Out of scope (v1):** auth, backend persistence, leagues, transfers, substitutions, GK position, real-time scoring.

## Stack

- Vite 5 + React 18 + TypeScript (strict mode)
- React Router v6 (BrowserRouter)
- Tailwind CSS v4 via `@tailwindcss/vite` (CSS-first config, no `tailwind.config.ts`)
- State via `useReducer` + Context (no external state library)
- Mock data only (`src/data/players.ts`)

## File layout

```
src/
  types.ts                          Section/Position/SlotKey/Player/Action types
  data/players.ts                   16-player KC Current mock roster
  state/
    reducer.ts                      Pure reducer (4 action types)
    TeamSelectionContext.tsx        Provider + useTeamSelection hook
    selectors.ts                    budgetRemaining / isSelected / isOverBudget / canConfirmTeam
  components/                       (shared presentational — empty so far)
  screens/                          Welcome.tsx implemented; others inline in App.tsx
  styles/
    fonts.css                       @font-face for Custom Current Type
    index.css                       @import "tailwindcss" + @theme tokens
public/
  assets/                           Figma bitmaps (run scripts/pull-assets.sh)
  fonts/                            Drop CustomCurrentType-Regular.otf here
scripts/
  pull-assets.sh                    Curls 3 bitmaps from Figma MCP URLs
```

## State model

Single reducer + single Context. State shape:

```ts
{
  teamName: string,
  selections: {
    starters: { D?, M?, F? },   // PlayerId in each slot
    bench:    { D?, M?, F? },
  },
  activeSlot: SlotKey | null,   // 'starters.D' etc; set on /picker entry
}
```

`SlotKey` is a templated string union (`${Section}.${Position}`) so it
round-trips with route params cleanly. `activeSlot` is the "which slot is the
picker filling" state — set when tapping an empty slot on /select-team, cleared
on SELECT_PLAYER or picker close. Tapping a *filled* slot navigates to the
profile without setting activeSlot (view-only branch).

Validation lives in the UI layer via selectors, not in the reducer. The picker
`+` button and Profile `Select` button are disabled by `isOverBudget`. The
reducer stays minimal — no error states to model.

## Routes

| Path                              | Screen          |
|-----------------------------------|-----------------|
| `/`                               | Welcome         |
| `/team-name`                      | Team name entry |
| `/select-team`                    | Pitch + slots   |
| `/picker/:section/:position`      | Filtered roster |
| `/player/:playerId`               | Player profile  |

`:section` is `starters` or `bench`; `:position` is `D` / `M` / `F`.

## Design tokens

All design tokens live in `src/styles/index.css` under the `@theme` block.
Variable names map directly to Tailwind v4 utility classes — e.g.
`--color-brand-teal` → `bg-brand-teal`, `--shadow-card-glow` → `shadow-card-glow`.

Don't hardcode hex values in components. If a one-off is needed, add it to
`@theme` first.

Key tokens (full set in `index.css`):

- Brand: `brand-teal` (#5cb6b6), `brand-teal-deep` (#3c8a8a), `brand-accent` (#62cbc9)
- Surface: `surface` (#081f2c), `surface-translucent` (rgba(8,31,44,0.68))
- Text: `on-surface` (white), `on-accent` (dark navy), `muted` (#c8d4dc)
- States: `state-selected` (#62cbc9), `state-over-budget` (#e94545)
- Fonts: `display` (Custom Current Type), `body` (Montserrat / DIN 2014 fallback)

## Style conventions (per Figma, not visualizer house style)

The KC Current brand uses ALL CAPS display text and Title Case buttons. These
override generic style rules:

- **Page-level headings** (welcome heading, screen titles): uppercase via
  `uppercase` class on Custom Current Type Regular.
- **Hero text on Player Profile**: uppercase (player name renders as
  "KRISTEN EDMONDS" via `uppercase`, even though the data is "Kristen Edmonds").
- **Buttons**: Title Case via `capitalize` class. The data string is sentence
  case ("Create your own team") and CSS transforms it.
- **Player names in list views**: Title Case via `capitalize`, DIN 2014 Bold,
  with `tracking-playername` (0.77px) letter-spacing.

## Figma reference

- **File:** https://www.figma.com/design/JpNpzNBh1UtHl2VwzkQAFT/
- **Key:** `JpNpzNBh1UtHl2VwzkQAFT`
- **Frame ID per screen (use `Figma:get_design_context` or `get_screenshot`):**
  - Welcome: `77:423`
  - Team name: `77:1032`
  - Select your team: `77:355`
  - Player picker (expanded): `77:786`
  - Player profile: `77:535`
  - Rules: `77:3630`

The Figma uses only two font families: Custom Current Type Regular (display)
and DIN 2014 (Regular + Bold). NWSL fonts and Alternate Gothic No. 3 from the
uploaded font kit are NOT used by the current design.

One Figma slip worth knowing: the Player Profile selected variants reference
`DIN Bold` (not `DIN 2014 Bold`) on the "150 Points" string only. Treat it as
`DIN 2014 Bold`; flag to Rich on handoff.

## Asset workflow

The sandbox can't reach figma.com. Bitmaps are pulled locally via:

```bash
bash scripts/pull-assets.sh
```

This curls 3 PNGs into `public/assets/`:
- `welcome-bg.png` — player photo for the Welcome screen
- `bg-pattern.png` — brand swirl (body backdrop via index.css)
- `kc-crest.png` — real KC Current crest (replaces placeholder SVG fallback)

MCP URLs expire ~7 days after the design context call that generated them.
If the script 404s, run `Figma:get_design_context` on the Welcome node again
to refresh the asset URLs, then update `scripts/pull-assets.sh`.

The display font (`CustomCurrentType-Regular.otf`) is dropped into
`public/fonts/` separately by Nathan. Without it, display text falls back to
system sans-serif and the Welcome heading wraps to 3 lines instead of 2 —
not broken, just less polished.

## Build commands

```bash
npm install                # one-time
npm run dev                # http://localhost:5173 with HMR + LAN access
npm run build              # tsc + vite build, outputs to dist/
npm run typecheck          # tsc --noEmit
```

The `tsc` step in `build` will warn about deprecated `baseUrl` on TS 6.0+ but
doesn't block the build. Fix at migration time by adding `ignoreDeprecations`
to tsconfig.

## Working preferences

- **Mockup before implementation.** Before writing a screen's code, render a
  visual mockup (in chat or via screenshot of the Figma frame) and walk through
  the state-flow notes. Pause for review before writing.
- **Senior eng tone, no over-explaining basics.** Skip the "what is useReducer"
  scaffolding. Do explain architectural decisions when they matter (e.g. why
  `SlotKey` is a string union vs object, why validation lives in selectors).
- **Pixel-faithful to Figma, not approximate.** When implementing, pull exact
  coordinates and dimensions from `Figma:get_design_context` rather than
  eyeballing. Don't reference design tokens that aren't in the Figma file —
  brand-defined treatments override generic style rules.
- **Brand-faithful styling overrides generic rules.** The KC Current design uses
  ALL CAPS, glow shadows, brand-specific colors. Apply them as designed.
- **Robust to font fallback.** Use flex/grid layouts inside cards rather than
  absolute positioning of text, so wrapping behavior with the system-sans
  fallback doesn't break the layout.

## Deferred to monorepo migration

See `MIGRATION.md` for the full handoff to backend integration. Short list:
backend persistence, auth, real-time scoring, leagues, Substitute/Transfer
flows, GK position, shared types package extraction.

## See also

- `HANDOFF.md` — current session state (what's done, what's next, known issues)
- `MIGRATION.md` — monorepo migration handoff notes
- `README.md` — quick-start setup
