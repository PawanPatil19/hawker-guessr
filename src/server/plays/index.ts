import "server-only";

import type { PlayStore } from "./types";
import { memoryPlayStore } from "./memory";

/** The single place that decides which store backs the game. */
export const playStore: PlayStore = memoryPlayStore;

export type { PlayStore } from "./types";
