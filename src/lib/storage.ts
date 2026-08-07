/**
 * Streaks live in localStorage for v1 — they belong to the device, not an
 * account, because there are no accounts yet. Moves to `profiles` when auth
 * lands; the anon cookie is what will let us migrate it.
 */

const KEY = "hg_streak";
const REVEAL_KEY = "hg_reveal_ack";

interface StreakState {
  /** Puzzle day of the last completed puzzle. */
  lastDay: string;
  current: number;
  longest: number;
}

const EMPTY: StreakState = { lastDay: "", current: 0, longest: 0 };

function read(): StreakState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

function write(state: StreakState): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // private browsing — the game still works, the streak just doesn't stick
  }
}

function previousDay(day: string): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function currentStreak(): number {
  return read().current;
}

/** Call once when a puzzle is completed. Idempotent for the same day. */
export function recordCompletion(day: string): StreakState {
  const state = read();
  if (state.lastDay === day) return state;

  const current = state.lastDay === previousDay(day) ? state.current + 1 : 1;
  const next: StreakState = {
    lastDay: day,
    current,
    longest: Math.max(current, state.longest),
  };
  write(next);
  return next;
}

/** Remember the last reveal the player explicitly continued past. */
export function acknowledgeReveal(day: string, index: number): void {
  try {
    window.localStorage.setItem(REVEAL_KEY, JSON.stringify({ day, index }));
  } catch {
    // A refresh may repeat the reveal in private browsing, but play still works.
  }
}

/** Whether a restored result still needs to be shown to the player. */
export function revealWasAcknowledged(day: string, index: number): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(REVEAL_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw) as { day?: string; index?: number };
    return saved.day === day && saved.index === index;
  } catch {
    return false;
  }
}
