"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface ZoneRisk {
  zone_id: string;
  zone_name: string;
  city: string;
  lat: number;
  lon: number;
  flood_risk: number;
  aqi_risk: number;
  combined_risk: number;
}

interface FraudHeatmapProps {
  zones: ZoneRisk[];
  isLoading?: boolean;
}

function riskColor(risk: number): string {
  if (risk > 0.7) return "#ef4444";
  if (risk > 0.4) return "#eab308";
  return "#22c55e";
}

function riskLabel(risk: number): string {
  if (risk > 0.7) return "High";
  if (risk > 0.4) return "Medium";
  return "Low";
}

export function FraudHeatmap({ zones, isLoading }: FraudHeatmapProps) {
  if (isLoading) {
    return (
      <div className="h-[280px] sm:h-[400px] bg-surface-card rounded-xl animate-pulse flex items-center justify-center">
        <p className="text-sm text-text-muted">Loading map...</p>
      </div>
    );
  }

  if (!zones || zones.length === 0) {
    return (
      <div className="h-[280px] sm:h-[400px] bg-surface-card rounded-xl flex items-center justify-center">
        <p className="text-sm text-text-muted">No zone data available</p>
      </div>
    );
  }

  return (
    <div className="h-[280px] sm:h-[400px] rounded-xl overflow-hidden border border-surface-border relative z-0">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {zones.map((zone) => (
          <CircleMarker
            key={zone.zone_id}
            center={[zone.lat, zone.lon]}
            radius={10 + zone.combined_risk * 20}
            pathOptions={{
              fillColor: riskColor(zone.combined_risk),
              fillOpacity: 0.55,
              color: riskColor(zone.combined_risk),
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-xs space-y-1 min-w-[140px]">
                <p className="font-bold text-sm">{zone.zone_name}</p>
                <p className="text-text-muted uppercase text-[10px] tracking-wider">
                  {zone.city}
                </p>
                <div className="border-t border-surface-border pt-1.5 mt-1.5 space-y-1">
                  <div className="flex justify-between">
                    <span>Flood risk</span>
                    <span className="font-semibold" style={{ color: riskColor(zone.flood_risk) }}>
                      {(zone.flood_risk * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>AQI risk</span>
                    <span className="font-semibold" style={{ color: riskColor(zone.aqi_risk) }}>
                      {(zone.aqi_risk * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 border-t border-surface-border">
                    <span>Combined</span>
                    <span style={{ color: riskColor(zone.combined_risk) }}>
                      {(zone.combined_risk * 100).toFixed(0)}% ({riskLabel(zone.combined_risk)})
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Floating legend */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-surface/90 backdrop-blur-sm border border-surface-border rounded-lg px-3 py-2 text-[10px] space-y-1">
        <p className="text-text-muted font-semibold uppercase tracking-wider mb-1">Risk level</p>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-status-success inline-block" />
          <span className="text-text-secondary">Low (&lt;40%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-status-warning inline-block" />
          <span className="text-text-secondary">Medium (40-70%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-status-danger inline-block" />
          <span className="text-text-secondary">High (&gt;70%)</span>
        </div>
      </div>
    </div>
  );
}
