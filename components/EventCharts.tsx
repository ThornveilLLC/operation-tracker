'use client';

import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';

interface AcledEvent {
  event_date: string;
  event_type: string;
  country: string;
  fatalities: string;
}

interface Props {
  events: AcledEvent[];
}

const COLORS = {
  'Air/drone strike': '#c0392b',
  'Armed clash': '#2980b9',
  'Shelling/artillery/missile attack': '#e67e22',
  'Explosion/remote violence': '#f1c40f',
  'Protests': '#8e44ad',
  'Other': '#6b7a8d',
};

const COUNTRY_COLORS: Record<string, string> = {
  Iran: '#c0392b',
  Israel: '#2980b9',
  Yemen: '#e67e22',
  Lebanon: '#27ae60',
  Syria: '#8e44ad',
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      padding: '8px 12px',
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: '11px',
      color: 'var(--text-primary)',
      borderRadius: '3px',
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color || 'var(--text-data)' }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
}

function ChartTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: 'Rajdhani, sans-serif',
      fontWeight: 700,
      fontSize: '12px',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      marginBottom: '10px',
    }}>
      {children}
    </div>
  );
}

export default function EventCharts({ events }: Props) {
  // Events per week (last 12 weeks)
  const weeklyData = useMemo(() => {
    const weeks: Record<string, { week: string; events: number; fatalities: number }> = {};
    events.forEach(e => {
      const d = new Date(e.event_date);
      if (isNaN(d.getTime())) return;
      // Get Monday of the week
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      const key = monday.toISOString().split('T')[0];
      if (!weeks[key]) weeks[key] = { week: key.slice(5), events: 0, fatalities: 0 };
      weeks[key].events++;
      weeks[key].fatalities += parseInt(e.fatalities) || 0;
    });
    return Object.values(weeks).sort((a, b) => a.week.localeCompare(b.week)).slice(-12);
  }, [events]);

  // Event type breakdown
  const typeData = useMemo(() => {
    const types: Record<string, number> = {};
    events.forEach(e => {
      const t = e.event_type || 'Other';
      types[t] = (types[t] || 0) + 1;
    });
    return Object.entries(types)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [events]);

  // Events by country
  const countryData = useMemo(() => {
    const countries: Record<string, { events: number; fatalities: number }> = {};
    events.forEach(e => {
      const c = e.country || 'Unknown';
      if (!countries[c]) countries[c] = { events: 0, fatalities: 0 };
      countries[c].events++;
      countries[c].fatalities += parseInt(e.fatalities) || 0;
    });
    return Object.entries(countries)
      .map(([country, data]) => ({ country, ...data }))
      .sort((a, b) => b.events - a.events);
  }, [events]);

  // Fatality trend (cumulative)
  const fatalityTrend = useMemo(() => {
    let cumulative = 0;
    return weeklyData.map(w => {
      cumulative += w.fatalities;
      return { ...w, cumulative };
    });
  }, [weeklyData]);

  const noData = events.length === 0;

  const emptyOverlay = (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontFamily: 'IBM Plex Mono, monospace',
      fontSize: '11px', color: 'var(--text-muted)',
    }}>
      ACLED key required — see README
    </div>
  );

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: 'auto auto',
      gap: '1px',
      background: 'var(--border)',
      borderTop: '1px solid var(--border)',
    }}>

      {/* Chart 1: Weekly Event Frequency */}
      <div style={{ background: 'var(--bg-secondary)', padding: '16px', position: 'relative' }}>
        <ChartTitle>Strike Frequency — Weekly Events</ChartTitle>
        {noData && emptyOverlay}
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weeklyData} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="week"
              tick={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, fill: '#6b7a8d' }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, fill: '#6b7a8d' }}
              axisLine={false} tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="events" name="Events" fill="#c0392b" radius={[2, 2, 0, 0]} opacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Source: ACLED · (Figures disputed)
        </div>
      </div>

      {/* Chart 2: Event Type Donut */}
      <div style={{ background: 'var(--bg-secondary)', padding: '16px', position: 'relative' }}>
        <ChartTitle>Event Type Breakdown</ChartTitle>
        {noData && emptyOverlay}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ResponsiveContainer width={140} height={140}>
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
              >
                {typeData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={Object.values(COLORS)[index] || '#6b7a8d'}
                    opacity={0.9}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ flex: 1 }}>
            {typeData.map((entry, i) => (
              <div key={entry.name} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                marginBottom: '5px',
              }}>
                <span style={{
                  width: '8px', height: '8px', borderRadius: '2px', flexShrink: 0,
                  background: Object.values(COLORS)[i] || '#6b7a8d',
                }} />
                <span style={{
                  fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px',
                  color: 'var(--text-muted)', flex: 1,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {entry.name.length > 20 ? entry.name.slice(0, 20) + '…' : entry.name}
                </span>
                <span style={{
                  fontFamily: 'IBM Plex Mono, monospace', fontSize: '10px',
                  color: 'var(--text-data)', fontWeight: 700,
                }}>
                  {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart 3: Cumulative Fatality Trend */}
      <div style={{ background: 'var(--bg-secondary)', padding: '16px', position: 'relative' }}>
        <ChartTitle>Cumulative Fatalities — Trend</ChartTitle>
        <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px', color: '#c0392b', marginBottom: '6px' }}>
          ⚠ Cited from ACLED sources · Figures disputed
        </div>
        {noData && emptyOverlay}
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={fatalityTrend} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="fatalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c0392b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#c0392b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="week"
              tick={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, fill: '#6b7a8d' }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, fill: '#6b7a8d' }}
              axisLine={false} tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="cumulative"
              name="Cumulative fatalities"
              stroke="#c0392b"
              strokeWidth={2}
              fill="url(#fatalGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 4: Events by Country */}
      <div style={{ background: 'var(--bg-secondary)', padding: '16px', position: 'relative' }}>
        <ChartTitle>Events by Country</ChartTitle>
        {noData && emptyOverlay}
        <ResponsiveContainer width="100%" height={160}>
          <BarChart
            data={countryData}
            layout="vertical"
            margin={{ top: 0, right: 40, left: 10, bottom: 0 }}
          >
            <XAxis
              type="number"
              tick={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, fill: '#6b7a8d' }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="country"
              tick={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, fill: '#a8d8ea' }}
              axisLine={false} tickLine={false} width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="events" name="Events" radius={[0, 2, 2, 0]}>
              {countryData.map((entry) => (
                <Cell
                  key={entry.country}
                  fill={COUNTRY_COLORS[entry.country] || '#6b7a8d'}
                  opacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
