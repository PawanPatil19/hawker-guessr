/**
 * Streaks live in localStorage for v1 — they belong to the device, not an
 * account, because there are no accounts yet. Moves to `profiles` when auth
 * lands; the anon cookie is what will let us migrate it.
 */

const KEY = "hg_streak";

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
