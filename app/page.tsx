'use client';
import dynamic from 'next/dynamic';

// All heavy components load client-side only
const TopBar = dynamic(() => import('@/components/TopBar'), { ssr: false });
const ConflictMap = dynamic(() => import('@/components/ConflictMap'), { ssr: false });
const HeadlinesSidebar = dynamic(() => import('@/components/HeadlinesSidebar'), { ssr: false });
const BottomTabs = dynamic(() => import('@/components/BottomTabs'), { ssr: false });

export default function Home() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg-primary)',
      }}
    >
      {/* Top status bar — fixed */}
      <TopBar />

      {/* Main content — starts below top bar */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          marginTop: '48px',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* Left column: Map (60%) + Bottom Tabs */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '60%',
            minWidth: 0,
            borderRight: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          {/* Map — takes up ~55% of viewport height */}
          <div
            style={{
              flex: '0 0 55vh',
              borderBottom: '1px solid var(--border)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '6px 12px',
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span
                style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: 700,
                  fontSize: '13px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--text-primary)',
                }}
              >
                CONFLICT MAP
              </span>
              <span
                style={{
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                }}
              >
                — ACLED confirmed events, 2025–present
              </span>
            </div>
            <div style={{ height: 'calc(55vh - 33px)' }}>
              <ConflictMap />
            </div>
          </div>

          {/* Bottom Tabs — rest of height */}
          <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
            <BottomTabs />
          </div>
        </div>

        {/* Right column: Headlines sidebar (40%) */}
        <div
          style={{
            width: '40%',
            minWidth: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <HeadlinesSidebar />
        </div>
      </div>

      {/* Global footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '6px 16px',
          background: 'var(--bg-primary)',
          fontFamily: 'IBM Plex Mono, monospace',
          fontSize: '9px',
          color: 'var(--text-muted)',
          textAlign: 'center',
          flexShrink: 0,
          lineHeight: 1.5,
          zIndex: 100,
        }}
      >
        All data sourced from external third parties (ACLED, BBC, Reuters, Al Jazeera, NPR, AP, The Guardian, CENTCOM, Polymarket, Wikipedia, EIA).
        OPERATION TRACKER does not generate, estimate, or editorialize any statistics. Claims ≠ Facts. Sources cited throughout.
        This is an informational tool only.
      </footer>
    </div>
  );
}
