import type { StyleSpecification } from "maplibre-gl";

import { SG_BOUNDS } from "@/domain/geo";

/**
 * OneMap raster tiles — free, no API key, and the basemap actually looks
 * Singaporean, which matters for a game about Singapore. Attribution is
 * required by OneMap's terms and is rendered in the map corner.
 */

export const ONEMAP_ATTRIBUTION =
  '<a href="https://www.onemap.gov.sg/" target="_blank" rel="noreferrer">OneMap</a> © Singapore Land Authority';

type OneMapTheme = "Default" | "Grey" | "Night" | "Original";

export function oneMapStyle(theme: OneMapTheme = "Grey"): StyleSpecification {
  return {
    version: 8,
    sources: {
      onemap: {
        type: "raster",
        tiles: [`https://www.onemap.gov.sg/maps/tiles/${theme}/{z}/{x}/{y}.png`],
        tileSize: 256,
        attribution: ONEMAP_ATTRIBUTION,
      },
    },
    layers: [{ id: "onemap", type: "raster", source: "onemap" }],
  };
}

/** Keeps the player inside Singapore — panning to Malaysia helps nobody. */
export const MAX_BOUNDS: [[number, number], [number, number]] = [
  [SG_BOUNDS.west - 0.08, SG_BOUNDS.south - 0.08],
  [SG_BOUNDS.east + 0.08, SG_BOUNDS.north + 0.08],
];

/** Whole island in view on a phone-width map. */
export const ISLAND_ZOOM = 10.6;

export const MIN_ZOOM = 10.2;
export const MAX_ZOOM = 17;
