"use client";

import { useState } from "react";

import type { RoundResult } from "@/domain/types";
import { buildShareText, share } from "@/lib/share";

interface Props {
  puzzleNumber: number;
  results: RoundResult[];
  total: number;
}

export function ShareButton({ puzzleNumber, results, total }: Props) {
  const [state, setState] = useState<"idle" | "shared" | "copied">("idle");

  async function onClick() {
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    const text = buildShareText(puzzleNumber, results, total, origin);
    try {
      setState(await share(text));
    } catch {
      setState("idle");
    }
  }

  return (
    <button className="btn" type="button" onClick={onClick}>
      {state === "copied" ? "Copied — go paste it" : state === "shared" ? "Shared" : "Share today’s grid"}
    </button>
  );
}
