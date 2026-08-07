"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { Map as MapLibreMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import type { LatLng } from "@/domain/types";
import { SG_CENTRE } from "@/domain/geo";
import {
  ISLAND_ZOOM,
  MAX_BOUNDS,
  MAX_ZOOM,
  MIN_ZOOM,
  oneMapStyle,
} from "@/lib/mapStyle";

interface Props {
  onPick: (point: LatLng) => void;
  disabled?: boolean;
}

/** Tap anywhere to drop a pin. That is the entire interaction. */
export function GuessMap({ onPick, disabled }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const marker = useRef<Marker | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!container.current || map.current) return;

    const instance = new maplibregl.Map({
      container: container.current,
      style: oneMapStyle("Grey"),
      center: [SG_CENTRE.lng, SG_CENTRE.lat],
      zoom: ISLAND_ZOOM,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      attributionControl: { compact: true },
    });
    instance.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    // maxBounds before the first render can wedge the initial camera, so it
    // goes on once the style is up.
    instance.on("load", () => {
      instance.setMaxBounds(MAX_BOUNDS);
      setReady(true);
    });
    instance.on("error", (e) => console.error("[map]", e.error?.message ?? e));
    map.current = instance;

    return () => {
      instance.remove();
      map.current = null;
      marker.current = null;
    };
  }, []);

  // Click handler is re-bound when onPick changes so it never closes over a
  // stale round index.
  useEffect(() => {
    const instance = map.current;
    if (!instance) return;

    const handler = (e: maplibregl.MapMouseEvent) => {
      if (disabled) return;
      const point = { lat: e.lngLat.lat, lng: e.lngLat.lng };
      if (!marker.current) {
        const el = document.createElement("div");
        el.className = "pin pin--guess";
        marker.current = new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat(e.lngLat)
          .addTo(instance);
      } else {
        marker.current.setLngLat(e.lngLat);
      }
      onPick(point);
    };

    instance.on("click", handler);
    return () => {
      instance.off("click", handler);
    };
  }, [onPick, disabled]);

  return (
    <div className="map">
      <div ref={container} className="map__canvas" />
      {!ready && <div className="map__loading">loading map…</div>}
    </div>
  );
}
