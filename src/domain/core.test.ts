import { describe, expect, it } from "vitest";

import { formatCountdown, msUntilNextDrop, puzzleDay } from "./calendar";
import { scoreLocation } from "./scoring";

describe("daily calendar", () => {
  it("changes puzzle day exactly at 06:00 SGT", () => {
    expect(puzzleDay(new Date("2026-08-07T21:59:59.999Z"))).toBe("2026-08-07");
    expect(puzzleDay(new Date("2026-08-07T22:00:00.000Z"))).toBe("2026-08-08");
  });

  it("counts down to the next drop", () => {
    const now = new Date("2026-08-07T21:00:00.000Z");
    expect(msUntilNextDrop(now)).toBe(60 * 60 * 1000);
    expect(formatCountdown(msUntilNextDrop(now))).toBe("01:00:00");
  });
});

describe("location scoring", () => {
  it.each([
    [0, 1000],
    [1000, 635],
    [10_000, 11],
  ])("scores %i metres as %i points", (distance, points) => {
    expect(scoreLocation(distance)).toBe(points);
  });

  it("decreases as distance grows", () => {
    expect(scoreLocation(500)).toBeGreaterThan(scoreLocation(2500));
  });
});
