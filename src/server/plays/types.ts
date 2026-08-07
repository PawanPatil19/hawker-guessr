import type { RoundResult } from "@/domain/types";

/**
 * Where a session's completed rounds live.
 *
 * Scoring is server-authoritative, so this is what stops a player replaying a
 * round until they get 1000. Swap the implementation for Supabase without
 * touching the routes.
 */
export interface PlayStore {
  get(playerId: string, day: string): Promise<RoundResult[]>;
  /** Atomically stores the first result and returns that canonical result. */
  append(playerId: string, day: string, result: RoundResult): Promise<RoundResult>;
}
