# Migration to monorepo

This app is intentionally standalone for the prototype phase. When the time
comes to bring it into the YinzCam monorepo alongside the admin tool and
backend, this document captures the deferred concerns and the structural
choices made to ease the lift.

## What's deferred from v1

- **Backend persistence.** All state is in memory; refresh wipes the team.
  No API client, no fetch layer. The `selections` shape in `types.ts` is the
  natural payload — a `POST /teams` body. The `Player` shape is the natural
  `GET /players` row.

- **Auth.** No login, no user identity. The standalone build assumes "you
  are the user". When integrating, wrap with the monorepo's auth provider
  and gate the `/select-team` and beyond routes behind authentication.

- **Real-time scoring.** `seasonPoints` and `lastMatchDayPoints` are static
  mock numbers. Backend integration will replace `players.ts` with a fetched
  list + a websocket / SSE subscription for live updates.

- **Leagues, transfers, substitutions.** Out of scope per `kc-fantasy-scope.md`.
  Schema in `types.ts` will need extension when these land (probably a
  `Team` entity that owns `selections` plus a `League` entity).

- **GK position.** Rules screen scoring lists GK actions but the squad
  selection per Rich's design has no GK slot. Confirm with Rich whether
  v1.1 adds GK — if so, extend `Position = 'D' | 'M' | 'F' | 'GK'` and add
  a fourth slot in each section.

- **"DIN 2014 Bold" vs "DIN Bold" Figma slip.** The Player Profile
  (selected variants) references `DIN Bold` instead of `DIN 2014 Bold` on
  the "150 Points" string. Almost certainly a designer error in Figma.
  Flag for Rich on handoff.

## Structural choices made to ease migration

- **Module boundaries match likely shared packages.** `src/types.ts` is a
  candidate for extraction into `@yinzcam/fantasy-types` (shared with admin
  tool + backend). `src/state/` is app-specific and stays. `src/data/` would
  be replaced with API client calls, not extracted.

- **TypeScript path aliases (`@/*`)** work standalone and transfer to a
  monorepo TypeScript project references setup with no source changes.

- **Tailwind v4 already in use.** Same major version as the monorepo, so no
  config-format migration on the way in. The `@theme` block in
  `src/styles/index.css` is the extraction unit — pull it into a shared
  `@yinzcam/design-tokens/theme.css` or similar and `@import` it from every
  KC Current app. Don't pre-emptively extract until a second app exists
  with the same token surface.

- **No hardcoded URLs.** When the backend lands, add `import.meta.env.VITE_API_BASE`
  to whatever fetch layer goes in. The standalone build has zero env vars,
  so nothing needs to be backported.

- **State library deliberately not chosen.** The next agent should pick
  state management based on what other apps in the monorepo use. The current
  `useReducer + Context` is fine for this scope; do not pre-emptively migrate.

- **No design system components extracted.** Wait until at least one
  sibling app exists. Cross-app shared components from a single source are
  speculative — what looks shareable from one app often isn't.

## Things to NOT do at migration time

- Don't rewrite the state model unless the schema actually changes. The
  `SlotKey` discriminated union works fine inside a monorepo.
- Don't extract `Pitch.tsx` to shared until a second app needs a pitch view.
  Probability is low — admin tool likely lists teams as tables, not pitches.
- Don't refactor the mock data layer "just to clean it up" before the
  backend lands. The shape will change; throwaway code now is fine.
- Don't split `@theme` tokens across multiple files for "cleanliness".
  Tailwind v4 is happy with one block; multiple imports just add ordering
  questions for no benefit at this scale.

## Font licensing on hand-off

- **Custom Current Type** is a commercial brand asset licensed to KC Current
  / YinzCam. Self-hosted from `/public/fonts/`. Confirm license terms before
  enabling on a public consumer domain. Internal testing is covered under
  the existing client relationship.
- **Montserrat** is SIL OFL 1.1 — fine to ship anywhere. Loaded from Google
  Fonts CDN in the prototype; the monorepo may prefer self-hosting for
  privacy/CSP reasons.
- **NWSLFont, NWSLNumbers, Alternate Gothic No. 3** were provided by the
  client but not referenced anywhere in the current Figma design. Hold for
  future variants; check usage rights before adoption.
