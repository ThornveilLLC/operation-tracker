'use client';

import { ExternalLink, AlertTriangle } from 'lucide-react';
import { COST_ESTIMATES } from '@/lib/sources';

export default function CostTab() {
  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
        <AlertTriangle size={16} style={{ color: 'var(--accent-orange)', flexShrink: 0, marginTop: '2px' }} />
        <div
          style={{
            background: '#1a1200',
            border: '1px solid var(--accent-orange)',
            borderRadius: '4px',
            padding: '10px 14px',
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '11px',
            color: 'var(--accent-orange)',
            lineHeight: 1.5,
            flex: 1,
          }}
        >
          All figures are estimates from cited sources. Actual costs are not publicly verified.
          Figures disputed by parties involved. No numbers on this page are generated or estimated by
          this application. If no verified figure exists, it is stated explicitly.
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Category', 'Estimate', 'Date of Estimate', 'Source', 'Notes'].map(col => (
                <th
                  key={col}
                  style={{
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    padding: '8px 12px',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COST_ESTIMATES.map((row, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: '1px solid var(--border)',
                  background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card)')}
                onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)')}
              >
                <td
                  style={{
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                    padding: '10px 12px',
                    maxWidth: '200px',
                  }}
                >
                  {row.category}
                </td>
                <td
                  style={{
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: '12px',
                    color: row.estimate.includes('No verified') ? 'var(--text-muted)' : 'var(--text-data)',
                    padding: '10px 12px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {row.estimate}
                </td>
                <td
                  style={{
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    padding: '10px 12px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {row.dateOfEstimate}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <a
                    href={row.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: '11px',
                      color: 'var(--accent-blue)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {row.source}
                    <ExternalLink size={9} />
                  </a>
                </td>
                <td
                  style={{
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    padding: '10px 12px',
                    fontStyle: 'italic',
                    maxWidth: '200px',
                  }}
                >
                  {row.note}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        style={{
          marginTop: '20px',
          padding: '10px 14px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: '10px',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: 'var(--text-primary)' }}>DATA SOURCES:</strong>{' '}
        SIPRI (Stockholm International Peace Research Institute), Reuters, Associated Press, US Department of Defense,
        International Monetary Fund, World Bank MENA Economic Monitor, Lloyd&apos;s Market Association.
        All source links are provided per row. No cost data is generated, estimated, or interpolated by this application.
      </div>
    </div>
  );
}
