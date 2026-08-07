import { describe, expect, it } from "vitest";

import { SG_BOUNDS } from "@/domain/geo";
import { parseGuessRequest } from "./validation";

const valid = {
  day: "2026-08-08",
  roundIndex: 0,
  guess: { kind: "LOCATION", lat: 1.35, lng: 103.82 },
};

describe("guess request validation", () => {
  it("requires the puzzle day", () => {
    expect(parseGuessRequest({ ...valid, day: undefined })).toEqual({
      ok: false,
      error: "puzzle day required",
    });
  });

  it("rejects future round indexes", () => {
    expect(parseGuessRequest({ ...valid, roundIndex: 5 }).ok).toBe(false);
  });

  it("clamps coordinates to the playable area", () => {
    const parsed = parseGuessRequest({
      ...valid,
      guess: { kind: "LOCATION", lat: 90, lng: 180 },
    });
    expect(parsed.ok).toBe(true);
    if (parsed.ok && parsed.value.guess.kind === "LOCATION") {
      expect(parsed.value.guess.lat).toBe(SG_BOUNDS.north + 0.5);
      expect(parsed.value.guess.lng).toBe(SG_BOUNDS.east + 0.5);
    }
  });
});
