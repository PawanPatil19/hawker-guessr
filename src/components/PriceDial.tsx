"use client";

import { useState } from "react";

import { formatCents } from "@/lib/money";

interface Props {
  floorCents: number;
  ceilCents: number;
  disabled?: boolean;
  onSubmit: (cents: number) => void;
}

const STEP = 10; // 10 cents — finer than that is guessing noise

/** The price round input. A slider, big number, one button. */
export function PriceDial({ floorCents, ceilCents, disabled, onSubmit }: Props) {
  const [cents, setCents] = useState(
    Math.round((floorCents + ceilCents) / 2 / STEP) * STEP,
  );

  return (
    <div className="dial">
      <output className="dial__value">{formatCents(cents)}</output>
      <input
        className="dial__slider"
        type="range"
        min={floorCents}
        max={ceilCents}
        step={STEP}
        value={cents}
        disabled={disabled}
        onChange={(e) => setCents(Number(e.target.value))}
        aria-label="Your price guess"
      />
      <div className="dial__ends">
        <span>{formatCents(floorCents)}</span>
        <span>{formatCents(ceilCents)}</span>
      </div>
      <button
        className="btn"
        type="button"
        disabled={disabled}
        onClick={() => onSubmit(cents)}
      >
        Confirm price
      </button>
    </div>
  );
}
