"use client";

import type { RoundResult } from "@/domain/types";
import { REGION_NAMES } from "@/domain/types";
import { formatDistance } from "@/domain/geo";
import { BAND_LABEL, bandFor } from "@/domain/scoring";
import { formatCents, formatDelta } from "@/lib/money";
import { RevealMap } from "./map/RevealMap";

interface Props {
  result: RoundResult;
  isLast: boolean;
  onNext: () => void;
}

/** The payoff. Distance, truth, one fact worth repeating. */
export function RevealPanel({ result, isLast, onNext }: Props) {
  const isLocation = result.guess.kind === "LOCATION";

  return (
    <section className="reveal">
      {isLocation && result.guess.kind === "LOCATION" && (
        <RevealMap guess={result.guess} truth={result.truth} />
      )}

      <div className="reveal__body">
        <p className="reveal__verdict">{result.verdict}</p>
        {isLocation && (
          <p className="reveal__scoreline">
            {formatDistance(result.distanceM ?? 0)} off · {result.points} pts
          </p>
        )}
        <h2 className="reveal__name">{result.truth.centreName}</h2>
        {result.truth.stall && (
          <p className="reveal__stall">{result.truth.stall}</p>
        )}

        <dl className="reveal__stats">
          {isLocation ? (
            <>
              <div>
                <dt>Off by</dt>
                <dd>{formatDistance(result.distanceM ?? 0)}</dd>
              </div>
              <div>
                <dt>Region</dt>
                <dd>{REGION_NAMES[result.truth.region]}</dd>
              </div>
            </>
          ) : (
            <>
              <div>
                <dt>Actual</dt>
                <dd>{formatCents(result.truth.priceCents ?? 0)}</dd>
              </div>
              <div>
                <dt>You were</dt>
                <dd>{formatDelta(result.offByCents ?? 0)}</dd>
              </div>
            </>
          )}
          <div>
            <dt>{BAND_LABEL[bandFor(result.points)]}</dt>
            <dd className="reveal__points">{result.points}</dd>
          </div>
        </dl>

        <p className="reveal__fact">{result.fact}</p>
        {result.imageAttribution && (
          <p className="reveal__credit">
            Photo: {result.imageAttribution.credit} ·{" "}
            <a href={result.imageAttribution.sourceUrl} target="_blank" rel="noreferrer">
              {result.imageAttribution.license}
            </a>
          </p>
        )}

        <button className="btn" type="button" onClick={onNext}>
          {isLast ? "See your score" : "Next round →"}
        </button>
      </div>
    </section>
  );
}
