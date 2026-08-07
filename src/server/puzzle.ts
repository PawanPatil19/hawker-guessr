import "server-only";

import type { Question } from "@/domain/types";
import { ROUNDS_PER_PUZZLE } from "@/domain/scoring";
import { seededShuffle, seedFromString } from "@/domain/random";
import { playableImageQuestions } from "./repository/questions";

/**
 * Assembles the five image rounds for a given day. The explicit pool is a
 * content-version boundary: adding another authored question cannot silently
 * rewrite a puzzle somebody already played.
 */

export function questionsForDay(day: string): Question[] {
  const pool = seededShuffle(
    playableImageQuestions(),
    seedFromString(`hawker-guessr:${day}`),
  );

  if (pool.length < ROUNDS_PER_PUZZLE) {
    throw new Error(`Question bank needs at least ${ROUNDS_PER_PUZZLE} playable image rounds`);
  }

  for (const question of pool) {
    if (question.kind !== "LOCATION" || !question.image) {
      throw new Error(`${question.id} is not a playable image round`);
    }
  }
  return pool.slice(0, ROUNDS_PER_PUZZLE);
}

/** How many days of content remain before questions start repeating. */
export function runwayDays(): number {
  return Math.floor(playableImageQuestions().length / ROUNDS_PER_PUZZLE);
}
