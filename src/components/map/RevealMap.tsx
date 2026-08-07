"use client";

import { useEffect, useRef } from "react";
import maplibregl, { Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import type { LatLng } from "@/domain/types";
import { MAX_ZOOM, MIN_ZOOM, oneMapStyle } from "@/lib/mapStyle";

interface Props {
  guess: LatLng;
  truth: LatLng;
}

/**
 * The payoff screen: your pin, the real place, and the line between them.
 * The distance is the lesson, so the map frames both points and nothing else.
 */
export function RevealMap({ guess, truth }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    if (!container.current || map.current) return;

    const bounds = new maplibregl.LngLatBounds(
      [Math.min(guess.lng, truth.lng), Math.min(guess.lat, truth.lat)],
      [Math.max(guess.lng, truth.lng), Math.max(guess.lat, truth.lat)],
    );

    const instance = new maplibregl.Map({
      container: container.current,
      style: oneMapStyle("Grey"),
      bounds,
      fitBoundsOptions: { padding: 56, maxZoom: 15 },
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      attributionControl: { compact: true },
      interactive: true,
    });

    instance.on("error", (e) => console.error("[map]", e.error?.message ?? e));
    instance.on("load", () => {
      instance.addSource("shot", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [
              [guess.lng, guess.lat],
              [truth.lng, truth.lat],
            ],
          },
        },
      });
      instance.addLayer({
        id: "shot-line",
        type: "line",
        source: "shot",
        paint: {
          "line-color": "#D6202B",
          "line-width": 2.5,
          "line-dasharray": [2, 1.6],
        },
      });

      for (const [point, cls] of [
        [guess, "pin pin--guess"],
        [truth, "pin pin--truth"],
      ] as const) {
        const el = document.createElement("div");
        el.className = cls;
        new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat([point.lng, point.lat])
          .addTo(instance);
      }
    });

    map.current = instance;
    return () => {
      instance.remove();
      map.current = null;
    };
  }, [guess, truth]);

  return (
    <div className="map map--reveal">
      <div ref={container} className="map__canvas" />
    </div>
  );
}
