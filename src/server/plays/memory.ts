import "server-only";

import type { RoundResult } from "@/domain/types";
import type { PlayStore } from "./types";

/**
 * In-memory play store. Good enough for v1 and local play; resets on deploy.
 * Replace with a Supabase-backed store before the leaderboard ships — see
 * the `plays` table in PRD.md §7.
 */
class MemoryPlayStore implements PlayStore {
  private readonly rounds = new Map<string, RoundResult[]>();

  private key(playerId: string, day: string): string {
    return `${playerId}:${day}`;
  }

  async get(playerId: string, day: string): Promise<RoundResult[]> {
    return this.rounds.get(this.key(playerId, day)) ?? [];
  }

  async append(playerId: string, day: string, result: RoundResult): Promise<RoundResult> {
    const key = this.key(playerId, day);
    const existing = this.rounds.get(key) ?? [];
    const canonical = existing.find((r) => r.index === result.index);
    if (canonical) return canonical;
    this.rounds.set(key, [...existing, result].sort((a, b) => a.index - b.index));
    return result;
  }
}

/** Survives Next.js dev hot-reloads, which otherwise wipe module state. */
const globalForStore = globalThis as unknown as { __playStore?: PlayStore };

export const memoryPlayStore: PlayStore =
  globalForStore.__playStore ?? (globalForStore.__playStore = new MemoryPlayStore());
