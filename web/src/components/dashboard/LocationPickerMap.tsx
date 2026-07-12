"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

export type PinValue = { lat: number; lng: number };

function ClickToPin({ onPick }: { onPick: (p: PinValue) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// Fly to the selected city while the owner hasn't dropped a pin yet.
function CityRecenter({ center }: { center: PinValue | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView([center.lat, center.lng], Math.max(map.getZoom(), 11));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center?.lat, center?.lng]);
  return null;
}

export default function LocationPickerMap({
  value,
  cityCenter,
  onChange,
}: {
  value: PinValue | null;
  cityCenter: PinValue | null;
  onChange: (p: PinValue) => void;
}) {
  const initial = value ?? cityCenter;
  return (
    <MapContainer
      center={initial ? [initial.lat, initial.lng] : [21.0, 57.0]}
      zoom={initial ? 11 : 6}
      scrollWheelZoom
      className="h-[300px] w-full rounded-[8px] overflow-hidden border border-border"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickToPin onPick={onChange} />
      <CityRecenter center={value ? null : cityCenter} />
      {value && (
        <Marker
          draggable
          position={[value.lat, value.lng]}
          eventHandlers={{
            dragend: (e) => {
              const p = (e.target as L.Marker).getLatLng();
              onChange({ lat: p.lat, lng: p.lng });
            },
          }}
        />
      )}
    </MapContainer>
  );
}
