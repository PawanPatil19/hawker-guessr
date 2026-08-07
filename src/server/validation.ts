import type { Guess } from "@/domain/types";
import { SG_BOUNDS } from "@/domain/geo";
import { ROUNDS_PER_PUZZLE } from "@/domain/scoring";

/** Hand-rolled request parsing — one endpoint, two shapes, no schema library. */

export interface GuessRequest {
  day: string;
  roundIndex: number;
  guess: Guess;
}

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

const isFinite = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);

export function parseGuessRequest(body: unknown): ParseResult<GuessRequest> {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Body must be an object" };
  }
  const { day, roundIndex, guess } = body as Record<string, unknown>;

  if (typeof day !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    return { ok: false, error: "puzzle day required" };
  }

  if (
    !isFinite(roundIndex) ||
    !Number.isInteger(roundIndex) ||
    roundIndex < 0 ||
    roundIndex >= ROUNDS_PER_PUZZLE
  ) {
    return { ok: false, error: "roundIndex out of range" };
  }
  if (typeof guess !== "object" || guess === null) {
    return { ok: false, error: "guess required" };
  }

  const g = guess as Record<string, unknown>;

  if (g.kind === "LOCATION") {
    if (!isFinite(g.lat) || !isFinite(g.lng)) {
      return { ok: false, error: "lat/lng required" };
    }
    // Clamp rather than reject: a pin dragged just off the map edge is a
    // legitimate terrible guess, not a malformed request.
    const lat = Math.min(Math.max(g.lat, SG_BOUNDS.south - 0.5), SG_BOUNDS.north + 0.5);
    const lng = Math.min(Math.max(g.lng, SG_BOUNDS.west - 0.5), SG_BOUNDS.east + 0.5);
    return { ok: true, value: { day, roundIndex, guess: { kind: "LOCATION", lat, lng } } };
  }

  if (g.kind === "PRICE") {
    if (!isFinite(g.cents) || g.cents < 0 || g.cents > 100_000) {
      return { ok: false, error: "cents out of range" };
    }
    return {
      ok: true,
      value: { day, roundIndex, guess: { kind: "PRICE", cents: Math.round(g.cents) } },
    };
  }

  return { ok: false, error: "Unknown guess kind" };
}
