import { NextResponse } from "next/server";

import type { PublicPuzzle } from "@/domain/types";
import { puzzleDay, puzzleNumber } from "@/domain/calendar";
import { questionsForDay } from "@/server/puzzle";
import { toPublicRound } from "@/server/repository/questions";
import { playStore } from "@/server/plays";
import { resolvePlayer } from "@/server/session";

export const dynamic = "force-dynamic";

/** Today's five rounds, with every answer field stripped, plus any progress. */
export async function GET() {
  const day = puzzleDay();
  const { playerId, setCookie } = await resolvePlayer();

  const body: PublicPuzzle = {
    day,
    number: puzzleNumber(day),
    rounds: questionsForDay(day).map(toPublicRound),
    results: await playStore.get(playerId, day),
  };

  const res = NextResponse.json(body);
  if (setCookie) {
    res.cookies.set(setCookie.name, setCookie.value, {
      maxAge: setCookie.maxAge,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }
  return res;
}
