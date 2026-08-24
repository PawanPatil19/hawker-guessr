import "server-only";

import type { Question } from "@/domain/types";
import { ROUNDS_PER_PUZZLE } from "@/domain/scoring";
import { requireQuestion } from "./repository/questions";

const DAY_MS = 24 * 60 * 60 * 1000;

interface PuzzleSchedule {
  /** First puzzle day governed by this immutable schedule version. */
  startsOn: string;
  /** One complete cycle, partitioned into consecutive five-round days. */
  questionIds: readonly string[];
}

/**
 * Published schedules are append-only. When more content is ready, add a new
 * version with a future startsOn date instead of editing an existing version.
 * That keeps completed puzzles and encrypted progress cookies reproducible.
 */
export const PUZZLE_SCHEDULES: readonly PuzzleSchedule[] = [
  {
    startsOn: "2026-08-01",
    questionIds: [
      "q-chong-pang-01",
      "q-changi-village-01",
      "q-amoy-01",
      "q-havelock-road-01",
      "q-holland-village-01",
      "q-maxwell-01",
      "q-old-airport-01",
      "q-chinatown-01",
      "q-tiong-bahru-01",
      "q-tekka-01",
      "q-golden-mile-01",
      "q-newton-01",
      "q-lau-pa-sat-01",
      "q-peoples-park-01",
      "q-berseh-01",
      "q-north-bridge-01",
      "q-whampoa-01",
      "q-zion-riverside-01",
      "q-haig-road-01",
      "q-bedok-interchange-01",
      "q-redhill-01",
      "q-tampines-round-01",
      "q-sembawang-hills-01",
      "q-kovan-01",
      "q-yuhua-village-01",
      "q-geylang-serai-01",
      "q-ghim-moh-01",
      "q-dunman-01",
      "q-adam-road-01",
      "q-hong-lim-01",
    ],
  },
] as const;

function dayOffset(day: string, startsOn: string): number {
  return Math.floor(
    (Date.parse(`${day}T00:00:00Z`) - Date.parse(`${startsOn}T00:00:00Z`)) / DAY_MS,
  );
}

function scheduleForDay(day: string): PuzzleSchedule {
  return PUZZLE_SCHEDULES
    .slice()
    .reverse()
    .find((schedule) => day >= schedule.startsOn) ?? PUZZLE_SCHEDULES[0];
}

function validateSchedules(): void {
  const starts = new Set<string>();
  for (const schedule of PUZZLE_SCHEDULES) {
    if (starts.has(schedule.startsOn)) {
      throw new Error(`Duplicate puzzle schedule start date: ${schedule.startsOn}`);
    }
    starts.add(schedule.startsOn);
    if (schedule.questionIds.length < ROUNDS_PER_PUZZLE ||
        schedule.questionIds.length % ROUNDS_PER_PUZZLE !== 0) {
      throw new Error(`Schedule ${schedule.startsOn} must contain complete five-round days`);
    }
    if (new Set(schedule.questionIds).size !== schedule.questionIds.length) {
      throw new Error(`Schedule ${schedule.startsOn} contains duplicate questions`);
    }
    for (const id of schedule.questionIds) {
      const question = requireQuestion(id);
      if (question.kind !== "LOCATION" || !question.image || !question.verified) {
        throw new Error(`${id} is not a playable image round`);
      }
    }
  }
}
validateSchedules();

/** Five stable rounds for the requested puzzle day. */
export function questionsForDay(day: string): Question[] {
  const schedule = scheduleForDay(day);
  const days = schedule.questionIds.length / ROUNDS_PER_PUZZLE;
  const cycleDay = ((dayOffset(day, schedule.startsOn) % days) + days) % days;
  const start = cycleDay * ROUNDS_PER_PUZZLE;
  return schedule.questionIds
    .slice(start, start + ROUNDS_PER_PUZZLE)
    .map(requireQuestion);
}

/** Number of non-repeating puzzle days in the active published schedule. */
export function runwayDays(day = PUZZLE_SCHEDULES.at(-1)?.startsOn ?? "2026-08-01"): number {
  return scheduleForDay(day).questionIds.length / ROUNDS_PER_PUZZLE;
}
