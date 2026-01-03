'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
  iconUrl: '/leaflet/images/marker-icon.png',
  shadowUrl: '/leaflet/images/marker-shadow.png',
});

function ZoomHandler({ setZoom }) {
  const map = useMapEvents({
    zoomend: () => {
      setZoom(map.getZoom());
    },
  });
  return null;
}

export default function MapInner() {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(7);

  useEffect(() => {
    async function fetchMapData() {
      try {
        const response = await fetch('/api/mapData');
        if (response.ok) {
          const data = await response.json();
          setOffices(data);
        }
      } catch (error) {
        console.error('Error fetching map data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMapData();
  }, []);



  const isVisible = zoom >= 9;

  return (
    <div style={{ position: 'relative' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}>
          Loading map data...
        </div>
      )}

      <MapContainer
        center={[28.3949, 84.1240]}
        zoom={7}
        style={{ height: '600px', width: '100%' }}
      >
        <ZoomHandler setZoom={setZoom} />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {offices.map((office) => {
          if (!office.circle.show || !isVisible) return null;

          return (
            <Circle
              key={office.id}
              center={[parseFloat(office.latitude), parseFloat(office.longitude)]}
              radius={Math.sqrt(office.circle.radius) * 10}
              pathOptions={{
                fillColor: office.circle.color,
                color: office.circle.borderColor,
                weight: 1,
                opacity: 0.9,
                fillOpacity: parseFloat(office.circle.color.match(/[\d.]+\)$/)?.[0].slice(0, -1) || 0.5)
              }}
            >
              <Popup maxWidth={300}>
                <div style={{ minWidth: '250px' }}>
                  <h3 style={{
                    margin: '0 0 10px 0',
                    fontSize: '16px',
                    borderBottom: '2px solid #dc2626',
                    paddingBottom: '8px'
                  }}>
                    {office.name}
                  </h3>

                  <div style={{ marginBottom: '8px' }}>
                    <strong>Type:</strong> {office.office_type}
                  </div>

                  {office.district && (
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Location:</strong> {office.district}
                      {office.province && `, ${office.province}`}
                    </div>
                  )}

                  <div style={{
                    background: '#fee2e2',
                    padding: '10px',
                    borderRadius: '6px',
                    marginTop: '10px'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      marginBottom: '8px',
                      color: '#991b1b'
                    }}>
                      📊 GhusMeter Metrics
                    </div>

                    <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                      <div>
                        <strong>Reports:</strong> {office.report_count}
                      </div>

                      {office.avg_bribe > 0 && (
                        <div>
                          <strong>Avg Bribe:</strong> NPR {office.avg_bribe.toFixed(2)}
                        </div>
                      )}

                      {office.avg_delay > 0 && (
                        <div>
                          <strong>Avg Delay:</strong> {office.avg_delay.toFixed(0)} days
                        </div>
                      )}

                      <div style={{ marginTop: '8px' }}>
                        <strong>Severity Score:</strong>{' '}
                        <span style={{
                          color: office.normalized_score > 0.7 ? '#991b1b' :
                            office.normalized_score > 0.4 ? '#ea580c' : '#f59e0b',
                          fontWeight: 'bold'
                        }}>
                          {office.severity_score.toFixed(1)}/100
                        </span>
                      </div>
                    </div>
                  </div>

                  {office.last_report_date && (
                    <div style={{
                      marginTop: '8px',
                      fontSize: '12px',
                      color: '#666'
                    }}>
                      Last reported: {new Date(office.last_report_date).toLocaleDateString()}
                    </div>
                  )}

                  <div style={{ marginTop: '12px', textAlign: 'right' }}>
                    <Link
                      href={`/office/${office.id}`}
                      style={{
                        display: 'inline-block',
                        background: '#dc2626',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        textDecoration: 'none',
                        fontWeight: 'bold'
                      }}
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </Popup>
            </Circle>
          );
        })}
      </MapContainer>

      {isVisible && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          background: 'white',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          zIndex: 1000,
          fontSize: '13px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
            🔴 Corruption Severity
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
            <div style={{
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              background: 'rgba(255, 100, 100, 0.4)',
              border: '2px solid rgba(205, 0, 0, 0.9)'
            }}></div>
            <span>Low Severity</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
            <div style={{
              width: '25px',
              height: '25px',
              borderRadius: '50%',
              background: 'rgba(220, 50, 0, 0.6)',
              border: '2px solid rgba(170, 0, 0, 0.9)'
            }}></div>
            <span>Medium Severity</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '35px',
              height: '35px',
              borderRadius: '50%',
              background: 'rgba(200, 0, 0, 0.8)',
              border: '2px solid rgba(150, 0, 0, 0.9)'
            }}></div>
            <span>High Severity</span>
          </div>
          <div style={{ marginTop: '10px', fontSize: '11px', color: '#666' }}>
            Map auto-scales with zoom level
          </div>
        </div>
      )}

      {!isVisible && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          zIndex: 1000,
          pointerEvents: 'none'
        }}>
          Zoom in to see reports
        </div>
      )}
    </div>
  );
}
