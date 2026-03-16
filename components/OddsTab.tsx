'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, AlertTriangle } from 'lucide-react';

interface Market {
  id: string;
  question: string;
  slug?: string;
  yesPrice: number | null;
  noPrice: number | null;
  volume?: number;
  endDate?: string;
}

interface OddsData {
  markets: Market[];
  error?: string;
  disclaimer?: string;
}

function OddsCard({ market }: { market: Market }) {
  const yes = market.yesPrice;
  const polyUrl = market.slug
    ? `https://polymarket.com/event/${market.slug}`
    : 'https://polymarket.com';

  const riskColor = yes === null ? 'var(--text-muted)'
    : yes >= 70 ? '#c0392b'
    : yes >= 40 ? '#e67e22'
    : '#27ae60';

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--text-muted)')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
    >
      <div
        style={{
          fontFamily: 'IBM Plex Sans, sans-serif',
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          lineHeight: 1.4,
        }}
      >
        {market.question}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
        {yes !== null ? (
          <>
            <div>
              <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '2px' }}>YES</div>
              <div
                style={{
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: '28px',
                  fontWeight: 700,
                  color: riskColor,
                  lineHeight: 1,
                }}
              >
                {yes.toFixed(1)}%
              </div>
            </div>
            {market.noPrice !== null && (
              <div>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px', color: 'var(--text-muted)', marginBottom: '2px' }}>NO</div>
                <div
                  style={{
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: '18px',
                    color: 'var(--text-muted)',
                    lineHeight: 1,
                  }}
                >
                  {market.noPrice.toFixed(1)}%
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '14px', color: 'var(--text-muted)' }}>
            Price unavailable
          </div>
        )}

        {market.volume !== undefined && market.volume > 0 && (
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px', color: 'var(--text-muted)' }}>VOL</div>
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
              ${(market.volume / 1000).toFixed(0)}K
            </div>
          </div>
        )}
      </div>

      {/* Probability bar */}
      {yes !== null && (
        <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${yes}%`,
              height: '100%',
              background: riskColor,
              transition: 'width 0.5s',
            }}
          />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {market.endDate && (
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px', color: 'var(--text-muted)' }}>
            Closes: {new Date(market.endDate).toLocaleDateString()}
          </span>
        )}
        <a
          href={polyUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginLeft: 'auto',
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '10px',
            color: 'var(--accent-blue)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          View on Polymarket <ExternalLink size={9} />
        </a>
      </div>
    </div>
  );
}

export default function OddsTab() {
  const [data, setData] = useState<OddsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/odds')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setData({ markets: [], error: 'Polymarket API unavailable' }); setLoading(false); });
  }, []);

  return (
    <div style={{ padding: '16px' }}>
      <div
        style={{
          marginBottom: '16px',
          padding: '10px 14px',
          background: '#0d1a0d',
          border: '1px solid var(--accent-green)',
          borderRadius: '4px',
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: '11px',
          color: '#6fcf97',
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-start',
        }}
      >
        <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
        <span>
          {data?.disclaimer || 'Prediction markets reflect crowd speculation only — not intelligence assessments. Not financial advice. Source: Polymarket.com'}
        </span>
      </div>

      {data?.error && (
        <div
          style={{
            marginBottom: '16px',
            padding: '10px 14px',
            background: '#1a1200',
            border: '1px solid var(--accent-orange)',
            borderRadius: '4px',
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '11px',
            color: 'var(--accent-orange)',
          }}
        >
          ⚠️ {data.error} — Source unavailable
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', padding: '16px' }}>
              <div className="skeleton" style={{ width: '100%', height: '12px', marginBottom: '8px' }} />
              <div className="skeleton" style={{ width: '60%', height: '28px', marginBottom: '8px' }} />
              <div className="skeleton" style={{ width: '100%', height: '3px' }} />
            </div>
          ))}
        </div>
      ) : !data?.markets || data.markets.length === 0 ? (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '12px',
            color: 'var(--text-muted)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
          }}
        >
          No active markets found on Polymarket for this topic at this time.
          <br />
          <a
            href="https://polymarket.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent-blue)', marginTop: '8px', display: 'inline-block' }}
          >
            Browse Polymarket directly →
          </a>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {data.markets.map(m => <OddsCard key={m.id} market={m} />)}
        </div>
      )}
    </div>
  );
}
