import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

import type { Guess, RoundResult } from "@/domain/types";
import { questionsForDay } from "@/server/puzzle";
import { scoreRound } from "@/server/services/scoreRound";

const COOKIE = "hg_progress_v1";
const MAX_AGE = 60 * 60 * 48;

interface StoredGuess {
  index: number;
  guess: Guess;
}

export interface Progress {
  day: string;
  guesses: StoredGuess[];
}

function key(): Buffer {
  const secret = process.env.PLAY_COOKIE_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("PLAY_COOKIE_SECRET is required in production");
  }
  return createHash("sha256")
    .update(secret ?? "hawker-guessr-local-development")
    .digest();
}

function seal(progress: Progress): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(progress), "utf8"),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}

function open(value: string | undefined, day: string): Progress {
  if (!value) return { day, guesses: [] };
  try {
    const payload = Buffer.from(value, "base64url");
    const decipher = createDecipheriv("aes-256-gcm", key(), payload.subarray(0, 12));
    decipher.setAuthTag(payload.subarray(12, 28));
    const decoded = JSON.parse(
      Buffer.concat([
        decipher.update(payload.subarray(28)),
        decipher.final(),
      ]).toString("utf8"),
    ) as Progress;
    if (decoded.day !== day || !Array.isArray(decoded.guesses)) {
      return { day, guesses: [] };
    }
    return decoded;
  } catch {
    return { day, guesses: [] };
  }
}

export async function readProgress(day: string): Promise<Progress> {
  const jar = await cookies();
  return open(jar.get(COOKIE)?.value, day);
}

export function scoreProgress(progress: Progress): RoundResult[] {
  const questions = questionsForDay(progress.day);
  return progress.guesses
    .slice()
    .sort((a, b) => a.index - b.index)
    .flatMap(({ index, guess }) => {
      const question = questions[index];
      return question ? [scoreRound(question, index, guess)] : [];
    });
}

export function appendGuess(progress: Progress, index: number, guess: Guess): Progress {
  if (progress.guesses.some((entry) => entry.index === index)) return progress;
  return {
    ...progress,
    guesses: [...progress.guesses, { index, guess }].sort((a, b) => a.index - b.index),
  };
}

export function progressFromResults(day: string, results: RoundResult[]): Progress {
  return {
    day,
    guesses: results
      .map((result) => ({ index: result.index, guess: result.guess }))
      .sort((a, b) => a.index - b.index),
  };
}

export function setProgressCookie(response: Response, progress: Progress): void {
  if (!(response instanceof Response) || !("cookies" in response)) return;
  const nextResponse = response as Response & {
    cookies: { set: (options: Record<string, unknown>) => void };
  };
  nextResponse.cookies.set({
    name: COOKIE,
    value: seal(progress),
    maxAge: MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}
