import type { LatLng } from "./types";

const EARTH_RADIUS_M = 6_371_000;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in metres. Overkill for a 50km island, but exact. */
export function haversineM(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Bounding box of mainland Singapore + the near islands. */
export const SG_BOUNDS = {
  west: 103.6,
  south: 1.21,
  east: 104.04,
  north: 1.48,
} as const;

export const SG_CENTRE: LatLng = { lat: 1.3521, lng: 103.8198 };

export function isInSingapore(p: LatLng): boolean {
  return (
    p.lat >= SG_BOUNDS.south &&
    p.lat <= SG_BOUNDS.north &&
    p.lng >= SG_BOUNDS.west &&
    p.lng <= SG_BOUNDS.east
  );
}

export function formatDistance(metres: number): string {
  if (metres < 950) return `${Math.round(metres / 10) * 10} m`;
  return `${(metres / 1000).toFixed(metres < 10_000 ? 2 : 1)} km`;
}
