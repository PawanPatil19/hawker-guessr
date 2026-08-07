/**
 * Scoring. Pure functions, no I/O — this file is the thing to unit-test and
 * the thing to tune when the game feels wrong.
 */

export const MAX_ROUND_POINTS = 1000;
export const ROUNDS_PER_PUZZLE = 5;
export const MAX_PUZZLE_POINTS = MAX_ROUND_POINTS * ROUNDS_PER_PUZZLE;

/**
 * Distance decay constant, in metres.
 *
 * Tuned so "right neighbourhood" pays well and "right region" doesn't:
 *   0 m → 1000 · 1 km → 635 · 2.2 km → 368 · 5 km → 104 · 10 km → 11
 * Singapore is ~50 km wide, so a wild guess is worth ~nothing, which is the
 * point — the map should teach you, not hand out consolation prizes.
 */
export const DISTANCE_DECAY_M = 2200;

export function scoreLocation(distanceM: number): number {
  return Math.round(MAX_ROUND_POINTS * Math.exp(-distanceM / DISTANCE_DECAY_M));
}

/**
 * Price is scored on *proportional* error, not absolute: being 50c off on a
 * $3 kopi should hurt more than being 50c off on a $12 crab bee hoon.
 */
export function scorePrice(guessCents: number, actualCents: number): number {
  if (actualCents <= 0) return 0;
  const error = Math.abs(guessCents - actualCents) / actualCents;
  return Math.round(MAX_ROUND_POINTS * Math.max(0, 1 - error));
}

export type Band = "nailed" | "close" | "off" | "lost";

export function bandFor(points: number): Band {
  if (points >= 800) return "nailed";
  if (points >= 500) return "close";
  if (points >= 200) return "off";
  return "lost";
}

export const BAND_EMOJI: Record<Band, string> = {
  nailed: "🟩",
  close: "🟨",
  off: "🟧",
  lost: "⬜",
};

export const BAND_LABEL: Record<Band, string> = {
  nailed: "Steady",
  close: "Close",
  off: "Off",
  lost: "Jialat",
};
