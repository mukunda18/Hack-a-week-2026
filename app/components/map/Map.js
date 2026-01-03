"use client"; // MUST be the very first line

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function Map() {
  // Dummy Ghuss data
  const ghussData = [
    { lat: 27.700769, lng: 85.300140, intensity: 5, description: "Office 1 Ghuss" },
    { lat: 27.701500, lng: 85.302000, intensity: 8, description: "Office 2 Ghuss" },
    { lat: 27.699500, lng: 85.299000, intensity: 3, description: "Office 3 Ghuss" },
  ];

  return (
    <div style={{ width: "75%", height: "400px", margin: "0 auto" }}>
      <MapContainer
        center={[27.700769, 85.300140]}
        zoom={15}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {ghussData.map((point, idx) => (
          <CircleMarker
            key={idx}
            center={[point.lat, point.lng]}
            radius={point.intensity * 2}
            color="red"
            fillColor="red"
            fillOpacity={0.5}
          >
            <Popup>
              <strong>{point.description}</strong>
              <br />
              Intensity: {point.intensity}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
