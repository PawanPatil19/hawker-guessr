import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { RoundResult } from "@/domain/types";
import { MemoryPlayStore } from "./memory";

function result(points: number): RoundResult {
  return {
    index: 0,
    points,
    distanceM: points,
    guess: { kind: "LOCATION", lat: 1.3 + points / 100_000, lng: 103.8 },
    truth: { centreName: "Test", region: "C", lat: 1.3, lng: 103.8 },
    fact: "Test fact",
    verdict: "Test verdict",
  };
}

describe("memory play store", () => {
  it("returns one canonical result for concurrent same-round submissions", async () => {
    const store = new MemoryPlayStore();
    const [first, second] = await Promise.all([
      store.append("player", "2026-08-25", result(100)),
      store.append("player", "2026-08-25", result(900)),
    ]);

    expect(first).toEqual(second);
    expect(await store.get("player", "2026-08-25")).toEqual([first]);
  });
});
