# Design System — Hawker Guessr

## Product Context

- **What this is:** A daily image-first game for guessing Singapore hawker centres by location.
- **Who it is for:** Singapore residents, former residents, and food-curious visitors.
- **Project type:** Mobile-first daily web game.
- **Memorable thing:** It should feel like opening a quiet handwritten note about lunch in Singapore.

## Aesthetic Direction

- **Direction:** Quiet editorial minimalism.
- **Decoration:** Minimal. Typography, photography, and fine rules carry the interface.
- **Mood:** Warm paper, restrained ink, and a small amount of oxblood red. Never nostalgic kitsch or café branding.

## Typography

- **Display and entrance:** Cormorant Garamond, light italic for the opening and medium roman for reveal headings.
- **Body:** Source Sans 3 for readable instructions and facts.
- **Labels and data:** IBM Plex Mono for scores, round numbers, buttons, and utility text.
- **Loading:** Self-hosted automatically through `next/font`.

## Color

- **Canvas:** `#EFE7D6`
- **Raised paper:** `#F7F1E5`
- **Primary ink:** `#2B261F`
- **Muted ink:** `#766D60`
- **Oxblood action:** `#913F33`
- **Pandan success:** `#546851`
- **Kaya highlight:** `#C89B43`
- **Fine rule:** `#CFC3AD`

## Spacing and Layout

- **Base unit:** 4px.
- **Density:** Comfortable and sparse around copy; compact around the map and scoring data.
- **Layout:** A focused single column on phones and a photo/map split workspace from tablet width upward, within a 1040px canvas.
- **Surfaces:** Photography and maps are the only elevated, rounded surfaces. Results and supporting copy sit directly on the page.
- **Progress:** A quiet five-segment rail replaces numbered tiles so status is visible without competing with the image.
- **Phone ergonomics:** Controls are at least 44px tall, primary actions float near the map edge, and safe-area padding protects bottom controls.

## Motion

- **Approach:** Intentional but brief.
- **Entrance:** Character-by-character italic line, under four seconds, immediately skippable, once per browser tab.
- **Game transitions:** Soft scroll anchoring only.
- **Accessibility:** `prefers-reduced-motion` removes character and entrance animation.

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-08-08 | Adopt quiet beige editorial direction | The user requested a beige minimal interface with a light cursive typewriter entrance. |
| 2026-08-08 | Replace the stacked-card layout with a responsive photo-led workspace | The original 560px bordered stack felt blocky on phones and wasted desktop space. |
