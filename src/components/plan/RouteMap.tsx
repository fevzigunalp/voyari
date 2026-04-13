"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import type { Waypoint } from "@/lib/types/plan";

// Fix default marker icons (avoid SSR breakage)
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export interface RouteMapProps {
  waypoints: Waypoint[];
  height?: number;
}

export default function RouteMap({ waypoints, height = 480 }: RouteMapProps) {
  useEffect(() => {
    L.Marker.prototype.options.icon = DefaultIcon;
  }, []);

  const valid = useMemo(
    () =>
      (waypoints ?? []).filter(
        (w) =>
          Array.isArray(w.coordinates) &&
          w.coordinates.length === 2 &&
          Number.isFinite(w.coordinates[0]) &&
          Number.isFinite(w.coordinates[1]),
      ),
    [waypoints],
  );

  if (valid.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[rgba(17,24,39,0.5)] text-text-muted text-sm"
        style={{ height }}
      >
        Harita için koordinat bulunamadı.
      </div>
    );
  }

  const center: [number, number] = valid[0].coordinates;
  const line: [number, number][] = valid.map((w) => w.coordinates);

  return (
    <div
      className="overflow-hidden rounded-xl border border-[rgba(212,168,83,0.25)]"
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={5}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", background: "#0A0E1A" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
        />
        <Polyline
          positions={line}
          pathOptions={{ color: "#D4A853", weight: 3, opacity: 0.85 }}
        />
        {valid.map((w, i) => (
          <Marker key={`${w.name}-${i}`} position={w.coordinates}>
            <Popup>
              <div style={{ fontFamily: "system-ui", fontSize: 13 }}>
                <strong>{w.name}</strong>
                <div style={{ opacity: 0.7, fontSize: 11 }}>{w.type}</div>
                {w.notes && <div style={{ marginTop: 4 }}>{w.notes}</div>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
