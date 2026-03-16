'use client';

import { useEffect, useState } from 'react';
import { Download, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';
import { getEventColor } from '@/lib/sources';

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

type SortKey = 'event_date' | 'location' | 'fatalities' | 'event_type' | 'country';

function exportCSV(events: AcledEvent[]) {
  const headers = ['Date', 'Location', 'Country', 'Event Type', 'Sub-event Type', 'Actor 1', 'Actor 2', 'Fatalities', 'Source'];
  const rows = events.map(e => [
    e.event_date,
    e.location,
    e.country,
    e.event_type,
    e.sub_event_type,
    e.actor1,
    e.actor2,
    e.fatalities,
    e.source,
  ]);
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `operation-tracker-events-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function StrikeLogTab() {
  const [events, setEvents] = useState<AcledEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('event_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const PER_PAGE = 50;

  useEffect(() => {
    fetch('/api/events')
      .then(r => r.json())
      .then(data => {
        if (data.error && data.events?.length === 0) {
          setError(data.message || data.error);
        }
        setEvents(data.events || []);
        setLoading(false);
      })
      .catch(() => {
        setError('ACLED API unavailable — data could not be retrieved');
        setLoading(false);
      });
  }, []);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
    setPage(0);
  };

  const filtered = events.filter(e =>
    !search ||
    e.location?.toLowerCase().includes(search.toLowerCase()) ||
    e.event_type?.toLowerCase().includes(search.toLowerCase()) ||
    e.actor1?.toLowerCase().includes(search.toLowerCase()) ||
    e.country?.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let av = a[sortKey] ?? '';
    let bv = b[sortKey] ?? '';
    if (sortKey === 'fatalities') {
      const numA = parseInt(av as string) || 0;
      const numB = parseInt(bv as string) || 0;
      return sortDir === 'asc' ? numA - numB : numB - numA;
    }
    return sortDir === 'asc'
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  const paginated = sorted.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const totalPages = Math.ceil(sorted.length / PER_PAGE);

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronUp size={10} style={{ opacity: 0.2 }} />;
    return sortDir === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />;
  }

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search location, event type, actor..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          style={{
            flex: 1,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '3px',
            padding: '6px 10px',
            color: 'var(--text-primary)',
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '11px',
            outline: 'none',
          }}
        />
        <button
          onClick={() => exportCSV(sorted)}
          disabled={sorted.length === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '3px',
            color: 'var(--accent-green)',
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '11px',
            padding: '6px 12px',
            cursor: 'pointer',
            opacity: sorted.length === 0 ? 0.4 : 1,
          }}
        >
          <Download size={12} />
          Export CSV
        </button>
      </div>

      {error && (
        <div
          style={{
            marginBottom: '12px',
            padding: '10px 14px',
            background: '#1a1200',
            border: '1px solid var(--accent-orange)',
            borderRadius: '4px',
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '11px',
            color: 'var(--accent-orange)',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <div
        style={{
          marginBottom: '8px',
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: '10px',
          color: 'var(--text-muted)',
        }}
      >
        {filtered.length} events matched · Page {page + 1}/{Math.max(1, totalPages)} · Source: ACLED
        {' '}(Figures cited from original sources, may be disputed)
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {[
                { key: 'event_date', label: 'Date' },
                { key: 'location', label: 'Location' },
                { key: 'country', label: 'Country' },
                { key: 'event_type', label: 'Event Type' },
                { key: null, label: 'Actor' },
                { key: 'fatalities', label: 'Fatalities' },
                { key: null, label: 'Source' },
              ].map(col => (
                <th
                  key={col.label}
                  onClick={() => col.key && handleSort(col.key as SortKey)}
                  style={{
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: '10px',
                    fontWeight: 700,
                    color: sortKey === col.key ? 'var(--text-primary)' : 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    padding: '8px 10px',
                    textAlign: 'left',
                    cursor: col.key ? 'pointer' : 'default',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {col.label}
                    {col.key && <SortIcon col={col.key as SortKey} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} style={{ padding: '8px 10px' }}>
                      <div className="skeleton" style={{ width: '80%', height: '10px' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '30px', textAlign: 'center', fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
                  {error ? 'ACLED API key required. See README for setup.' : 'No events match current filters.'}
                </td>
              </tr>
            ) : (
              paginated.map((event, idx) => {
                const color = getEventColor(event.event_type);
                const fatalities = parseInt(event.fatalities) || 0;
                return (
                  <tr
                    key={`${idx}-${event.event_date}-${event.location}`}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card)')}
                    onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)')}
                  >
                    <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: 'var(--text-muted)', padding: '8px 10px', whiteSpace: 'nowrap' }}>
                      {event.event_date}
                    </td>
                    <td style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: '12px', color: 'var(--text-primary)', padding: '8px 10px' }}>
                      {event.location}
                    </td>
                    <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '10px', color: 'var(--text-muted)', padding: '8px 10px' }}>
                      {event.country}
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <span
                        style={{
                          fontFamily: 'IBM Plex Mono, monospace',
                          fontSize: '10px',
                          color: color,
                          background: `${color}18`,
                          border: `1px solid ${color}44`,
                          borderRadius: '2px',
                          padding: '1px 6px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {event.event_type}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: '11px', color: 'var(--text-muted)', padding: '8px 10px', maxWidth: '150px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {event.actor1}
                        {event.actor2 && ` vs ${event.actor2}`}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '12px', padding: '8px 10px', whiteSpace: 'nowrap', textAlign: 'center' }}>
                      <span style={{ color: fatalities > 0 ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                        {event.fatalities ?? '—'}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      {event.source ? (
                        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px', color: 'var(--text-muted)' }}>
                          {event.source.slice(0, 40)}
                        </span>
                      ) : (
                        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px', color: 'var(--border)' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center', justifyContent: 'center' }}>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '3px',
              padding: '4px 12px', color: 'var(--text-muted)', fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '11px', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.4 : 1,
            }}
          >
            ← PREV
          </button>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '3px',
              padding: '4px 12px', color: 'var(--text-muted)', fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '11px', cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer', opacity: page === totalPages - 1 ? 0.4 : 1,
            }}
          >
            NEXT →
          </button>
        </div>
      )}
    </div>
  );
}
