import type { Guess, PublicPuzzle, RoundResult } from "@/domain/types";

/** Typed wrappers around the two endpoints. The only place fetch() appears. */

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export function fetchPuzzle(): Promise<PublicPuzzle> {
  return fetch("/api/puzzle", { cache: "no-store" }).then(json<PublicPuzzle>);
}

export function submitGuess(
  day: string,
  roundIndex: number,
  guess: Guess,
): Promise<RoundResult> {
  return fetch("/api/guess", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ day, roundIndex, guess }),
  }).then(json<RoundResult>);
}
