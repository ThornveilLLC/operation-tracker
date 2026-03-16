'use client';

import { useState } from 'react';
import { ExternalLink, RefreshCw, DollarSign } from 'lucide-react';
import { FUNDING_EVENTS } from '@/lib/sources';

const CATEGORY_COLORS: Record<string, string> = {
  'US Aid': '#2980b9',
  'Sanctions': '#e67e22',
  'Defense Budget': '#c0392b',
  'Proxy Funding': '#8e44ad',
  'Humanitarian': '#27ae60',
};

const ALL_CATEGORIES = ['US Aid', 'Sanctions', 'Defense Budget', 'Proxy Funding', 'Humanitarian'];

export default function FundingTab() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [newsResults, setNewsResults] = useState<Array<{ title: string; url: string; publishedAt: string; source: string }>>([]);
  const [fetchingNews, setFetchingNews] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);

  const filtered = activeFilter
    ? FUNDING_EVENTS.filter(e => e.category === activeFilter)
    : FUNDING_EVENTS;

  const checkForUpdates = async () => {
    setFetchingNews(true);
    setNewsError(null);

    const newsApiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
    if (!newsApiKey) {
      // Fall back to the RSS news feed
      try {
        const res = await fetch('/api/news');
        const data = await res.json();
        const relevant = [...(data.news || [])].filter((item: { title: string }) => {
          const t = item.title.toLowerCase();
          return t.includes('aid') || t.includes('fund') || t.includes('budget') || t.includes('sanction');
        }).slice(0, 5);
        setNewsResults(relevant.map((item: { title: string; link: string; pubDate: string; source: string }) => ({
          title: item.title,
          url: item.link,
          publishedAt: item.pubDate,
          source: item.source,
        })));
      } catch {
        setNewsError('RSS feeds unavailable — data could not be retrieved');
      } finally {
        setFetchingNews(false);
      }
      return;
    }

    try {
      const queries = ['iran funding', 'israel military aid', 'defense budget 2026'];
      const results = await Promise.allSettled(
        queries.map(q =>
          fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&sortBy=publishedAt&pageSize=5&apiKey=${newsApiKey}`)
            .then(r => r.json())
        )
      );

      const articles = results
        .flatMap(r => r.status === 'fulfilled' ? r.value?.articles || [] : [])
        .slice(0, 10)
        .map((a: { title: string; url: string; publishedAt: string; source: { name: string } }) => ({
          title: a.title,
          url: a.url,
          publishedAt: a.publishedAt,
          source: a.source?.name || 'Unknown',
        }));

      setNewsResults(articles);
    } catch {
      setNewsError('NewsAPI unavailable — data could not be retrieved');
    } finally {
      setFetchingNews(false);
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '10px', color: 'var(--text-muted)' }}>CATEGORY:</span>
        <button
          onClick={() => setActiveFilter(null)}
          style={{
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '10px',
            padding: '3px 10px',
            border: `1px solid ${activeFilter === null ? 'var(--text-data)' : 'var(--border)'}`,
            background: activeFilter === null ? 'rgba(168,216,234,0.1)' : 'transparent',
            color: activeFilter === null ? 'var(--text-data)' : 'var(--text-muted)',
            borderRadius: '2px',
            cursor: 'pointer',
          }}
        >
          ALL
        </button>
        {ALL_CATEGORIES.map(cat => {
          const color = CATEGORY_COLORS[cat] || 'var(--text-muted)';
          return (
            <button
              key={cat}
              onClick={() => setActiveFilter(activeFilter === cat ? null : cat)}
              style={{
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: '10px',
                padding: '3px 10px',
                border: `1px solid ${activeFilter === cat ? color : 'var(--border)'}`,
                background: activeFilter === cat ? `${color}22` : 'transparent',
                color: activeFilter === cat ? color : 'var(--text-muted)',
                borderRadius: '2px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {cat.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Events list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
        {filtered.map(event => {
          const color = CATEGORY_COLORS[event.category] || 'var(--text-muted)';
          return (
            <div
              key={event.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderLeft: `3px solid ${color}`,
                borderRadius: '4px',
                padding: '12px 16px',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '10px',
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: '9px',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '2px',
                      background: `${color}22`,
                      border: `1px solid ${color}44`,
                      color: color,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {event.category.toUpperCase()}
                  </span>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '10px', color: 'var(--text-muted)' }}>
                    {event.date}
                  </span>
                </div>

                <div
                  style={{
                    fontFamily: 'IBM Plex Sans, sans-serif',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    marginBottom: '6px',
                    lineHeight: 1.4,
                  }}
                >
                  {event.description}
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {event.amount && event.amount !== 'N/A' && (
                    <span
                      style={{
                        fontFamily: 'IBM Plex Mono, monospace',
                        fontSize: '12px',
                        color: 'var(--text-data)',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <DollarSign size={11} />
                      {event.amount}
                    </span>
                  )}
                  <a
                    href={event.sourceUrl}
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
                    Source: {event.source} <ExternalLink size={9} />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Check for updates */}
      <div
        style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '16px',
        }}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '14px', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
            Check for Updates
          </span>
          <button
            onClick={checkForUpdates}
            disabled={fetchingNews}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--bg-card)',
              border: '1px solid var(--accent-blue)',
              borderRadius: '3px',
              color: 'var(--accent-blue)',
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '11px',
              padding: '5px 12px',
              cursor: fetchingNews ? 'wait' : 'pointer',
              opacity: fetchingNews ? 0.6 : 1,
            }}
          >
            <RefreshCw size={12} style={{ animation: fetchingNews ? 'spin 1s linear infinite' : 'none' }} />
            {fetchingNews ? 'Fetching...' : 'Fetch Latest'}
          </button>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px', color: 'var(--text-muted)' }}>
            Searches: &quot;iran funding&quot;, &quot;israel military aid&quot;, &quot;defense budget 2026&quot;
          </span>
        </div>

        {newsError && (
          <div style={{ padding: '10px', background: '#1a1200', border: '1px solid var(--accent-orange)', borderRadius: '4px', fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', color: 'var(--accent-orange)', marginBottom: '8px' }}>
            ⚠️ {newsError}
          </div>
        )}

        {newsResults.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {newsResults.map((article, i) => (
              <a
                key={i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  padding: '10px 12px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '3px',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--text-muted)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px', color: 'var(--accent-blue)' }}>
                    {article.source}
                  </span>
                  <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '9px', color: 'var(--text-muted)' }}>
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ fontFamily: 'IBM Plex Sans, sans-serif', fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {article.title}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: '16px',
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: '9px',
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border)',
          paddingTop: '8px',
        }}
      >
        All static entries are sourced from cited public records. Source URLs provided per item.
        Dynamic updates fetched from NewsAPI.org or RSS feeds. No data is generated or estimated by this application.
      </div>
    </div>
  );
}
