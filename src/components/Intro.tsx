"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

const STORAGE_KEY = "hg_intro_seen";
const LINE_ONE = "Spot the hawker.";
const LINE_TWO = "Pin it on Singapore.";

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
  const skip = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    if (!visible) return;
    const background = document.querySelectorAll<HTMLElement>(".game-stage, .footer");
    background.forEach((element) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });
    skip.current?.focus();
    return () => {
      background.forEach((element) => {
        element.inert = false;
        element.removeAttribute("aria-hidden");
      });
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <section
      className={`intro${leaving ? " intro--leaving" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Hawker Guessr"
    >
      <div className="intro__copy" aria-live="polite">
        <p className="intro__kicker">Hawker Guessr</p>
        <p className="intro__line" aria-label={`${LINE_ONE} ${LINE_TWO}`}>
          <AnimatedLine text={LINE_ONE} />
          <br />
          <AnimatedLine text={LINE_TWO} second />
        </p>
        <p className="intro__how">Five photos a day. Closer pins score more.</p>
      </div>

      <button ref={skip} className="intro__enter" type="button" onClick={dismiss}>
        Skip intro <span aria-hidden>↘</span>
      </button>
    </section>
  );
}
