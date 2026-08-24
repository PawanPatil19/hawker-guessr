import "server-only";

import questionsJson from "@content/questions.json";
import type { PublicRound, Question } from "@/domain/types";
import { findCentre } from "./centres";

/**
 * THE ANSWER LIVES HERE AND NEVER LEAVES.
 *
 * `server-only` makes importing this from a client component a build error.
 * The only way question data reaches the browser is through `toPublicRound`,
 * which is an explicit allow-list — add a field to Question and it stays
 * server-side until someone deliberately adds it below.
 */
const questions = questionsJson as Question[];

const byId = new Map(questions.map((q) => [q.id, q]));

/** Fails loudly at boot if content references a centre that doesn't exist. */
function validate(): void {
  const problems: string[] = [];
  const ids = new Set<string>();
  for (const q of questions) {
    if (ids.has(q.id)) {
      problems.push(`${q.id} → duplicate question id`);
    }
    ids.add(q.id);
    if (!findCentre(q.centreId)) {
      problems.push(`${q.id} → unknown centreId "${q.centreId}"`);
    }
    if (!["LOCATION", "PRICE"].includes(q.kind)) {
      problems.push(`${q.id} → invalid question kind`);
    }
    if (![1, 2, 3].includes(q.difficulty)) {
      problems.push(`${q.id} → difficulty must be 1, 2, or 3`);
    }
    if (typeof q.verified !== "boolean") {
      problems.push(`${q.id} → verified must be a boolean`);
    }
    if (q.kind === "PRICE" && !q.answerPriceCents) {
      problems.push(`${q.id} → PRICE question with no answerPriceCents`);
    }
    if (q.image && (!q.imageCredit || !q.imageSourceUrl || !q.imageLicense)) {
      problems.push(`${q.id} → image question missing attribution or licence`);
    }
    for (const redaction of q.redactions ?? []) {
      const values = [redaction.x, redaction.y, redaction.width, redaction.height];
      if (
        values.some((value) => !Number.isFinite(value)) ||
        redaction.x < 0 ||
        redaction.y < 0 ||
        redaction.width <= 0 ||
        redaction.height <= 0 ||
        redaction.x + redaction.width > 100 ||
        redaction.y + redaction.height > 100
      ) {
        problems.push(`${q.id} → invalid answer-sign redaction bounds`);
      }
    }
  }
  if (problems.length) {
    throw new Error("Bad question content:\n  " + problems.join("\n  "));
  }
}
validate();

export function allQuestions(): Question[] {
  return questions;
}

/** Verified, attributed photo rounds eligible for the daily game. */
export function playableImageQuestions(): Question[] {
  return questions.filter(
    (question) => question.kind === "LOCATION" && Boolean(question.image) && question.verified,
  );
}

export function requireQuestion(id: string): Question {
  const q = byId.get(id);
  if (!q) throw new Error(`Unknown question id: ${id}`);
  return q;
}

/** Count of questions still carrying seed prices nobody has checked. */
export function unverifiedCount(): number {
  return questions.filter((q) => !q.verified).length;
}

/** Strip every answer field. This is the only path to the client. */
export function toPublicRound(q: Question, index: number): PublicRound {
  return {
    index,
    kind: q.kind,
    image: q.image,
    prompt: q.prompt,
    difficulty: q.difficulty,
    redactions: q.redactions,
  };
}
