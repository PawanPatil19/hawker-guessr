import { ROUNDS_PER_PUZZLE, bandFor, type Band } from "@/domain/scoring";
import type { RoundResult } from "@/domain/types";

interface Props {
  results: RoundResult[];
  current: number;
}

const BAND_CLASS: Record<Band, string> = {
  nailed: "tile--nailed",
  close: "tile--close",
  off: "tile--off",
  lost: "tile--lost",
};

/** A quiet five-step progress rail. */
export function RoundTiles({ results, current }: Props) {
  const byIndex = new Map(results.map((r) => [r.index, r]));

  return (
    <ol className="tiles" aria-label="Round progress">
      {Array.from({ length: ROUNDS_PER_PUZZLE }, (_, i) => {
        const result = byIndex.get(i);
        const className = result
          ? `tile ${BAND_CLASS[bandFor(result.points)]}`
          : i === current
            ? "tile tile--current"
            : "tile";
        const state = result ? "complete" : i === current ? "current" : "upcoming";
        return <li key={i} className={className} aria-label={`Round ${i + 1}, ${state}`} />;
      })}
    </ol>
  );
}
