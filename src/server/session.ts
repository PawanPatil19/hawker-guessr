import "server-only";

import { cookies } from "next/headers";

/**
 * Anonymous identity. No login to play — an uncle forwarded a WhatsApp link
 * should be guessing within three seconds, and every auth wall before the
 * first guess costs most of that traffic.
 *
 * When accounts arrive, this id is the key to migrate anonymous plays onto
 * the new user.
 */

const COOKIE = "hg_anon";
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function currentPlayerId(): Promise<string> {
  const jar = await cookies();
  return jar.get(COOKIE)?.value ?? "";
}

/**
 * Reads the anon id, minting one if absent. Returns the id plus the cookie
 * that the route must set — route handlers own the response, not this module.
 */
export async function resolvePlayer(): Promise<{
  playerId: string;
  setCookie?: { name: string; value: string; maxAge: number };
}> {
  const existing = await currentPlayerId();
  if (existing) return { playerId: existing };

  const playerId = crypto.randomUUID();
  return {
    playerId,
    setCookie: { name: COOKIE, value: playerId, maxAge: ONE_YEAR },
  };
}

export function setPlayerCookie(
  response: Response,
  cookie: { name: string; value: string; maxAge: number } | undefined,
): void {
  if (!cookie || !("cookies" in response)) return;
  const nextResponse = response as Response & {
    cookies: { set: (options: Record<string, unknown>) => void };
  };
  nextResponse.cookies.set({
    ...cookie,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}
