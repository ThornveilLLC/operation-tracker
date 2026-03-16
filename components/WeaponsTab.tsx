'use client';

import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface WeaponCard {
  name: string;
  extract: string;
  thumbnail: string | null;
  wikiUrl: string;
  operator: string;
  side: string;
}

interface WeaponsData {
  coalition: WeaponCard[];
  iran: WeaponCard[];
  error?: string;
}

function WeaponCardComponent({ weapon }: { weapon: WeaponCard }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--text-muted)')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
    >
      {/* Image */}
      <div
        style={{
          width: '100%',
          height: '120px',
          background: 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {weapon.thumbnail && !imgError ? (
          <img
            src={weapon.thumbnail}
            alt={weapon.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setImgError(true)}
          />
        ) : (
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '32px', color: 'var(--border)' }}>
            ✈
          </span>
        )}
        <div
          style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            background: 'rgba(0,0,0,0.8)',
            border: '1px solid var(--border)',
            borderRadius: '2px',
            padding: '2px 6px',
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '11px',
          }}
        >
          {weapon.operator}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '10px 12px', flex: 1 }}>
        <div
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '6px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {weapon.name}
        </div>
        <div
          style={{
            fontFamily: 'IBM Plex Sans, sans-serif',
            fontSize: '11px',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            marginBottom: '10px',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {weapon.extract}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '8px 12px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px', color: 'var(--text-muted)' }}>
          Source: Wikipedia
        </span>
        <a
          href={weapon.wikiUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '10px',
            color: 'var(--accent-blue)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          Read more <ExternalLink size={9} />
        </a>
      </div>
    </div>
  );
}

export default function WeaponsTab() {
  const [data, setData] = useState<WeaponsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/weapons')
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setData({ coalition: [], iran: [], error: 'Wikipedia API unavailable' });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
              <div className="skeleton" style={{ width: '100%', height: '120px' }} />
              <div style={{ padding: '12px' }}>
                <div className="skeleton" style={{ width: '80%', height: '14px', marginBottom: '8px' }} />
                <div className="skeleton" style={{ width: '100%', height: '10px', marginBottom: '4px' }} />
                <div className="skeleton" style={{ width: '90%', height: '10px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px' }}>
      {data?.error && (
        <div style={{ padding: '10px', marginBottom: '16px', background: '#1a1200', border: '1px solid var(--accent-orange)', borderRadius: '4px', fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: 'var(--accent-orange)' }}>
          ⚠️ {data.error} — Source: Wikipedia API unavailable
        </div>
      )}

      {/* Coalition section */}
      <div style={{ marginBottom: '24px' }}>
        <div
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 700,
            fontSize: '16px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--accent-blue)',
            marginBottom: '12px',
            paddingBottom: '8px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          🇺🇸🇮🇱 COALITION — US/ISRAEL SYSTEMS
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px',
          }}
        >
          {(data?.coalition || []).map(w => (
            <WeaponCardComponent key={w.name} weapon={w} />
          ))}
          {(data?.coalition || []).length === 0 && (
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: 'var(--text-muted)', padding: '10px' }}>
              Data unavailable — Wikipedia could not be reached
            </div>
          )}
        </div>
      </div>

      {/* Iran section */}
      <div>
        <div
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 700,
            fontSize: '16px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--accent-red)',
            marginBottom: '12px',
            paddingBottom: '8px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          🇮🇷 IRAN — WEAPONS SYSTEMS
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px',
          }}
        >
          {(data?.iran || []).map(w => (
            <WeaponCardComponent key={w.name} weapon={w} />
          ))}
          {(data?.iran || []).length === 0 && (
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: 'var(--text-muted)', padding: '10px' }}>
              Data unavailable — Wikipedia could not be reached
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: '20px',
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: '9px',
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border)',
          paddingTop: '8px',
        }}
      >
        All weapon system information sourced from Wikipedia (en.wikipedia.org). Source links provided per item. Data is informational only.
      </div>
    </div>
  );
}
