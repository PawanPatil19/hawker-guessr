import { describe, expect, it } from "vitest";

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
