"use client";

import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";

const STORAGE_KEY = "hg_intro_seen";
const LINE_ONE = "Somewhere in Singapore,";
const LINE_TWO = "lunch is already waiting.";

function AnimatedLine({ text, second = false }: { text: string; second?: boolean }) {
  let characterIndex = 0;
  const words = text.split(" ");

  return (
    <span className="intro__sentence" aria-hidden>
      {words.map((word, wordIndex) => (
        <span className="intro__word" key={word}>
          {[...word].map((character) => {
            const index = characterIndex++;
            return (
              <span
                className={`intro__character${second ? " intro__character--second" : ""}`}
                style={{ "--character": index } as CSSProperties}
                key={`${character}-${index}`}
              >
                {character}
              </span>
            );
          })}
          {wordIndex < words.length - 1 && (() => {
            const index = characterIndex++;
            return (
              <span
                className={`intro__character${second ? " intro__character--second" : ""}`}
                style={{ "--character": index } as CSSProperties}
                key={`space-${index}`}
              >
                {"\u00a0"}
              </span>
            );
          })()}
        </span>
      ))}
    </span>
  );
}

export function Intro() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const dismiss = useCallback(() => {
    if (leaving) return;
    setLeaving(true);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // The entrance is decorative; storage failure must never block play.
    }
    window.setTimeout(() => setVisible(false), 500);
  }, [leaving]);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // Private browsing can disable storage. Show the intro once this load.
    }

    setVisible(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(dismiss, reduced ? 1600 : 3900);
    return () => window.clearTimeout(timer);
  }, [dismiss]);

  if (!visible) return null;

  return (
    <section
      className={`intro${leaving ? " intro--leaving" : ""}`}
      aria-label="Welcome to Hawker Guessr"
    >
      <div className="intro__copy" aria-live="polite">
        <p className="intro__kicker">Hawker Guessr</p>
        <p className="intro__line" aria-label={`${LINE_ONE} ${LINE_TWO}`}>
          <AnimatedLine text={LINE_ONE} />
          <br />
          <AnimatedLine text={LINE_TWO} second />
        </p>
      </div>

      <button className="intro__enter" type="button" onClick={dismiss}>
        Enter <span aria-hidden>↘</span>
      </button>
    </section>
  );
}
