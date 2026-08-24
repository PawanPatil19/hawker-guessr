import { NextResponse } from "next/server";

import { puzzleDay } from "@/domain/calendar";
import { ROUNDS_PER_PUZZLE } from "@/domain/scoring";
import { questionsForDay } from "@/server/puzzle";
import { scoreRound } from "@/server/services/scoreRound";
import { parseGuessRequest } from "@/server/validation";
import {
  progressFromResults,
  readProgress,
  scoreProgress,
  setProgressCookie,
} from "@/server/progressCookie";
import { playStore } from "@/server/plays";
import { resolvePlayer, setPlayerCookie } from "@/server/session";

export const dynamic = "force-dynamic";

/**
 * Scores one round, server-side, and records it. Rounds are scored once —
 * replaying a round returns the original result rather than a better one.
 */
export async function POST(request: Request) {
  const parsed = parseGuessRequest(await request.json().catch(() => null));
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { day: requestedDay, roundIndex, guess } = parsed.value;
  const day = puzzleDay();
  if (requestedDay !== day) {
    return NextResponse.json(
      { error: "A new daily puzzle has dropped. Refresh to keep playing." },
      { status: 409 },
    );
  }
  const progress = await readProgress(day);
  const player = await resolvePlayer();
  for (const storedResult of scoreProgress(progress)) {
    await playStore.append(player.playerId, day, storedResult);
  }
  const played = await playStore.get(player.playerId, day);
  const already = played.find(
    (r) => r.index === roundIndex,
  );
  if (already) return NextResponse.json(already);
  const playedIndexes = new Set(played.map((result) => result.index));
  const expectedIndex = Array.from(
    { length: ROUNDS_PER_PUZZLE },
    (_, index) => index,
  ).find((index) => !playedIndexes.has(index));
  if (roundIndex !== expectedIndex) {
    return NextResponse.json(
      { error: "Finish the current round before moving on." },
      { status: 409 },
    );
  }

  const question = questionsForDay(day)[roundIndex];
  if (!question) {
    return NextResponse.json({ error: "No such round today" }, { status: 404 });
  }

  let result;
  try {
    result = scoreRound(question, roundIndex, guess);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not score round" },
      { status: 400 },
    );
  }

  const canonical = await playStore.append(player.playerId, day, result);
  const canonicalResults = await playStore.get(player.playerId, day);
  const res = NextResponse.json(canonical);
  setPlayerCookie(res, player.setCookie);
  setProgressCookie(res, progressFromResults(day, canonicalResults));
  return res;
}
