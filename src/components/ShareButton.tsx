"use client";

import { useState } from "react";

import type { RoundResult } from "@/domain/types";
import { buildShareText, share } from "@/lib/share";

interface Props {
  puzzleNumber: number;
  results: RoundResult[];
  total: number;
  streak: number;
}

export function ShareButton({ puzzleNumber, results, total, streak }: Props) {
  const [state, setState] = useState<"idle" | "shared" | "copied" | "error">("idle");

  async function onClick() {
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    const text = buildShareText(puzzleNumber, results, total, streak, origin);
    try {
      setState(await share(text));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setState("idle");
      } else {
        setState("error");
      }
    }
  }

  return (
    <button className="btn" type="button" onClick={onClick} aria-live="polite">
      {state === "copied"
        ? "Copied — go paste it"
        : state === "shared"
          ? "Shared"
          : state === "error"
            ? "Couldn’t share — try again"
            : "Share today’s grid"}
    </button>
  );
}
