import "server-only";

import centresJson from "@content/centres.json";
import type { Centre } from "@/domain/types";

/**
 * Centres are geographically public information — the browser could have them.
 * They stay server-side anyway so there is exactly one place that reads
 * content/, and swapping this for a Supabase query later touches one file.
 */
const centres = centresJson as Centre[];

const byId = new Map(centres.map((c) => [c.id, c]));

export function allCentres(): Centre[] {
  return centres;
}

export function findCentre(id: string): Centre | undefined {
  return byId.get(id);
}

export function requireCentre(id: string): Centre {
  const centre = byId.get(id);
  if (!centre) throw new Error(`Unknown centre id: ${id}`);
  return centre;
}
