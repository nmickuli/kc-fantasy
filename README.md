# KC Current Fantasy — Prototype

5-screen onboarding + team-selection prototype for the KC Current fantasy app.
Target: internal testing Monday 2026-05-11. Standalone Vite + React app; will
move into the YinzCam monorepo at backend-integration time — see
[MIGRATION.md](./MIGRATION.md).

## Setup

```bash
npm install
```

Then drop two files into place that aren't in this scaffold:

1. **Brand display font** — copy `CustomCurrentType-Regular.otf` to
   `public/fonts/`. Without this, the display text falls back to system
   sans-serif but the app still runs.

2. **Figma bitmap assets** (optional, prototype runs without them):
   ```bash
   bash scripts/pull-assets.sh
   ```
   Then uncomment the `background-image` rule in `src/styles/index.css` to
   swap the solid teal backdrop for the swirl pattern.

## Run

```bash
npm run dev
```

Opens on `http://localhost:5173`. Server is bound to `0.0.0.0` so you can hit
it from your phone on the same network for mobile spot-checks (`npm run dev`
prints the LAN URL).

Requires Node 18+ (Vite 5). A `.nvmrc` pins to Node 22 for this repo — if you
use nvm, `nvm use` (in this directory) will switch to it.

## Build

```bash
npm run build      # tsc + vite build → dist/
npm run preview    # serve dist/ locally on :4173 to smoke-test the prod bundle
```

The bundle is small (~58 KB gzip JS + ~5 KB gzip CSS) thanks to no runtime
state library and only React + React Router as runtime deps. Player photos,
the pitch image, the swirl backdrop, and the self-hosted fonts ship from
`public/`, which Vite copies verbatim into `dist/`.

## Deploy

Static SPA hosted on **S3 + CloudFront**, provisioned via AWS CDK. The CDK
project lives under [`infra/`](./infra/) and is intentionally throw-away —
tear it down with one command once the project moves to AWS Amplify.

```bash
cd infra
npm install            # one-time
npm run bootstrap      # one-time per AWS account/region
npm run deploy         # builds ../dist/ then `cdk deploy`s it
```

`cdk deploy` prints the CloudFront URL as a stack output. Share that URL
with the client. Re-running `npm run deploy` syncs the new build and triggers
a `/*` CloudFront invalidation — ~30 seconds end-to-end after the first
deploy.

To tear it all down (deletes the bucket contents, the bucket, and the
distribution):

```bash
cd infra
npm run destroy
```

See [`infra/README.md`](./infra/README.md) for the full breakdown — what the
stack creates, AWS prerequisites, how to verify the SPA fallback works, how
to add a custom domain, etc.

### Asset prerequisites for a clean deploy

Before building, make sure these are in place (they live in `public/`,
which is `.gitignore`-clean and committed). If any are missing, the app
still renders, but with placeholders:

- `public/assets/welcome-bg.png` (Welcome photo backdrop)
- `public/assets/bg-pattern.png` (body swirl)
- `public/assets/pitch.png` (SelectTeam pitch)
- `public/assets/player-*.png` (5 KC Current headshots)
- `public/assets/kc-crest.png` (real crest; falls back to `kc-crest.svg`)
- `public/fonts/CustomCurrentType-Regular.otf` (display font)
- `public/fonts/DIN-Regular.otf`, `public/fonts/DIN-Bold.otf` (body font)

If any asset is missing, `scripts/pull-assets.sh` re-fetches the Figma
bitmaps. The MCP URLs in that script expire ~7 days after generation — if
the script 404s, run `Figma:get_design_context` on the Welcome node to
refresh, then update the URLs.

## Routes

| Path                              | Screen          |
|-----------------------------------|-----------------|
| `/`                               | Welcome         |
| `/team-name`                      | Team name entry |
| `/select-team`                    | Pitch + slots   |
| `/picker/:section/:position`      | Filtered roster |
| `/player/:playerId`               | Player profile  |

`section` is `starters` or `bench`; `position` is `D`, `M`, or `F`.

## Project layout

```
src/
  types.ts                 Section / Position / SlotKey / Player / Action
  data/players.ts          16-player mock roster
  state/
    reducer.ts             Pure reducer
    TeamSelectionContext.tsx  Provider + useTeamSelection hook
    selectors.ts           budgetRemaining, isSelected, isOverBudget, canConfirmTeam
  components/              (empty — built screen-by-screen)
  screens/                 (empty — screens currently inline in App.tsx)
  styles/
    fonts.css              @font-face for Custom Current Type
    index.css              @import "tailwindcss" + @theme tokens + base layer
```

## Styling — Tailwind v4

Tokens live in `src/styles/index.css` under `@theme { ... }`, not in a
`tailwind.config.ts`. Variable names map directly to utility class names:

| Variable                      | Utility examples                          |
|-------------------------------|-------------------------------------------|
| `--color-brand-teal`          | `bg-brand-teal`, `text-brand-teal`        |
| `--color-brand-accent`        | `bg-brand-accent`, `border-brand-accent`  |
| `--color-surface`             | `bg-surface`                              |
| `--color-on-surface`          | `text-on-surface`                         |
| `--color-state-over-budget`   | `text-state-over-budget`                  |
| `--font-display`              | `font-display`                            |
| `--font-body`                 | `font-body`                               |
| `--radius-card`               | `rounded-card`                            |
| `--shadow-accent-glow`        | `shadow-accent-glow`                      |
| `--tracking-playername`       | `tracking-playername`                     |

No PostCSS pipeline — `@tailwindcss/vite` handles everything. No autoprefixer
either; v4's Lightning CSS handles vendor prefixes.

Don't hardcode hex values in components. If you need a one-off, add it to
`@theme` first.

## State model

One reducer. One Context. State shape:

```ts
{
  teamName: string,
  selections: {
    starters: { D?, M?, F? },  // PlayerId in each slot
    bench:    { D?, M?, F? },
  },
  activeSlot: SlotKey | null,  // 'starters.D' etc; set on /picker entry
}
```

`activeSlot` is the modal-like "which slot is the picker filling" state. It's
set when the user taps an empty slot on `/select-team`, cleared on
`SELECT_PLAYER` or close. Tapping a *filled* slot navigates to the profile
without setting `activeSlot` — that's the view-only branch (no Substitute /
Transfer in v1).

Validation is in the UI layer, not the reducer. The picker `+` button and the
Profile `Select` button are disabled by `isOverBudget` from `selectors.ts`.
The reducer stays minimal — no error states to model.

## Deferred to v2 / backend integration

See [MIGRATION.md](./MIGRATION.md). Short list: backend persistence, auth,
real-time scoring, leagues, Substitute / Transfer flows, GK position.
