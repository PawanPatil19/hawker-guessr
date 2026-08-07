import { describe, expect, it } from "vitest";

// Regression: ISSUE-007 — share cards omitted score context and streak
// Found by /qa on 2026-08-08
// Report: .gstack/qa-reports/qa-report-hawker-guessr-vercel-app-2026-08-08.md

import type { RoundResult } from "@/domain/types";
import { buildShareText } from "./share";

describe("spoiler-free share card", () => {
  it("includes score context and streak without leaking an answer", () => {
    const result = {
      index: 0,
      points: 820,
      distanceM: 430,
      guess: { kind: "LOCATION", lat: 1.35, lng: 103.9 },
      truth: {
        region: "E",
        centreName: "Secret Centre",
        lat: 1.36,
        lng: 103.91,
      },
      fact: "A fact",
      verdict: "Steady.",
    } satisfies RoundResult;

    const text = buildShareText(12, [result], 820, 3, "https://example.com");

    expect(text).toContain("🟩  820 / 5,000");
    expect(text).toContain("3 day streak 🔥");
    expect(text).not.toContain("Secret Centre");
  });
});
