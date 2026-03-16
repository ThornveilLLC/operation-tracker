'use client';

import { useEffect, useState, useCallback } from 'react';
import { ExternalLink, Search, RefreshCw, Shield } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  source: string;
  sourceShort: string;
  sourceColor: string;
  excerpt?: string;
  isOfficial?: boolean;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div
        style={{
          padding: '10px 12px',
          borderBottom: '1px solid var(--border)',
          borderLeft: item.isOfficial ? '3px solid var(--accent-blue)' : '3px solid transparent',
          background: 'transparent',
          transition: 'background 0.15s',
          cursor: 'pointer',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          {item.isOfficial && (
            <Shield size={10} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
          )}
          <span
            style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '9px',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: '2px',
              background: `${item.sourceColor}22`,
              border: `1px solid ${item.sourceColor}44`,
              color: item.sourceColor,
              letterSpacing: '0.06em',
            }}
          >
            {item.sourceShort}
          </span>
          <span
            style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '9px',
              color: 'var(--text-muted)',
              marginLeft: 'auto',
            }}
          >
            {timeAgo(item.pubDate)}
          </span>
        </div>

        <div
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            lineHeight: 1.35,
            marginBottom: '3px',
          }}
        >
          {item.title}
        </div>

        {item.excerpt && (
          <div
            style={{
              fontFamily: 'IBM Plex Sans, sans-serif',
              fontSize: '11px',
              color: 'var(--text-muted)',
              lineHeight: 1.4,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {item.excerpt}
          </div>
        )}
      </div>
    </a>
  );
}

export default function HeadlinesSidebar() {
  const [activeTab, setActiveTab] = useState<'news' | 'official'>('news');
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [officialItems, setOfficialItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const res = await fetch('/api/news');
      if (!res.ok) throw new Error('Feed unavailable');
      const data = await res.json();
      setNewsItems(data.news || []);
      setOfficialItems(data.official || []);
      setError(null);
    } catch (e) {
      setError('News feeds unavailable — source could not be reached');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(() => fetchNews(), 300000); // 5 min
    return () => clearInterval(interval);
  }, [fetchNews]);

  const items = activeTab === 'news' ? newsItems : officialItems;
  const filtered = items.filter(i =>
    !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.source.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-secondary)' }}>
      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-primary)',
        }}
      >
        {[
          { key: 'news', label: 'LATEST NEWS', count: newsItems.length },
          { key: 'official', label: 'OFFICIAL STATEMENTS', count: officialItems.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'news' | 'official')}
            style={{
              flex: 1,
              padding: '10px 8px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid var(--accent-red)' : '2px solid transparent',
              color: activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '10px',
              fontWeight: activeTab === tab.key ? 700 : 400,
              letterSpacing: '0.08em',
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            {tab.key === 'official' && <Shield size={10} />}
            {tab.label}
            <span
              style={{
                background: activeTab === tab.key ? 'var(--accent-red)' : 'var(--border)',
                color: activeTab === tab.key ? '#fff' : 'var(--text-muted)',
                borderRadius: '2px',
                padding: '0px 4px',
                fontSize: '9px',
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search + refresh */}
      <div
        style={{
          padding: '8px 10px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={12}
            style={{
              position: 'absolute',
              left: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search headlines..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '3px',
              padding: '5px 8px 5px 26px',
              color: 'var(--text-primary)',
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '11px',
              outline: 'none',
            }}
          />
        </div>
        <button
          onClick={() => fetchNews(true)}
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '3px',
            color: 'var(--text-muted)',
            padding: '5px 8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <RefreshCw size={12} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      {/* Items */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {error ? (
          <div
            style={{
              padding: '20px',
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '11px',
              color: 'var(--accent-orange)',
              textAlign: 'center',
              borderBottom: '1px solid var(--border)',
            }}
          >
            ⚠️ {error}
          </div>
        ) : loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
              <div className="skeleton" style={{ width: '60px', height: '10px', marginBottom: '6px' }} />
              <div className="skeleton" style={{ width: '100%', height: '12px', marginBottom: '4px' }} />
              <div className="skeleton" style={{ width: '80%', height: '12px' }} />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div
            style={{
              padding: '30px 20px',
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '11px',
              color: 'var(--text-muted)',
              textAlign: 'center',
            }}
          >
            {search ? 'No results found.' : 'No items available.'}
          </div>
        ) : (
          filtered.map(item => <NewsCard key={item.id} item={item} />)
        )}
      </div>

      {/* Source notice */}
      <div
        style={{
          padding: '6px 12px',
          borderTop: '1px solid var(--border)',
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: '9px',
          color: 'var(--text-muted)',
        }}
      >
        Sources: BBC, Reuters, Al Jazeera, NPR, AP, The Guardian, CENTCOM — {filtered.length} items
      </div>
    </div>
  );
}
