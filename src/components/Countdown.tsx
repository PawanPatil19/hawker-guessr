"use client";

import { useEffect, useState } from "react";

import { formatCountdown, msUntilNextDrop } from "@/domain/calendar";

/** Ticks down to the 06:00 SGT drop. Rendered client-side to avoid hydration
 *  mismatch — the server's "now" is never the browser's "now". */
export function Countdown() {
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setMs(msUntilNextDrop());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (ms === null) return <span className="countdown">&nbsp;</span>;
  return <span className="countdown">Next hawker in {formatCountdown(ms)}</span>;
}
