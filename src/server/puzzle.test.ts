import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { PUZZLE_SCHEDULES, questionsForDay, runwayDays } from "./puzzle";
import { playableImageQuestions, toPublicRound } from "./repository/questions";

function isoDay(offset: number): string {
  return new Date(Date.parse("2026-08-01T00:00:00Z") + offset * 86_400_000)
    .toISOString()
    .slice(0, 10);
}

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

  it("keeps every published day stable and content-versioned", () => {
    const first = questionsForDay("2026-08-24").map((question) => question.id);
    const refreshed = questionsForDay("2026-08-24").map((question) => question.id);

    expect(refreshed).toEqual(first);
    expect(first).toEqual(PUZZLE_SCHEDULES[0].questionIds.slice(25, 30));
  });

  it("uses every scheduled question exactly once per runway cycle", () => {
    const days = Array.from({ length: runwayDays() }, (_, index) =>
      questionsForDay(isoDay(index)).map((question) => question.id),
    );
    const flattened = days.flat();

    expect(new Set(flattened).size).toBe(flattened.length);
    expect(new Set(flattened)).toEqual(new Set(PUZZLE_SCHEDULES[0].questionIds));
    for (let index = 1; index < days.length; index += 1) {
      expect(days[index].some((id) => days[index - 1].includes(id))).toBe(false);
    }
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
