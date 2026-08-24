import { NextResponse } from "next/server";

import type { PublicPuzzle } from "@/domain/types";
import { puzzleDay, puzzleNumber } from "@/domain/calendar";
import { questionsForDay } from "@/server/puzzle";
import { toPublicRound } from "@/server/repository/questions";
import { readProgress, scoreProgress } from "@/server/progressCookie";
import { progressFromResults, setProgressCookie } from "@/server/progressCookie";
import { playStore } from "@/server/plays";
import { resolvePlayer, setPlayerCookie } from "@/server/session";

export const dynamic = "force-dynamic";

/** Today's five rounds, with every answer field stripped, plus any progress. */
export async function GET() {
  const day = puzzleDay();
  const progress = await readProgress(day);
  const player = await resolvePlayer();
  for (const result of scoreProgress(progress)) {
    await playStore.append(player.playerId, day, result);
  }
  const results = await playStore.get(player.playerId, day);

  const body: PublicPuzzle = {
    day,
    number: puzzleNumber(day),
    rounds: questionsForDay(day).map(toPublicRound),
    results,
  };

  const response = NextResponse.json(body);
  setPlayerCookie(response, player.setCookie);
  if (results.length) setProgressCookie(response, progressFromResults(day, results));
  return response;
}
