# Hawker Guessr — image-first prototype

Five hawker-centre photos a day. Drop a pin and find out how well you actually
know Singapore. Full product spec in [PRD.md](PRD.md), visual direction in
[design.html](design.html).

```bash
npm install
npm run dev      # http://localhost:3111
```

## What v1 does

- **Daily puzzle**, five rounds, dropping at 06:00 SGT. Same puzzle for everyone.
- **Five image rounds** — identify a hawker centre by photo and drop a pin on Singapore, scored by distance:
  `1000 × e^(−d / 2.2km)`. 0 m = 1000 pts, 1 km = 635, 10 km = 11.
- **Reveal** after each round: your pin, the truth, the line between them, the
  distance, one fact worth repeating, and the photo licence credit.
- **Score card** with a spoiler-free emoji grid, today-qualified region read,
  streak, and a countdown to the next drop.
- **No login.** An anonymous cookie tracks the day's play; streaks live in
  localStorage.

## Layout

```
content/
  centres.json       55 real hawker centres, geocoded via OneMap
  questions.json     authored prompts plus photo provenance
public/hawkers/      local, resized photos with answer-neutral filenames
scripts/geocode.mjs  rebuilds centres.json from OneMap's public geocoder

src/
  domain/            pure logic, no I/O, no framework — the testable core
    scoring.ts         distance & price → points, score bands
    geo.ts             haversine, SG bounds, distance formatting
    calendar.ts        puzzle days, the 06:00 SGT drop, countdown
    verdicts.ts        the game's voice, all of it, in one file
    types.ts           Public* shapes are client-safe; the rest are not
  server/            server-only; `server-only` makes that a build error
    repository/        content access + the answer-stripping allow-list
    services/          scoreRound: the only reader of answer fields
    plays/             where a session's results live (memory → Supabase)
    puzzle.ts          deterministic daily assembly
    session.ts         anonymous cookie identity
    validation.ts      request parsing
  app/api/           two thin routes: GET /api/puzzle, POST /api/guess
  hooks/useGame.ts   the client state machine
  components/        presentational only; map components under map/
  lib/               fetch wrappers, share text, storage, money, map style
```

The rule the structure exists to enforce: **correct answers never reach the
browser.** `GET /api/puzzle` returns rounds with every answer field stripped;
`POST /api/guess` scores one round server-side and records it so a round can't
be replayed for a better score. Verified — see "Known gaps" for what wasn't.

## Adding content

Append to `content/questions.json`. `centreId` must match an `id` in
`centres.json`. Web photos must be stored locally under `public/hawkers/` with
an answer-neutral filename and include `imageCredit`, `imageSourceUrl`, and
`imageLicense`. Add the question id to `IMAGE_POOL_IDS` in
`src/server/puzzle.ts` when it is ready to enter the immutable daily pool.

The prototype currently has **one day** of image content, rotated into a
different order daily. Add a larger licensed or first-party photo set before a
public launch.

## Maps

OneMap raster tiles (Singapore Land Authority) via MapLibre GL. Free, no API
key, and the basemap actually looks Singaporean. Attribution is required and
is rendered on every map.

## Known gaps

- The full five-round flow, pin-drop interaction, reveal maps, phase scroll
  anchoring, attribution, and score card are verified at a 390×844 mobile
  viewport in headless Chrome.
- Plays are in memory and reset on deploy. Swap `src/server/plays/memory.ts`
  for a Supabase-backed store before leaderboards.
- No leaderboard, no accounts, no hawker map/profile, no share image (text
  only). All deliberate v1 cuts — see PRD.md §3.
- Price content and UI remain in the repository for a later mode, but are not
  selected or exposed by the image-first daily puzzle.
