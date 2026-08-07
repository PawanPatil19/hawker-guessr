import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ value: "" }));

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => state.value ? { value: state.value } : undefined,
  }),
}));

import {
  appendGuess,
  readProgress,
  scoreProgress,
  setProgressCookie,
} from "./progressCookie";

// Regression: ISSUE-004 — deploys and server restarts erased a player's run.
// Found by /qa on 2026-08-08
// Report: .gstack/qa-reports/qa-report-hawker-guessr-vercel-app-2026-08-08.md
describe("encrypted progress cookie", () => {
  beforeEach(() => {
    state.value = "";
    vi.stubEnv("NODE_ENV", "test");
  });

  it("restores a scored round without storing the answer in the cookie", async () => {
    const empty = await readProgress("2026-08-08");
    const progress = appendGuess(empty, 0, {
      kind: "LOCATION",
      lat: 1.31,
      lng: 103.85,
    });
    const response = Object.assign(new Response(), {
      cookies: {
        set: ({ value }: { value: string }) => {
          state.value = value;
        },
      },
    });

    setProgressCookie(response, progress);

    expect(state.value).not.toContain("Maxwell");
    expect(state.value).not.toContain("1.31");
    const restored = await readProgress("2026-08-08");
    const results = scoreProgress(restored);
    expect(results).toHaveLength(1);
    expect(results[0].index).toBe(0);
    expect(results[0].guess).toEqual(progress.guesses[0].guess);
  });

  it("starts clean on a different puzzle day", async () => {
    state.value = "invalid-or-old-cookie";
    expect((await readProgress("2026-08-09")).guesses).toEqual([]);
  });
});
