'use client';

import { useEffect, useState } from 'react';

interface StatCard {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  pulse?: boolean;
}

export default function StatsBar({ events }: { events: any[] }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimated(true), 100);
  }, []);

  const totalEvents = events.length;
  const totalFatalities = events.reduce((sum, e) => sum + (parseInt(e.fatalities) || 0), 0);
  const airstrikes = events.filter(e =>
    e.event_type?.toLowerCase().includes('air') || e.sub_event_type?.toLowerCase().includes('air')
  ).length;
  const missiles = events.filter(e =>
    e.event_type?.toLowerCase().includes('shell') || e.sub_event_type?.toLowerCase().includes('missile')
  ).length;
  const clashes = events.filter(e => e.event_type?.toLowerCase().includes('clash')).length;
  const countries = [...new Set(events.map(e => e.country))].length;

  const stats: StatCard[] = [
    { label: 'TOTAL EVENTS', value: totalEvents || '—', sub: 'ACLED confirmed', color: '#a8d8ea', pulse: false },
    { label: 'FATALITIES', value: totalFatalities || '—', sub: 'cited · disputed', color: '#c0392b', pulse: true },
    { label: 'AIRSTRIKES', value: airstrikes || '—', sub: 'incl. drone', color: '#e67e22', pulse: false },
    { label: 'MISSILE/SHELL', value: missiles || '—', sub: 'confirmed', color: '#f1c40f', pulse: false },
    { label: 'ARMED CLASHES', value: clashes || '—', sub: 'ground events', color: '#2980b9', pulse: false },
    { label: 'COUNTRIES', value: countries || '—', sub: 'affected', color: '#8e44ad', pulse: false },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
      }}
    >
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          style={{
            padding: '10px 14px',
            borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Accent glow bar at top */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: stat.color,
              opacity: animated ? 0.8 : 0,
              transition: `opacity 0.6s ease ${i * 0.08}s`,
            }}
          />
          <div
            style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '9px',
              color: 'var(--text-muted)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}
          >
            {stat.label}
          </div>
          <div
            style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '22px',
              fontWeight: 700,
              color: stat.color,
              lineHeight: 1,
              marginBottom: '3px',
              opacity: animated ? 1 : 0,
              transform: animated ? 'translateY(0)' : 'translateY(6px)',
              transition: `all 0.5s ease ${i * 0.08 + 0.1}s`,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {stat.value.toLocaleString()}
            {stat.pulse && stat.value !== '—' && (
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: stat.color,
                  display: 'inline-block',
                  animation: 'pulse-red 1.5s ease-in-out infinite',
                }}
              />
            )}
          </div>
          <div
            style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '9px',
              color: 'var(--text-muted)',
              opacity: 0.6,
            }}
          >
            {stat.sub}
          </div>
        </div>
      ))}
    </div>
  );
}
