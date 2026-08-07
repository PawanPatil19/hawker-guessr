import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { questionsForDay, runwayDays } from "./puzzle";
import { playableImageQuestions, toPublicRound } from "./repository/questions";

describe("image-only daily puzzle", () => {
  it("has exactly 30 unique playable photos across 30 centres", () => {
    const bank = playableImageQuestions();

    expect(bank).toHaveLength(30);
    expect(new Set(bank.map((question) => question.image)).size).toBe(30);
    expect(new Set(bank.map((question) => question.centreId)).size).toBe(30);
  });

  it("always returns five unique, attributed location photos", () => {
    for (const day of ["2026-08-01", "2026-08-08", "2026-09-01"]) {
      const questions = questionsForDay(day);
      expect(questions).toHaveLength(5);
      expect(new Set(questions.map((question) => question.id)).size).toBe(5);
      for (const question of questions) {
        expect(question.kind).toBe("LOCATION");
        expect(question.image).toMatch(/^\/hawkers\/photo-\d{2}(?:-blurred)?\.jpg$/);
        expect(question.imageCredit).toBeTruthy();
        expect(question.imageSourceUrl).toMatch(/^https:\/\/commons\.wikimedia\.org\//);
        expect(["CC BY-SA 4.0", "CC BY 4.0", "CC BY 2.5"]).toContain(
          question.imageLicense,
        );
      }
    }
  });

  it("randomizes order by day while remaining stable for every player", () => {
    const augustEighth = questionsForDay("2026-08-08").map((question) => question.id);
    const sameDayRefresh = questionsForDay("2026-08-08").map((question) => question.id);
    const followingDay = questionsForDay("2026-08-09").map((question) => question.id);

    expect(sameDayRefresh).toEqual(augustEighth);
    expect(followingDay).not.toEqual(augustEighth);
  });

  it("reports the current six-day content runway", () => {
    expect(runwayDays()).toBe(6);
  });

  it("does not expose clues or photo provenance before the reveal", () => {
    const publicRound = toPublicRound(questionsForDay("2026-08-08")[0], 0);
    expect(publicRound).not.toHaveProperty("clues");
    expect(publicRound).not.toHaveProperty("imageCredit");
    expect(publicRound).not.toHaveProperty("imageSourceUrl");
    expect(publicRound).not.toHaveProperty("imageLicense");
  });
});
