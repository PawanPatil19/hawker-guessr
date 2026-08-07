"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";

import type { LatLng } from "@/domain/types";

// MapLibre touches `window` at import time, so it never renders on the server.
const GuessMap = dynamic(
  () => import("./map/GuessMap").then((m) => m.GuessMap),
  { ssr: false, loading: () => <div className="map map--placeholder" /> },
);

interface Props {
  disabled?: boolean;
  error?: string | null;
  onSubmit: (point: LatLng) => void;
}

/**
 * Pin-drop round. Owns the un-submitted pin so the player can move it before
 * committing — tapping the map must never score you by accident.
 */
export function LocationRound({ disabled, error, onSubmit }: Props) {
  const [pending, setPending] = useState<LatLng | null>(null);

  const onPick = useCallback((point: LatLng) => setPending(point), []);

  return (
    <section className="location-round" aria-label="Place your guess">
      <GuessMap onPick={onPick} disabled={disabled} />
      <div className="round-controls">
        <button
          className="btn"
          type="button"
          disabled={!pending || disabled}
          onClick={() => pending && onSubmit(pending)}
        >
          {disabled ? "Scoring…" : pending ? "Lock in guess" : "Tap the map first"}
        </button>
        {error ? (
          <p className="hint status--error" role="alert">{error} Try again.</p>
        ) : (
          <p className="hint">
            {pending ? "Move the pin, or lock it in." : "Tap the map to drop your pin."}
          </p>
        )}
      </div>
    </section>
  );
}
