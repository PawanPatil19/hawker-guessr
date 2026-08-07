/**
 * Puzzle days, in Singapore time.
 *
 * The daily drops at 06:00 SGT, not midnight — the puzzle should be live for
 * the commute and settled before the lunch group chat starts. So a "puzzle
 * day" runs 06:00 → 05:59 the next morning.
 */

export const DROP_HOUR_SGT = 6;
const SGT_OFFSET_MS = 8 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Puzzle #1 was this day. Changing it renumbers every puzzle — don't. */
export const EPOCH_PUZZLE_DAY = "2026-08-01";

/** The puzzle day (YYYY-MM-DD) that `now` falls inside. */
export function puzzleDay(now: Date = new Date()): string {
  const shifted = new Date(
    now.getTime() + SGT_OFFSET_MS - DROP_HOUR_SGT * 60 * 60 * 1000,
  );
  return shifted.toISOString().slice(0, 10);
}

/** 1-based puzzle number, counting from EPOCH_PUZZLE_DAY. */
export function puzzleNumber(day: string): number {
  const days = Math.round(
    (Date.parse(`${day}T00:00:00Z`) - Date.parse(`${EPOCH_PUZZLE_DAY}T00:00:00Z`)) /
      DAY_MS,
  );
  return days + 1;
}

/** Milliseconds until the next 06:00 SGT drop. */
export function msUntilNextDrop(now: Date = new Date()): number {
  const currentDay = puzzleDay(now);
  const nextDropUtc =
    Date.parse(`${currentDay}T00:00:00Z`) +
    DAY_MS +
    DROP_HOUR_SGT * 60 * 60 * 1000 -
    SGT_OFFSET_MS;
  return Math.max(0, nextDropUtc - now.getTime());
}

export function formatCountdown(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}
