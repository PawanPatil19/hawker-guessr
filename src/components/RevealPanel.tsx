"use client";

import { useEffect, useRef } from "react";
import type { RoundResult } from "@/domain/types";
import { REGION_NAMES } from "@/domain/types";
import { formatDistance } from "@/domain/geo";
import { BAND_LABEL, bandFor } from "@/domain/scoring";
import { formatCents, formatDelta } from "@/lib/money";
import { RevealMap } from "./map/RevealMap";

interface Props {
  result: RoundResult;
  isLast: boolean;
  image: string | null;
  onNext: () => void;
}

/** The payoff. Distance, truth, one fact worth repeating. */
export function RevealPanel({ result, isLast, image, onNext }: Props) {
  const isLocation = result.guess.kind === "LOCATION";
  const region = useRef<HTMLElement>(null);

  useEffect(() => {
    region.current?.focus({ preventScroll: true });
  }, [result.index]);

  return (
    <section
      className="reveal"
      ref={region}
      tabIndex={-1}
      role="status"
      aria-live="polite"
      aria-label={`Round ${result.index + 1} result: ${result.points} points. ${result.truth.centreName}.`}
    >
      <div className="reveal__media">
        {image && (
          // The source is authored content rather than a build-time import.
          // eslint-disable-next-line @next/next/no-img-element
          <img className="reveal__photo" src={image} alt="The hawker centre clue you just guessed" />
        )}
        {isLocation && result.guess.kind === "LOCATION" && (
          <RevealMap guess={result.guess} truth={result.truth} />
        )}
      </div>

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
              Source
            </a>{" "}
            ·{" "}
            <a href={result.imageAttribution.licenseUrl} target="_blank" rel="noreferrer">
              {result.imageAttribution.license}
            </a>{" "}
            · {result.imageAttribution.changes}
          </p>
        )}

        <button className="btn" type="button" onClick={onNext}>
          {isLast ? "See your score" : "Next round →"}
        </button>
      </div>
    </section>
  );
}
