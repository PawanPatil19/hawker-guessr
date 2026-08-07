import { describe, expect, it } from "vitest";

// Regression: ISSUE-010 — score squares used a misleading red result band
// Found by /qa on 2026-08-08
// Report: .gstack/qa-reports/qa-report-hawker-guessr-vercel-app-2026-08-08.md

import { BAND_EMOJI, bandFor } from "./scoring";

describe("result bands", () => {
  it("orders spoiler-free squares from strongest to weakest", () => {
    expect([950, 650, 300, 50].map((points) => BAND_EMOJI[bandFor(points)]))
      .toEqual(["🟩", "🟨", "🟧", "⬜"]);
  });

  it("awards green for a genuinely close result, not only a near-bullseye", () => {
    expect(bandFor(800)).toBe("nailed");
    expect(bandFor(799)).toBe("close");
  });
});
