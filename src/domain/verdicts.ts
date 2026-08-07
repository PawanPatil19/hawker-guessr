/**
 * The game's voice lives here and nowhere else. Dry local friend, not a
 * tourism ad. Rule from the design doc: "lah" at most once per session, so
 * it appears in exactly one string below.
 */
import { bandFor } from "./scoring";

function pick(lines: string[], seed: number): string {
  return lines[Math.abs(seed) % lines.length];
}

export function locationVerdict(points: number, seed: number): string {
  switch (bandFor(points)) {
    case "nailed":
      return pick(["Steady.", "Confirm you eat here.", "Spot on."], seed);
    case "close":
      return pick(
        [
          "Same coffee shop uncle, different block.",
          "Right neighbourhood, wrong queue.",
          "Almost. You walked past it.",
        ],
        seed,
      );
    case "off":
      return pick(
        [
          "You know the area. You don't know the food.",
          "Right side of the island, at least.",
          "That's a whole bus ride away.",
        ],
        seed,
      );
    default:
      return pick(
        [
          "That is not even the same MRT line.",
          "You could have walked there in a day. Barely.",
          "Bold guess. Wrong, but bold.",
        ],
        seed,
      );
  }
}

export function priceVerdict(guessCents: number, actualCents: number): string {
  const diff = guessCents - actualCents;
  const ratio = Math.abs(diff) / actualCents;
  if (ratio < 0.05) return "Exactly right. You buy this every week, don't you.";
  if (ratio < 0.2)
    return diff > 0 ? "Close, but it's cheaper than you think." : "Close. Slightly more than that now.";
  if (diff > 0) return "Not that expensive lah. Not yet.";
  return "Those prices died with the 2010s.";
}
