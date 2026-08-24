"use client";

import { useState } from "react";

import type { PublicRound } from "@/domain/types";

interface Props {
  round: PublicRound;
}

/**
 * The prompt. Renders the photo when there is one, and falls back to text
 * clues when there isn't — which is every question until the shooting
 * weekends happen. Same component either way, so photos drop in with no code
 * change: set `image` in content/questions.json.
 */
export function ClueCard({ round }: Props) {
  const [attempt, setAttempt] = useState(0);
  const imageFailed = attempt >= 2;
  const source = round.image
    ? `${round.image}${attempt ? `?retry=${attempt}` : ""}`
    : null;

  return (
    <section className="clue">
      {source && !imageFailed ? (
        <div className="clue__photo-frame">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="clue__photo"
            src={source}
            alt="A Singapore hawker centre. Guess where it is."
            onError={() => setAttempt((current) => current + 1)}
          />
          {round.redactions && round.redactions.length > 0 && (
            <svg
              className="clue__redactions"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <defs>
                <filter id={`answer-blur-${round.index}`} x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.4" />
                </filter>
                {round.redactions.map((redaction, index) => (
                  <clipPath id={`answer-clip-${round.index}-${index}`} key={index}>
                    <rect {...redaction} />
                  </clipPath>
                ))}
              </defs>
              {round.redactions.map((_, index) => (
                <image
                  key={index}
                  href={source}
                  x="0"
                  y="0"
                  width="100"
                  height="100"
                  preserveAspectRatio="xMidYMid slice"
                  filter={`url(#answer-blur-${round.index})`}
                  clipPath={`url(#answer-clip-${round.index}-${index})`}
                />
              ))}
            </svg>
          )}
        </div>
      ) : (
        <div className="clue__error" role="alert">
          <p>Photo could not load.</p>
          <button className="btn" type="button" onClick={() => setAttempt(0)}>
            Retry photo
          </button>
        </div>
      )}
      <p className="clue__prompt">{round.prompt}</p>
    </section>
  );
}
