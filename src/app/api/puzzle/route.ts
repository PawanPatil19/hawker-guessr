import { NextResponse } from "next/server";

import type { PublicPuzzle } from "@/domain/types";
import { puzzleDay, puzzleNumber } from "@/domain/calendar";
import { questionsForDay } from "@/server/puzzle";
import { toPublicRound } from "@/server/repository/questions";
import { readProgress, scoreProgress } from "@/server/progressCookie";

export const dynamic = "force-dynamic";

/** Today's five rounds, with every answer field stripped, plus any progress. */
export async function GET() {
  const day = puzzleDay();
  const progress = await readProgress(day);

  const body: PublicPuzzle = {
    day,
    number: puzzleNumber(day),
    rounds: questionsForDay(day).map(toPublicRound),
    results: scoreProgress(progress),
  };

  return NextResponse.json(body);
}
