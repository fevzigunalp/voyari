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
import type { DayPlan } from "@/lib/types/plan";

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

interface DayPoint {
  name: string;
  coordinates: [number, number];
  kind: string;
}

export interface DayMapProps {
  day: DayPlan;
  height?: number;
}

export default function DayMap({ day, height = 320 }: DayMapProps) {
  useEffect(() => {
    L.Marker.prototype.options.icon = DefaultIcon;
  }, []);

  const points = useMemo<DayPoint[]>(() => {
    const out: DayPoint[] = [];
    (day.timeline ?? []).forEach((t) => {
      if (
        t.coordinates &&
        Number.isFinite(t.coordinates[0]) &&
        Number.isFinite(t.coordinates[1])
      ) {
        out.push({ name: t.title, coordinates: t.coordinates, kind: t.type });
      }
    });
    const hotel = day.accommodation?.primary;
    if (
      hotel?.coordinates &&
      Number.isFinite(hotel.coordinates[0]) &&
      Number.isFinite(hotel.coordinates[1])
    ) {
      out.push({
        name: hotel.name,
        coordinates: hotel.coordinates,
        kind: "hotel",
      });
    }
    return out;
  }, [day]);

  if (points.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[rgba(17,24,39,0.5)] text-text-muted text-xs"
        style={{ height }}
      >
        Bu gün için harita noktası yok.
      </div>
    );
  }

  const line: [number, number][] = points.map((p) => p.coordinates);
  const center = points[0].coordinates;

  return (
    <div
      className="overflow-hidden rounded-xl border border-[rgba(212,168,83,0.2)]"
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", background: "#0A0E1A" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap &copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
        />
        {points.length > 1 && (
          <Polyline
            positions={line}
            pathOptions={{ color: "#E8C97A", weight: 2, dashArray: "6 6" }}
          />
        )}
        {points.map((p, i) => (
          <Marker key={`${p.name}-${i}`} position={p.coordinates}>
            <Popup>
              <div style={{ fontFamily: "system-ui", fontSize: 13 }}>
                <strong>{p.name}</strong>
                <div style={{ opacity: 0.7, fontSize: 11 }}>{p.kind}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
