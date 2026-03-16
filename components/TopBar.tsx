'use client';

import { useEffect, useState, useRef } from 'react';
import { ExternalLink } from 'lucide-react';

interface OilData {
  latestPrice: number | null;
  change24h: number | null;
  changePct: number | null;
  error?: string;
  label?: string;
  source?: string;
}

interface NewsItem {
  id: string;
  title: string;
  link: string;
  source: string;
}

export default function TopBar() {
  const [utcTime, setUtcTime] = useState('');
  const [oilData, setOilData] = useState<OilData | null>(null);
  const [headlines, setHeadlines] = useState<NewsItem[]>([]);
  const [lastRefresh, setLastRefresh] = useState<string>('');

  // Live UTC clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setUtcTime(
        now.toUTCString().replace('GMT', 'UTC').replace(/^.*?,\s/, '')
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch oil price
  useEffect(() => {
    const fetchOil = async () => {
      try {
        const res = await fetch('/api/oil');
        const data = await res.json();
        setOilData(data);
      } catch {
        setOilData({ latestPrice: null, change24h: null, changePct: null, error: 'Unavailable' });
      }
    };
    fetchOil();
    const interval = setInterval(fetchOil, 3600000); // every hour
    return () => clearInterval(interval);
  }, []);

  // Fetch headlines for ticker
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/news');
        const data = await res.json();
        const items = [...(data.news || []), ...(data.official || [])].slice(0, 20);
        setHeadlines(items);
        setLastRefresh(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' UTC');
      } catch {
        // silent fail
      }
    };
    fetchNews();
    const interval = setInterval(fetchNews, 300000); // every 5 min
    return () => clearInterval(interval);
  }, []);

  const tickerText = headlines.length > 0
    ? headlines.map(h => `${h.source.toUpperCase()}: ${h.title}`).join('   ///   ')
    : 'Fetching latest intelligence feeds...';

  const oilColor = oilData?.change24h !== null && oilData?.change24h !== undefined
    ? (oilData.change24h >= 0 ? '#c0392b' : '#27ae60')
    : 'var(--text-muted)';
  const oilArrow = oilData?.change24h !== null && oilData?.change24h !== undefined
    ? (oilData.change24h >= 0 ? '▲' : '▼')
    : '';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '48px',
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Left: Brand + clock */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '0 14px',
          borderRight: '1px solid var(--border)',
          minWidth: '280px',
          flexShrink: 0,
        }}
      >
        <span
          className="pulse-red"
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--accent-red)',
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 700,
            fontSize: '16px',
            letterSpacing: '0.12em',
            color: 'var(--text-primary)',
            textTransform: 'uppercase',
          }}
        >
          OPERATION TRACKER
        </span>
        <span
          style={{
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '10px',
            color: 'var(--text-muted)',
            marginLeft: '4px',
          }}
        >
          {utcTime}
        </span>
      </div>

      {/* Center: Ticker */}
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div className="ticker-content" style={{ display: 'inline-block' }}>
          <span
            style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '11px',
              color: 'var(--text-muted)',
              paddingRight: '80px',
            }}
          >
            {tickerText}
          </span>
          <span
            style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '11px',
              color: 'var(--text-muted)',
              paddingRight: '80px',
            }}
          >
            {tickerText}
          </span>
        </div>
      </div>

      {/* Right: Oil + refresh */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '0 14px',
          borderLeft: '1px solid var(--border)',
          minWidth: '220px',
          flexShrink: 0,
          justifyContent: 'flex-end',
        }}
      >
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '10px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            WTI CRUDE
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', justifyContent: 'flex-end' }}>
            {oilData?.latestPrice != null ? (
              <>
                <span
                  style={{
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: '14px',
                    color: 'var(--text-data)',
                    fontWeight: 600,
                  }}
                >
                  ${parseFloat(String(oilData.latestPrice)).toFixed(2)}
                </span>
                {oilArrow && (
                  <span
                    style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: '11px',
                      color: oilColor,
                    }}
                  >
                    {oilArrow} {Math.abs(parseFloat(String(oilData.changePct ?? 0))).toFixed(2)}%
                  </span>
                )}
              </>
            ) : (
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
                {oilData?.error ? '— Source unavailable' : '...'}
              </span>
            )}
          </div>
        </div>

        {lastRefresh && (
          <div
            style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '9px',
              color: 'var(--text-muted)',
              borderLeft: '1px solid var(--border)',
              paddingLeft: '12px',
            }}
          >
            <div>REFRESHED</div>
            <div style={{ color: 'var(--text-primary)' }}>{lastRefresh}</div>
          </div>
        )}
      </div>
    </div>
  );
}
