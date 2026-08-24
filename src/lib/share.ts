import type { RoundResult } from "@/domain/types";
import { REGION_NAMES } from "@/domain/types";
import { BAND_EMOJI, MAX_PUZZLE_POINTS, bandFor } from "@/domain/scoring";

/**
 * The share text is the growth engine, so it obeys one rule: it gives away
 * nothing. Emoji bands only — your friend cannot reverse-engineer a single
 * answer from it.
 */

export function emojiGrid(results: RoundResult[]): string {
  return results
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((r) => BAND_EMOJI[bandFor(r.points)])
    .join("");
}

/** The region with the best average result today. */
export function strongestRegion(results: RoundResult[]): string | null {
  const totals = new Map<string, { points: number; rounds: number }>();
  for (const r of results) {
    if (r.distanceM === undefined) continue; // price rounds have no region
    const current = totals.get(r.truth.region) ?? { points: 0, rounds: 0 };
    totals.set(r.truth.region, {
      points: current.points + r.points,
      rounds: current.rounds + 1,
    });
  }
  const best = [...totals.entries()].sort(
    (a, b) => b[1].points / b[1].rounds - a[1].points / a[1].rounds,
  )[0];
  return best ? REGION_NAMES[best[0] as keyof typeof REGION_NAMES] : null;
}

export function buildShareText(
  puzzleNumber: number,
  results: RoundResult[],
  total: number,
  streak: number,
  origin: string,
): string {
  const region = strongestRegion(results);
  return [
    `Hawker Guessr #${puzzleNumber}`,
    "",
    `${emojiGrid(results)}  ${total.toLocaleString()} / ${MAX_PUZZLE_POINTS.toLocaleString()}`,
    "",
    region ? `Knew ${region} best today 🧭` : null,
    `${streak} day streak 🔥`,
    origin,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

/** Native share sheet where available, verified Clipboard API where permitted. */
export async function share(text: string): Promise<"shared" | "copied" | "manual"> {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ text });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") throw error;
    }
  }
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return "copied";
    } catch {
      // Older iOS and embedded browsers may expose but deny Clipboard API.
    }
  }
  // execCommand("copy") can report success while copying nothing. Present
  // selectable text instead of claiming an unverified copy succeeded.
  return "manual";
}
