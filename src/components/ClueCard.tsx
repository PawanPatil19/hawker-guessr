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
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <section className="clue">
      {round.image && !imageFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="clue__photo"
          src={round.image}
          alt="A Singapore hawker centre. Guess where it is."
          onError={() => setImageFailed(true)}
        />
      ) : (
        <p className="clue__error" role="alert">
          Photo could not load. Refresh to try again.
        </p>
      )}
      <p className="clue__prompt">{round.prompt}</p>
    </section>
  );
}
