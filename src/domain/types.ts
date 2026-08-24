/**
 * Shared vocabulary for the whole app.
 *
 * Split deliberately into "public" and "private" shapes: anything named
 * `Public*` is safe to serialise to the browser. Anything else stays on the
 * server. See src/server/repository/questions.ts.
 */

export type Region = "C" | "E" | "W" | "N" | "NE";

export const REGION_NAMES: Record<Region, string> = {
  C: "Central",
  E: "East",
  W: "West",
  N: "North",
  NE: "North-East",
};

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Centre extends LatLng {
  id: string;
  name: string;
  officialName: string;
  address: string;
  postal: string | null;
  region: Region;
}

export type RoundKind = "LOCATION" | "PRICE";

/** Authored content. Lives on the server only — it carries the answer. */
export interface Question {
  id: string;
  kind: RoundKind;
  centreId: string;
  /** Path under /public, or null while the photo is still un-shot. */
  image: string | null;
  /** Kept private until reveal so attribution cannot spoil the answer. */
  imageCredit?: string;
  imageSourceUrl?: string;
  imageLicense?: string;
  /** Normalized image-space rectangles that obscure answer signage. */
  redactions?: Array<{ x: number; y: number; width: number; height: number }>;
  /** Shown instead of the photo when `image` is null. */
  clues: string[];
  prompt: string;
  /** What is being priced. PRICE rounds only. */
  item?: string;
  answerPriceCents?: number;
  priceFloorCents?: number;
  priceCeilCents?: number;
  /** The one fact worth repeating, shown on reveal. */
  fact: string;
  stall?: string;
  difficulty: 1 | 2 | 3;
  /** False until a human has checked the price/stall against reality. */
  verified: boolean;
}

/** The same question with every answer field stripped. Safe for the client. */
export interface PublicRound {
  index: number;
  kind: RoundKind;
  image: string | null;
  prompt: string;
  difficulty: 1 | 2 | 3;
  redactions?: Array<{ x: number; y: number; width: number; height: number }>;
}

export interface PublicPuzzle {
  day: string;
  number: number;
  rounds: PublicRound[];
  /** Rounds already answered in this session, so a refresh resumes. */
  results: RoundResult[];
}

export type Guess =
  | { kind: "LOCATION"; lat: number; lng: number }
  | { kind: "PRICE"; cents: number };

export interface RoundResult {
  index: number;
  points: number;
  /** LOCATION only. */
  distanceM?: number;
  /** PRICE only. */
  offByCents?: number;
  guess: Guess;
  truth: {
    centreName: string;
    region: Region;
    lat: number;
    lng: number;
    stall?: string;
    priceCents?: number;
  };
  imageAttribution?: {
    credit: string;
    license: string;
    licenseUrl: string;
    sourceUrl: string;
    changes: string;
  };
  fact: string;
  verdict: string;
}
