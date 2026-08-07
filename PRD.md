# Hawker Guessr 🇸🇬 — Refined Product Spec

*"Confirm you know Singapore food. Prove it."*

Status: pre-build. Owner: Pawan. Date: 2026-08-07.

---

## 0. What changed from the first draft (and why)

The original spec is a strong vision but a weak v1. Five changes matter:

| # | Original | Refined | Why |
|---|---|---|---|
| 1 | 6 game modes | **1 mode ships. 1 mode follows.** | 6 modes = 6 content pipelines = 0 finished. Wordle won with one mode. |
| 2 | Right/wrong multiple choice | **Distance-scored guessing** (GeoGuessr logic) | Binary MCQ is unfair (nobody knows all 121 centres) and boring on a miss. "You were 2.3 km off, 780 pts" makes losing fun and teaches geography. |
| 3 | Content = "take photos on weekends" | **Content engine is the product.** Priced, staffed, scheduled. | 100 questions = 20 days of daily challenge, then the app is dead. This is the whole risk. |
| 4 | Price mode is #5 | **Price mode is #2, maybe #1** | Cheapest content to produce, zero photo-rights problem, most viral ("$8 for cai png?!"), evergreen (prices change yearly). |
| 5 | Answers in the client | **Answers never leave the server** | Leaderboards + client-side answers = leaderboard is fiction in week 1. |

And one addition: **the map that fills in.** The Pokémon instinct in your spec is real, but a badge list doesn't scratch it. A map of Singapore where the regions you've proven you know light up — that's the collection, the identity, and the share card, all in one object.

---

## 1. Positioning

**Not** "a Singapore food quiz."
**Is:** *a daily argument with your friends about who is actually Singaporean.*

One-liner for the app store / OG tags:
> **Hawker Guessr — one photo, one guess, every day. How well do you actually know Singapore?**

Emotional promise, in order of strength:
1. **Bragging rights.** "I got 4/5, you got 2/5, jialat."
2. **Nostalgia.** "Eh, that's the one my ah ma used to bring me."
3. **Discovery.** "Where is that? Adding to list."
4. **Anxiety, usefully.** "I've only been to 12 of 121 hawker centres." → collection drive.

### Audience, ranked

| Segment | Size | Why they play | Retention risk |
|---|---|---|---|
| SG locals 20–40, chronically online | Core | Bragging, nostalgia | Boredom — need difficulty ramp |
| Uncles/aunties 50+ | High value, hard to reach | They actually know the answers, will destroy the young | Won't install an app — **must work on mobile web, no login** |
| Expats/tourists | Vocal, low retention | Discovery | Will churn after the novelty; fine |
| Hawker owners / heritage folks | Tiny, strategically vital | Their stall on screen | Handle with care — see §8 |

Design implication: **mobile web first, no app, no login to play.** An uncle forwarded a WhatsApp link should be guessing within 3 seconds.

---

## 2. The core loop (v1)

```
WhatsApp link / bookmark
        ↓
Photo loads. No login. No tutorial.
        ↓
Guess: tap a point on the SG map  (or pick from 4, in easy rounds)
        ↓
Reveal: real location, distance, points, ONE fact worth repeating
        ↓
×5 rounds
        ↓
Score card + your map lights up + streak
        ↓
Share (emoji grid, spoiler-free)
        ↓
"Next hawker in 14h 22m"
```

**Daily drop: 6:00am SGT.** Not midnight — you want it live for the MRT commute and settled before the lunch group chat starts.

### Scoring — the piece that makes or breaks feel

Per round, max 1000 points:

- **Location rounds:** points decay with distance from the true hawker centre.
  `points = round(1000 × e^(−d / 2.2km))`
  → 0 m = 1000. 1 km = 635. 3 km = 255. 10 km = 11.
  Singapore is ~50 km wide; 2.2 km is tuned so "right neighbourhood" feels rewarded and "right region" doesn't.
- **Bonus +150** if you name the correct hawker centre from the 4 nearest, after placing the pin.
- **No time pressure in v1.** Timers make casual players quit. Add an optional "Kiasu Mode" timer later for the leaderboard crowd.

Why this matters: with MCQ, a miss is a dead end. With distance, *every* guess pays something and every reveal teaches you where you were wrong on a map. That's the difference between Wordle and a pub quiz.

### The five rounds are curated, not random

Fixed shape so the day has an arc:

| Round | Type | Difficulty |
|---|---|---|
| 1 | Famous stall, name visible-ish | Warm-up, ~everyone gets it |
| 2 | Dish close-up → which centre | Medium |
| 3 | Interior / ceiling / tables only | Hard — this is the signature round |
| 4 | **Price guess** (see below) | Medium, always the fun one |
| 5 | Exterior / surroundings / MRT exit | Medium-hard, "GeoGuessr" round |

Round 4 scoring: `points = round(1000 × max(0, 1 − |guess − actual| / actual))` — 20% off = 800 pts.

---

## 3. Modes: what ships when

**V1 (weeks 1–4): Daily Hawker — the five rounds above. Nothing else.**

**V1.1 (week 5–6): Endless / Kopitiam Mode.** Same engine, random draw, no daily limit. This exists purely because the 5% of players who finish the daily and want more are the ones who'll invite friends. Cheap to build (engine already exists), expensive in content (burns questions fast) — so cap it at 20 rounds/day per user, and it draws from a *separate, lower-quality pool* so it doesn't eat daily-challenge content.

**V2: Price Guess as its own daily.** "Kopi Index." One dish, one stall, guess the 2026 price. Possibly bigger than the main game. Sponsorable. Newsworthy annually.

**Deferred, explicitly:** Dish Detective (subset of round 2 — not a mode), Hawker Centre Guessr (that's round 5 — not a mode), Personality Quiz (needs data volume you won't have for months), community submissions (see §5), friends leaderboards, AI hawker guide.

Cutting these isn't scope-shaving. Each deferred mode is a *content pipeline* with its own photography brief and QA burden. One pipeline, run well, beats six half-fed ones.

---

## 4. Identity: the Hawker Map (replaces "Hawker Passport")

The profile is **one screen and one object**: a map of Singapore with all 121 NEA hawker centres as dots.

- **Grey dot** — never seen it in a round.
- **Outline dot** — seen it, guessed wrong.
- **Filled dot** — guessed within 1 km.
- **Gold dot** — nailed it (within 250 m) or named it correctly.

Under the map, three numbers only:

```
    38 / 121          17 day          Top 12%
    centres known      streak         this week
```

**Region mastery** falls out of this for free and is the best share bait in the product:

> **You are an EAST SIDE specialist.**
> East 82% · Central 61% · West 19% · North 12%
> *"You have never once correctly guessed anything past Bukit Batok."*

That last line is the product. It's specific, it's funny, it's a personal attack, and people screenshot personal attacks.

Badges still exist, but as a secondary drawer — and they should be *earned by behaviour, not volume*: `Uncle Approved` (5 rounds in a row on 1970s-era centres), `Never Left My Estate` (90%+ of correct guesses within 5 km of each other), `Queue Warrior`, `Kaypoh` (played 30 days).

---

## 5. Content: the actual hard problem

Be blunt about the arithmetic. Daily challenge = 5 questions/day = **1,825 questions/year.** Your draft's "100 questions" is 20 days.

### What you actually need to launch

- **Launch stock: 300 questions** (60 days of daily). Below this you cannot launch — running out at day 25 kills the streak mechanic permanently, and streaks don't come back.
- **Sustaining rate: 35 new questions/week** minimum, ~50 to build buffer.

### Where photos come from — honest assessment

| Source | Reality check | Use it for |
|---|---|---|
| data.gov.sg | Locations, addresses, opening hours, cleaning closures — **excellent**. Photos — essentially none. | The `hawker_centres` table. Do this in an afternoon. |
| OneMap API | Free, official, SG-specific geocoding + basemap. Better than Google Maps for this. | The map. Avoids Google Maps billing entirely. |
| Wikimedia Commons | ~50–150 usable SG hawker photos, mostly exteriors, mostly the famous 15 centres. Licences vary — CC-BY needs visible attribution. | Round 5 (exteriors) for well-known centres only. Not enough to launch on. |
| User submissions | **Zero on day one.** A submission flow with no users is a dead form. Also: unverifiable, and every photo is a moderation + rights liability. | V2, after there's an audience worth contributing to. |
| Hawker owner partnerships | Slow, relationship-driven, ~2–5 stalls a month realistically. | V2 marketing, not v1 supply. |
| **Your own camera** | **This is the answer.** | Everything. |

### The realistic plan: 6 shooting weekends

One hawker centre yields **8–15 questions** (exterior, 2 interiors, 4 dishes, 3 prices, tiles/signage detail). So:

- **~30 centres shot = ~330 questions = launch stock.**
- 30 centres ≈ **6 weekends, 5 centres per weekend** (they're clustered; Chinatown/Maxwell/Amoy/Hong Lim is one morning).
- Shoot the correct 30: the 15 famous (needed for easy rounds) + 15 unglamorous heartland ones (Kampung Admiralty, Yishun Park, Taman Jurong, Bukit Timah Market) — the second group is where the hard, interesting rounds come from.

**Shot list per centre (standardise this, it makes the whole thing tractable):**
1. Exterior + street context — 2 shots
2. Interior wide, empty-ish tables — 2 shots
3. Ceiling/fan/signage board — 1
4. Floor tiles or stall-number plate — 1
5. Dishes, top-down, plain background — 4–6
6. **A price**: photograph the menu board with the dish — 3

Phone camera is fine. Shoot 10am–11am (light + before crowds + before you become a nuisance). Budget: transport + you eating a lot. ~$400 total, which is genuinely the whole content cost.

**Do this before writing much code.** If you can't finish 3 shooting weekends, the app should not be built — better to learn that in August than in November with a finished codebase and 40 questions.

**Anti-cheat:** crop out anything Google-reverse-searchable, strip EXIF GPS on upload (critical — your own photos will carry exact coordinates), serve at 1200px max, and never send the answer to the client (§7).

---

## 6. Design direction

Not brutalist (that's Marka). Not "clean startup app". The right reference is **hawker centre signage itself**: enamel plates, stall number tiles, dot-matrix price boards, the NEA-issue blue-and-white, red-and-yellow zi char banners, terrazzo floors.

### Palette

| Token | Hex | Use |
|---|---|---|
| `--tile` | `#F4F1E8` | Background — off-white, like an old tile |
| `--ink` | `#1A1714` | Text |
| `--chilli` | `#D6202B` | Primary action, correct-ish, the brand |
| `--kopi` | `#6B4423` | Secondary, borders on cards |
| `--pandan` | `#2E7D4F` | Success / gold-dot state |
| `--kaya` | `#F2B705` | Streaks, badges, highlights |
| `--tile-line` | `#D8D2C2` | Grout lines, dividers, grid |

Dark mode: `--tile` → `#171412`, `--ink` → `#F4F1E8`, chilli brightens to `#FF3B45`. Same structure, night-market feel.

### Type

- **Display:** a heavy condensed grotesque — *Oswald* or *Barlow Condensed*, uppercase, tight. Reads as signboard.
- **Body:** *Inter* or *IBM Plex Sans* — must handle Chinese characters gracefully next to Latin (stall names are bilingual; get this right or it looks amateur immediately).
- **Numbers:** tabular figures, always. Scores, prices, distances, countdowns. A jittering countdown looks broken.

### Structural motifs

- **Stall-number tiles.** Round indicator is 5 square enamel tiles numbered 01–05. Fills with chilli red as you go. This is the app's visual signature — it appears on the game screen, the score card, and the share image.
- **Grout grid.** 1px `--tile-line` grid behind cards. Sharp corners, 2px borders, near-zero border-radius, no soft shadows. Flat and printed, not glassy.
- **The reveal is the payoff.** Photo pushes up, the map animates the line from your pin to the truth, distance counts up, then a single fact card. Reveal should take ~1.8s and be skippable on tap. This animation is worth more polish time than any other screen.

### Voice

Singlish-adjacent, never cosplay. Aim for a dry local friend, not a tourism ad.

- Nailed it: `"Steady. 987 points."`
- Close: `"Same coffee shop uncle, different block."`
- Bad: `"You put the pin in Tuas. Tuas has 1 hawker centre. It is not this one."`
- Streak lost: `"17 days gone. Start again lor."`

Never write "lah" more than once per session. That's the line between charming and cringe.

### Share card (design this first — it's the growth engine)

Spoiler-free, WhatsApp-shaped, copy-pasteable text plus an image:

```
Hawker Guessr #142
🟥🟨🟩🟩⬜  3,847

East side specialist 🧭
Beat 82% of SG today

hawkerguessr.sg
```

Emoji per round by score band: 🟩 900+ · 🟨 500–899 · 🟥 200–499 · ⬜ under 200. It must reveal nothing — the entire Wordle mechanic is a spoiler-free brag.

---

## 7. Technical plan

You already have Next.js + Supabase + Vercel muscle memory from Marka. Use it. Drop FastAPI, drop Redis, drop S3 — none of them earn their keep at this size.

**Stack:** Next.js 16 (App Router) · Supabase (Postgres + Auth + Storage) · Vercel · Tailwind · MapLibre GL + OneMap tiles · PostHog.

MapLibre + OneMap over Google Maps: free, no billing key, and OneMap's basemap is *visually* Singaporean, which matters here.

### The one non-negotiable architectural rule

**Correct answers never reach the browser.**

```
GET  /api/daily          → rounds WITHOUT answers (photo url, type, options)
POST /api/daily/guess    → { roundId, lat, lng } → server scores it,
                            returns { points, distanceM, truth, fact }
```

Score one round at a time, server-side, persisted per user/session. If you ship answers in the payload "just for v1", the leaderboard is meaningless before launch week ends and you can never trust historical stats again.

### Schema

```sql
hawker_centres (
  id, name, name_zh, address, region,        -- region: N/S/E/W/C
  nearest_mrt, lat, lng, opened_year,
  postal_code, nea_id, blurb
)

stalls (
  id, centre_id → hawker_centres,
  name, name_zh, unit_number, dish_type,
  famous_for, michelin, still_operating, verified_at
)

questions (
  id, type,                                   -- PHOTO_LOCATION | DISH | PRICE | EXTERIOR
  centre_id, stall_id,
  image_path,                                 -- Supabase Storage
  answer_lat, answer_lng,                     -- for distance scoring
  answer_price_cents,                         -- PRICE only
  difficulty, reveal_fact, photo_credit,
  license, status                             -- draft | approved | retired
)

puzzles (id, publish_date UNIQUE, round_1..round_5 → questions)

plays (
  id, user_id NULL, anon_id, puzzle_id,
  round_scores int[], total, completed_at
)
-- unique (COALESCE(user_id::text, anon_id), puzzle_id)

profiles (
  user_id, handle, streak, longest_streak,
  centres_known jsonb,                        -- { centre_id: best_band }
  region_scores jsonb
)
```

RLS on everything. `questions.answer_*` readable only by the service role — enforce it in the database, not just in your route handlers.

### Anonymous play

Play without login, keyed on a first-party `anon_id` cookie. On sign-up, migrate that anon's plays into the account. Never gate round 1 behind auth — every auth wall before the first guess costs you most of the WhatsApp traffic that made you install it.

### Leaderboard

Daily only, not all-time (all-time leaderboards are unwinnable and demoralising by month 2). Materialised view refreshed every 5 min. Percentile ("top 12%") is shown to *everyone*; the top-100 board is a separate tab most people never open. Percentile is the number that goes in the share card, so it needs to be right.

---

## 8. Risks

| Risk | Severity | Handling |
|---|---|---|
| **Content runs dry** | Fatal | 300-question launch stock, non-negotiable. Track "days of runway" as the #1 dashboard metric. |
| Stall closes / price changes | High | `still_operating`, `verified_at`. Retire questions >18 months old. A wrong price shown as fact is the fastest way to lose credibility with the exact audience you need. |
| Photo rights | Medium | Own photos only for v1. Every non-own photo carries `license` + `photo_credit` and renders the credit visibly. |
| Someone's stall looks bad | Medium-High | Never rank stalls "worst". Never publish a photo of an empty stall as a "guess how dead this is" round. Honour takedown requests within 24h, no argument. Reputational damage here is unrecoverable in a community this small. |
| Reverse image search cheating | Low | Crop, strip EXIF, resize. Don't over-engineer — the cheaters are cheating a free daily quiz. |
| PDPA | Low-Medium | Blur faces of members of the public in interiors. Cookie/analytics notice. No email marketing without opt-in. |
| Uncles won't use it | Medium | Mobile web, no login, huge tap targets, `text-size-adjust`, works at 320px. |

---

## 9. Build plan

**Weeks 0–3 run in parallel with coding: shooting weekends.** They are the critical path, not the code.

| Week | Content | Build |
|---|---|---|
| **0** | Import data.gov.sg → `hawker_centres` (121 rows). Pick the 30 target centres. | Repo, Supabase, schema, deploy a "coming soon" page |
| **1** | Shoot 5 centres (~55 Q) | Map + pin-drop + distance scoring. **Build the reveal animation now** — it's the product's feel, prove it early |
| **2** | Shoot 5 centres (~110 Q) | 5-round daily flow, server-side scoring, anon play, admin question-entry form |
| **3** | Shoot 5 centres (~165 Q) | Score card + share image (OG + canvas PNG), streaks |
| **4** | Shoot 5 centres (~220 Q) | Auth, profile, the Hawker Map, region mastery |
| **5** | Shoot 5 centres (~275 Q) | Daily leaderboard, percentile, PostHog, polish |
| **6** | Shoot 5 centres (~330 Q) ✅ | **Soft launch**: 30 friends, 7 real days, fix what they hate |
| **7** | Buffer + fixes | **Public launch** — Reddit r/singapore, HardwareZone, a food IG account or two |

Ship-blockers: <250 questions · answers visible in the network tab · share card broken on WhatsApp · anything slower than 2s on 4G.

### Success metrics (be honest about the numbers)

| Metric | Week 1 | Week 4 | Verdict if missed |
|---|---|---|---|
| D1 retention | 30% | 40% | <25% → the loop isn't fun, more content won't save it |
| D7 retention | — | 20% | This is the real number. Wordle-likes live or die here |
| Share rate | 15% | 20% | <10% → the share card is the problem, not the game |
| Median completion | 80% | 85% | <60% → 5 rounds is too many, cut to 3 |
| Content runway | 60 days | 45 days | Never let it fall below 30 |

---

## 10. Open questions for you

1. **Can you commit 6 weekends of shooting?** Everything is downstream of this one answer.
2. **Domain** — `hawkerguessr.sg` (SGNIC, needs local presence) or `.com`?
3. **Rounds 5 or 3?** 5 is richer; 3 is a 60-second game you play in a lift. I lean 5 for launch, with the data ready to cut to 3.
4. **Do you want the Price mode as its own daily from day one?** It's the cheapest content and possibly the strongest hook — it could be *the* product rather than round 4.
