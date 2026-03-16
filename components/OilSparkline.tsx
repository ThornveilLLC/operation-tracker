'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

interface OilData {
  data: Array<{ period: string; value: number | null }>;
  latestPrice: number | null;
  change24h: number | null;
  changePct: number | null;
  error?: string;
  label?: string;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      padding: '6px 10px', fontFamily: 'IBM Plex Mono, monospace',
      fontSize: '10px', color: 'var(--text-data)', borderRadius: '3px',
    }}>
      ${payload[0]?.value?.toFixed(2)}/bbl
    </div>
  );
}

export default function OilSparkline() {
  const [data, setData] = useState<OilData | null>(null);

  useEffect(() => {
    fetch('/api/oil').then(r => r.json()).then(setData).catch(() => null);
    const interval = setInterval(() => {
      fetch('/api/oil').then(r => r.json()).then(setData).catch(() => null);
    }, 3600000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return null;

  const latestPrice = data.latestPrice != null ? parseFloat(String(data.latestPrice)) : null;
  const change24h = data.change24h != null ? parseFloat(String(data.change24h)) : null;
  const changePct = data.changePct != null ? parseFloat(String(data.changePct)) : null;
  const up = (change24h ?? 0) >= 0;
  const color = up ? '#c0392b' : '#27ae60';
  const arrow = up ? '▲' : '▼';
  const chartData = (data.data || []).filter(d => d.value != null).map(d => ({ ...d, value: parseFloat(String(d.value)) }));

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '6px 14px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-primary)',
    }}>
      <div>
        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
          WTI CRUDE OIL
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          {latestPrice != null ? (
            <>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '18px', fontWeight: 700, color: 'var(--text-data)' }}>
                ${latestPrice.toFixed(2)}
              </span>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color }}>
                {arrow} {Math.abs(changePct ?? 0).toFixed(2)}%
              </span>
              <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '10px', color: 'var(--text-muted)' }}>
                ({change24h != null ? (up ? '+' : '') + change24h.toFixed(2) : '—'} USD)
              </span>
            </>
          ) : (
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
              {data.error ? 'Source unavailable — EIA' : 'Loading...'}
            </span>
          )}
        </div>
      </div>

      {chartData.length > 1 && (
        <div style={{ width: 120, height: 36 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="oilGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} fill="url(#oilGrad)" dot={false} />
              <Tooltip content={<CustomTooltip />} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '8px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
        Source: U.S. Energy Information Administration
      </div>
    </div>
  );
}
