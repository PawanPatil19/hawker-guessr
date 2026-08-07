"use client";

import { useCallback, useEffect, useRef } from "react";

import type { LatLng } from "@/domain/types";
import { ROUNDS_PER_PUZZLE } from "@/domain/scoring";
import { useGame } from "@/hooks/useGame";
import { ClueCard } from "./ClueCard";
import { LocationRound } from "./LocationRound";
import { RevealPanel } from "./RevealPanel";
import { RoundTiles } from "./RoundTiles";
import { ScoreCard } from "./ScoreCard";

/**
 * Wires the game hook to the screens. Holds no state of its own — every
 * component below is presentational, every decision lives in useGame.
 */
export function Game() {
  const game = useGame();
  const { guess } = game;
  const top = useRef<HTMLDivElement>(null);
  const previousScreen = useRef("");

  const onLocation = useCallback(
    (point: LatLng) => void guess({ kind: "LOCATION", ...point }),
    [guess],
  );

  const screen = `${game.phase}:${game.roundIndex}`;
  useEffect(() => {
    if (previousScreen.current && previousScreen.current !== screen) {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      top.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
      top.current?.focus({ preventScroll: true });
    }
    previousScreen.current = screen;
  }, [screen]);

  if (game.phase === "loading") {
    return <p className="status">Warming the wok…</p>;
  }

  if (game.phase === "error" || !game.puzzle) {
    return <p className="status status--error">{game.error ?? "Kitchen closed."}</p>;
  }

  const round = game.puzzle.rounds[game.roundIndex];

  return (
    <div className="game" ref={top} tabIndex={-1}>
      <header className="game__bar">
        <div className="game__identity">
          <h1 className="wordmark">
            Hawker Guessr <span aria-hidden>🇸🇬</span>
          </h1>
          <span className="game__number">Daily puzzle #{game.puzzle.number}</span>
        </div>
        <RoundTiles results={game.results} current={game.roundIndex} />
      </header>

      {game.phase === "reveal" && game.reveal && (
        <RevealPanel
          result={game.reveal}
          isLast={game.results.length >= ROUNDS_PER_PUZZLE}
          onNext={game.next}
        />
      )}

      {game.phase === "guessing" && round && (
        <div className="guess-layout">
          <ClueCard round={round} />
          <LocationRound
            key={round.index}
            disabled={game.submitting}
            error={game.error}
            onSubmit={onLocation}
          />
        </div>
      )}

      {game.phase === "done" && (
        <ScoreCard
          puzzleNumber={game.puzzle.number}
          results={game.results}
          total={game.total}
          streak={game.streak}
        />
      )}

      {game.error && game.phase !== "guessing" && (
        <p className="status status--error" role="alert">{game.error}</p>
      )}
    </div>
  );
}
