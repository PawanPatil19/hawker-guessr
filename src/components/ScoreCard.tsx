"use client";

import type { RoundResult } from "@/domain/types";
import { formatDistance } from "@/domain/geo";
import { MAX_PUZZLE_POINTS, bandFor, BAND_EMOJI } from "@/domain/scoring";
import { formatDelta } from "@/lib/money";
import { emojiGrid, strongestRegion } from "@/lib/share";
import { Countdown } from "./Countdown";
import { ShareButton } from "./ShareButton";

interface Props {
  puzzleNumber: number;
  results: RoundResult[];
  total: number;
  streak: number;
}

export function ScoreCard({ puzzleNumber, results, total, streak }: Props) {
  const region = strongestRegion(results);
  const ordered = [...results].sort((a, b) => a.index - b.index);

  return (
    <section className="score">
      <p className="score__label">Hawker Guessr #{puzzleNumber}</p>
      <p className="score__total">{total.toLocaleString()}</p>
      <p className="score__outof">out of {MAX_PUZZLE_POINTS.toLocaleString()}</p>
      <p className="score__grid" aria-label="Your spoiler-free result grid">
        {emojiGrid(results)}
      </p>

      <ol className="score__rounds">
        {ordered.map((r) => (
          <li key={r.index}>
            <span className="score__emoji">{BAND_EMOJI[bandFor(r.points)]}</span>
            <span className="score__where">{r.truth.centreName}</span>
            <span className="score__delta">
              {r.distanceM !== undefined
                ? formatDistance(r.distanceM)
                : formatDelta(r.offByCents ?? 0)}
            </span>
            <span className="score__pts">{r.points}</span>
          </li>
        ))}
      </ol>

      <div className="score__identity">
        {region && (
          <p className="score__region">
            You knew the <strong>{region}</strong> best today 🧭
          </p>
        )}
        <p className="score__streak">{streak} day streak 🔥</p>
      </div>

      <ShareButton puzzleNumber={puzzleNumber} results={results} total={total} />
      <p className="score__next">
        <Countdown />
      </p>
    </section>
  );
}
