'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getEventColor } from '@/lib/sources';

// Leaflet must be dynamically imported (no SSR) because it uses window
const MapWithNoSSR = dynamic(() => import('./MapInner'), { ssr: false });

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

interface EventsData {
  events: AcledEvent[];
  error?: string;
  message?: string;
}

const EVENT_TYPES = [
  { type: 'Air/drone strike', label: 'Airstrikes', color: '#c0392b' },
  { type: 'Armed clash', label: 'Armed Clashes', color: '#2980b9' },
  { type: 'Shelling/artillery/missile attack', label: 'Missiles/Shelling', color: '#e67e22' },
  { type: 'Explosion/remote violence', label: 'Explosions', color: '#f1c40f' },
  { type: 'Protests', label: 'Protests/Unrest', color: '#8e44ad' },
];

const COUNTRIES = ['Iran', 'Israel', 'Yemen', 'Lebanon', 'Syria'];

export default function ConflictMap() {
  const [eventsData, setEventsData] = useState<EventsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set(EVENT_TYPES.map(e => e.type)));
  const [activeCountries, setActiveCountries] = useState<Set<string>>(new Set(COUNTRIES));

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/events');
        const data = await res.json();
        setEventsData(data);
      } catch {
        setEventsData({ events: [], error: 'Failed to fetch events', message: 'Network error' });
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = (eventsData?.events || []).filter(e => {
    const matchesType = Array.from(activeTypes).some(t =>
      e.event_type?.toLowerCase().includes(t.toLowerCase()) ||
      e.sub_event_type?.toLowerCase().includes(t.toLowerCase())
    );
    const matchesCountry = activeCountries.has(e.country);
    return matchesType && matchesCountry;
  });

  const toggleType = (type: string) => {
    setActiveTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const toggleCountry = (country: string) => {
    setActiveCountries(prev => {
      const next = new Set(prev);
      if (next.has(country)) next.delete(country);
      else next.add(country);
      return next;
    });
  };

  const noKey = eventsData?.error?.includes('not configured');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Filter bar */}
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          alignItems: 'center',
        }}
      >
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '10px', color: 'var(--text-muted)', marginRight: '4px' }}>
          FILTER:
        </span>
        {EVENT_TYPES.map(et => (
          <button
            key={et.type}
            onClick={() => toggleType(et.type)}
            style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '9px',
              padding: '2px 8px',
              border: `1px solid ${activeTypes.has(et.type) ? et.color : 'var(--border)'}`,
              background: activeTypes.has(et.type) ? `${et.color}22` : 'transparent',
              color: activeTypes.has(et.type) ? et.color : 'var(--text-muted)',
              borderRadius: '2px',
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: et.color, display: 'inline-block' }} />
            {et.label}
          </button>
        ))}
        <span style={{ borderLeft: '1px solid var(--border)', height: '14px', margin: '0 4px' }} />
        {COUNTRIES.map(c => (
          <button
            key={c}
            onClick={() => toggleCountry(c)}
            style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '9px',
              padding: '2px 8px',
              border: `1px solid ${activeCountries.has(c) ? 'var(--text-data)' : 'var(--border)'}`,
              background: activeCountries.has(c) ? 'rgba(168,216,234,0.1)' : 'transparent',
              color: activeCountries.has(c) ? 'var(--text-data)' : 'var(--text-muted)',
              borderRadius: '2px',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {c.toUpperCase()}
          </button>
        ))}
        {!loading && (
          <span style={{ marginLeft: 'auto', fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px', color: 'var(--text-muted)' }}>
            {filteredEvents.length} EVENTS
          </span>
        )}
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        {noKey && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              background: '#1a1200',
              border: '1px solid var(--accent-orange)',
              color: 'var(--accent-orange)',
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '11px',
              padding: '8px 16px',
              borderRadius: '4px',
              textAlign: 'center',
              maxWidth: '400px',
            }}
          >
            ⚠️ Map requires a free ACLED API key.<br />
            See README for setup instructions.
          </div>
        )}

        {loading ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              background: '#0d1117',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div className="skeleton" style={{ width: '120px', height: '12px' }} />
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
              Loading conflict data...
            </span>
          </div>
        ) : (
          <MapWithNoSSR events={filteredEvents} />
        )}

        {/* Legend */}
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '10px',
            zIndex: 500,
            background: 'rgba(10,12,15,0.92)',
            border: '1px solid var(--border)',
            padding: '8px 12px',
            borderRadius: '4px',
          }}
        >
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Event Legend
          </div>
          {EVENT_TYPES.map(et => (
            <div key={et.type} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: et.color, display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px', color: 'var(--text-muted)' }}>{et.label}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: '6px', paddingTop: '4px', fontFamily: 'IBM Plex Mono, monospace', fontSize: '8px', color: '#444' }}>
            Source: ACLED
          </div>
        </div>
      </div>

      {/* ACLED attribution */}
      <div
        style={{
          padding: '4px 12px',
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: '9px',
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>ACLED Data — Armed Conflict Location & Event Data Project | © OpenStreetMap contributors © CARTO</span>
        <a
          href="https://acleddata.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}
        >
          acleddata.com →
        </a>
      </div>
    </div>
  );
}
