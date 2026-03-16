'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { getEventColor } from '@/lib/sources';
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

function PopupContent({ event }: { event: AcledEvent }) {
  return (
    <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: 'var(--text-primary)', maxWidth: '260px' }}>
      <div style={{ fontWeight: 700, color: getEventColor(event.event_type), marginBottom: '6px', fontSize: '12px' }}>
        {event.event_type}
        {event.sub_event_type && ` — ${event.sub_event_type}`}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ color: '#6b7a8d', paddingRight: '8px', verticalAlign: 'top' }}>Location:</td>
            <td>{event.location}, {event.country}</td>
          </tr>
          <tr>
            <td style={{ color: '#6b7a8d', paddingRight: '8px', verticalAlign: 'top' }}>Date:</td>
            <td>{event.event_date}</td>
          </tr>
          {event.actor1 && (
            <tr>
              <td style={{ color: '#6b7a8d', paddingRight: '8px', verticalAlign: 'top' }}>Actor 1:</td>
              <td>{event.actor1}</td>
            </tr>
          )}
          {event.actor2 && (
            <tr>
              <td style={{ color: '#6b7a8d', paddingRight: '8px', verticalAlign: 'top' }}>Actor 2:</td>
              <td>{event.actor2}</td>
            </tr>
          )}
          <tr>
            <td style={{ color: '#6b7a8d', paddingRight: '8px', verticalAlign: 'top' }}>Fatalities:</td>
            <td>
              <span style={{ color: event.fatalities && event.fatalities !== '0' ? '#c0392b' : 'inherit' }}>
                {event.fatalities ?? '—'}
              </span>
              {' '}
              <span style={{ color: '#6b7a8d', fontSize: '9px' }}>(Source: ACLED)</span>
              {' '}
              <span style={{ color: '#6b7a8d', fontSize: '9px' }}>(Figures disputed)</span>
            </td>
          </tr>
        </tbody>
      </table>
      {event.notes && (
        <div style={{ marginTop: '6px', borderTop: '1px solid #1e2530', paddingTop: '6px', fontSize: '10px', color: '#6b7a8d', lineHeight: 1.4 }}>
          {event.notes.slice(0, 200)}{event.notes.length > 200 ? '...' : ''}
        </div>
      )}
      {event.source && (
        <div style={{ marginTop: '4px', fontSize: '9px', color: '#444' }}>
          Source: {event.source} via ACLED
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
        const radius = Math.min(4 + Math.sqrt(fatalities) * 1.5, 20);

        return (
          <CircleMarker
            key={`${idx}-${event.event_date}-${event.location}`}
            center={[lat, lng]}
            radius={radius}
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: 0.7,
              weight: 1,
              opacity: 0.9,
            }}
          >
            <Popup>
              <PopupContent event={event} />
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
