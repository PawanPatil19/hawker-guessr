"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { Guess, PublicPuzzle, RoundResult } from "@/domain/types";
import { ROUNDS_PER_PUZZLE } from "@/domain/scoring";
import { fetchPuzzle, submitGuess } from "@/lib/api";
import {
  acknowledgeReveal,
  recordCompletion,
  revealWasAcknowledged,
} from "@/lib/storage";

export type Phase = "loading" | "error" | "guessing" | "reveal" | "done";

export interface Game {
  phase: Phase;
  puzzle: PublicPuzzle | null;
  results: RoundResult[];
  /** Index of the round awaiting a guess. */
  roundIndex: number;
  /** Result being revealed, if any. */
  reveal: RoundResult | null;
  total: number;
  streak: number;
  error: string | null;
  submitting: boolean;
  guess: (guess: Guess) => Promise<void>;
  next: () => void;
}

/**
 * The whole client-side game. Deliberately one hook: the flow is small and
 * linear, and a reducer here would be ceremony. Components stay presentational.
 */
export function useGame(): Game {
  const [puzzle, setPuzzle] = useState<PublicPuzzle | null>(null);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [reveal, setReveal] = useState<RoundResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchPuzzle()
      .then((p) => {
        if (cancelled) return;
        if (p.results.length >= ROUNDS_PER_PUZZLE) {
          setStreak(recordCompletion(p.day).current);
        }
        setPuzzle(p);
        setResults(p.results);
        const lastResult = p.results.at(-1);
        if (
          lastResult &&
          !revealWasAcknowledged(p.day, lastResult.index)
        ) {
          setReveal(lastResult);
        }
      })
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, []);

  const playedIndexes = new Set(results.map((result) => result.index));
  const roundIndex = Array.from(
    { length: ROUNDS_PER_PUZZLE },
    (_, index) => index,
  ).find((index) => !playedIndexes.has(index)) ?? ROUNDS_PER_PUZZLE;
  const finished = roundIndex >= ROUNDS_PER_PUZZLE;

  const guess = useCallback(
    async (g: Guess) => {
      if (!puzzle || submitting || finished) return;
      setSubmitting(true);
      setError(null);
      try {
        const result = await submitGuess(puzzle.day, roundIndex, g);
        setResults((prev) =>
          prev.some((r) => r.index === result.index) ? prev : [...prev, result],
        );
        setReveal(result);
        if (roundIndex + 1 >= ROUNDS_PER_PUZZLE) {
          setStreak(recordCompletion(puzzle.day).current);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setSubmitting(false);
      }
    },
    [puzzle, roundIndex, submitting, finished],
  );

  const next = useCallback(() => {
    if (puzzle && reveal) acknowledgeReveal(puzzle.day, reveal.index);
    setReveal(null);
  }, [puzzle, reveal]);

  const total = useMemo(
    () => results.reduce((sum, r) => sum + r.points, 0),
    [results],
  );

  const phase: Phase = error && !puzzle
    ? "error"
    : !puzzle
      ? "loading"
      : reveal
        ? "reveal"
        : finished
          ? "done"
          : "guessing";

  return {
    phase,
    puzzle,
    results,
    roundIndex,
    reveal,
    total,
    streak,
    error,
    submitting,
    guess,
    next,
  };
}
