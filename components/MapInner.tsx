'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { getEventColor } from '@/lib/sources';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface AcledEvent {
  event_date: string;
  event_type: string;
  sub_event_type: string;
  actor1: string;
  actor2: string;
  country: string;
  location: string;
  latitude: string;
  longitude: string;
  fatalities: string;
  notes: string;
  source: string;
}

interface Props {
  events: AcledEvent[];
}

// Inject pulsing CSS into leaflet map
function PulseStyle() {
  const map = useMap();
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ripple {
        0% { transform: scale(1); opacity: 0.8; }
        100% { transform: scale(3); opacity: 0; }
      }
      .pulse-marker {
        border-radius: 50%;
        position: relative;
      }
      .pulse-marker::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 50%;
        animation: ripple 2s ease-out infinite;
        border: 2px solid currentColor;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);
  return null;
}

function PopupContent({ event }: { event: AcledEvent }) {
  const color = getEventColor(event.event_type);
  return (
    <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: '#e8eaf0', maxWidth: '260px' }}>
      <div style={{
        fontWeight: 700, color, marginBottom: '8px', fontSize: '12px',
        paddingBottom: '6px', borderBottom: '1px solid #1e2530',
        display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
        {event.event_type}
        {event.sub_event_type && ` — ${event.sub_event_type}`}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {(
            [
              ['Location', `${event.location}, ${event.country}`],
              ['Date', event.event_date],
              ...(event.actor1 ? [['Actor 1', event.actor1]] : []),
              ...(event.actor2 ? [['Actor 2', event.actor2]] : []),
            ] as [string, string][]
          ).map(([k, v]) => (
            <tr key={k}>
              <td style={{ color: '#6b7a8d', paddingRight: '8px', paddingBottom: '3px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{k}:</td>
              <td style={{ paddingBottom: '3px' }}>{v}</td>
            </tr>
          ))}
          <tr>
            <td style={{ color: '#6b7a8d', paddingRight: '8px', verticalAlign: 'top' }}>Fatalities:</td>
            <td>
              <span style={{ color: parseInt(event.fatalities) > 0 ? '#c0392b' : '#e8eaf0', fontWeight: 700 }}>
                {event.fatalities ?? '—'}
              </span>
              <span style={{ color: '#6b7a8d', fontSize: '9px', marginLeft: '4px' }}>(ACLED · disputed)</span>
            </td>
          </tr>
        </tbody>
      </table>
      {event.notes && (
        <div style={{ marginTop: '8px', borderTop: '1px solid #1e2530', paddingTop: '6px', fontSize: '10px', color: '#6b7a8d', lineHeight: 1.4 }}>
          {event.notes.slice(0, 200)}{event.notes.length > 200 ? '…' : ''}
        </div>
      )}
      {event.source && (
        <div style={{ marginTop: '4px', fontSize: '9px', color: '#3a3a3a' }}>
          via {event.source} / ACLED
        </div>
      )}
    </div>
  );
}

export default function MapInner({ events }: Props) {
  return (
    <MapContainer
      center={[29.0, 44.0]}
      zoom={5}
      style={{ height: '100%', width: '100%', background: '#0d1117' }}
      zoomControl={true}
    >
      <PulseStyle />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        maxZoom={19}
      />

      {events.map((event, idx) => {
        const lat = parseFloat(event.latitude);
        const lng = parseFloat(event.longitude);
        if (isNaN(lat) || isNaN(lng)) return null;

        const color = getEventColor(event.event_type || event.sub_event_type || '');
        const fatalities = parseInt(event.fatalities) || 0;
        const baseRadius = 4 + Math.sqrt(fatalities) * 1.5;
        const radius = Math.min(baseRadius, 22);
        const isHighFatality = fatalities > 10;

        return (
          <CircleMarker
            key={`${idx}-${event.event_date}-${event.location}`}
            center={[lat, lng]}
            radius={radius}
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: isHighFatality ? 0.85 : 0.65,
              weight: isHighFatality ? 2 : 1,
              opacity: 1,
            }}
          >
            <Popup>
              <PopupContent event={event} />
            </Popup>
          </CircleMarker>
        );
      })}

      {/* Outer pulse rings for high-fatality events */}
      {events.map((event, idx) => {
        const lat = parseFloat(event.latitude);
        const lng = parseFloat(event.longitude);
        if (isNaN(lat) || isNaN(lng)) return null;
        const fatalities = parseInt(event.fatalities) || 0;
        if (fatalities < 10) return null;

        const color = getEventColor(event.event_type || '');
        return (
          <CircleMarker
            key={`pulse-${idx}`}
            center={[lat, lng]}
            radius={Math.min(6 + Math.sqrt(fatalities) * 2, 30)}
            pathOptions={{
              color: color,
              fillColor: 'transparent',
              fillOpacity: 0,
              weight: 1,
              opacity: 0.3,
              dashArray: '4 4',
            }}
            interactive={false}
          />
        );
      })}
    </MapContainer>
  );
}
