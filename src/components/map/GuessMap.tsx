"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const [unavailable, setUnavailable] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState(false);

  const placeMarker = useCallback((point: LatLng) => {
    const instance = map.current;
    if (!instance || disabled) return;
    const lngLat: [number, number] = [point.lng, point.lat];
    if (!marker.current) {
      const el = document.createElement("div");
      el.className = "pin pin--guess";
      marker.current = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat(lngLat)
        .addTo(instance);
    } else {
      marker.current.setLngLat(lngLat);
    }
    onPick(point);
  }, [disabled, onPick]);

  useEffect(() => {
    if (!container.current || map.current) return;

    const canvas = document.createElement("canvas");
    const supportsWebGL = Boolean(
      canvas.getContext("webgl2") || canvas.getContext("webgl"),
    );
    if (!supportsWebGL) {
      setUnavailable(true);
      return;
    }

    let instance: MapLibreMap;
    try {
      instance = new maplibregl.Map({
        container: container.current,
        style: oneMapStyle("Grey"),
        center: [SG_CENTRE.lng, SG_CENTRE.lat],
        zoom: ISLAND_ZOOM,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        attributionControl: { compact: true },
      });
    } catch {
      setUnavailable(true);
      return;
    }
    instance.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    // maxBounds before the first render can wedge the initial camera, so it
    // goes on once the style is up.
    instance.on("load", () => {
      instance.setMaxBounds(MAX_BOUNDS);
      container.current?.querySelector("canvas")?.setAttribute("tabindex", "-1");
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
      placeMarker({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    };

    instance.on("click", handler);
    return () => {
      instance.off("click", handler);
    };
  }, [placeMarker, disabled]);

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const instance = map.current;
    if (!instance || disabled) return;
    const distance = event.shiftKey ? 120 : 44;
    const movement: Record<string, [number, number]> = {
      ArrowLeft: [-distance, 0],
      ArrowRight: [distance, 0],
      ArrowUp: [0, -distance],
      ArrowDown: [0, distance],
    };
    if (movement[event.key]) {
      event.preventDefault();
      instance.panBy(movement[event.key], { duration: 120 });
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const centre = instance.getCenter();
      placeMarker({ lat: centre.lat, lng: centre.lng });
    } else if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      instance.zoomIn();
    } else if (event.key === "-") {
      event.preventDefault();
      instance.zoomOut();
    }
  }

  if (unavailable) {
    const areas: Array<[string, LatLng]> = [
      ["North-west", { lat: 1.425, lng: 103.72 }],
      ["North", { lat: 1.43, lng: 103.82 }],
      ["North-east", { lat: 1.395, lng: 103.9 }],
      ["West", { lat: 1.345, lng: 103.71 }],
      ["Central", { lat: 1.315, lng: 103.845 }],
      ["East", { lat: 1.345, lng: 103.94 }],
      ["South-west", { lat: 1.285, lng: 103.78 }],
      ["South", { lat: 1.285, lng: 103.845 }],
      ["South-east", { lat: 1.31, lng: 103.92 }],
    ];
    return (
      <div className="map map--fallback" role="group" aria-label="Choose an area of Singapore">
        <p className="map__fallback-title">Map unavailable. Choose an area instead.</p>
        <div className="map__fallback-grid">
          {areas.map(([label, point]) => (
            <button type="button" key={label} disabled={disabled} onClick={() => onPick(point)}>
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="map"
      role="application"
      aria-label="Singapore guessing map. Use arrow keys to move, plus and minus to zoom, then Enter to place your pin at the centre."
      tabIndex={disabled ? -1 : 0}
      onFocus={() => setKeyboardMode(true)}
      onBlur={() => setKeyboardMode(false)}
      onKeyDown={onKeyDown}
    >
      <div ref={container} className="map__canvas" />
      {keyboardMode && ready && <div className="map__reticle" aria-hidden />}
      {!ready && <div className="map__loading">loading map…</div>}
    </div>
  );
}
