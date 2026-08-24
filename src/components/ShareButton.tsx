"use client";

import { useEffect, useRef, useState } from "react";

import type { RoundResult } from "@/domain/types";
import { buildShareText, share } from "@/lib/share";

interface Props {
  puzzleNumber: number;
  results: RoundResult[];
  total: number;
  streak: number;
}

export function ShareButton({ puzzleNumber, results, total, streak }: Props) {
  const [state, setState] = useState<"idle" | "shared" | "copied" | "manual" | "error">("idle");
  const [shareText, setShareText] = useState("");
  const manual = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state === "manual") manual.current?.select();
  }, [state]);

  async function onClick() {
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    const text = buildShareText(puzzleNumber, results, total, streak, origin);
    setShareText(text);
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
    <div>
      <button className="btn" type="button" onClick={onClick} aria-live="polite">
        {state === "copied"
          ? "Copied — go paste it"
          : state === "shared"
            ? "Shared"
            : state === "manual"
              ? "Select and copy below"
              : state === "error"
                ? "Couldn’t share — try again"
                : "Share today’s grid"}
      </button>
      {state === "manual" && (
        <textarea
          ref={manual}
          className="share-fallback"
          aria-label="Your share text"
          readOnly
          value={shareText}
          onFocus={(event) => event.currentTarget.select()}
        />
      )}
    </div>
  );
}
