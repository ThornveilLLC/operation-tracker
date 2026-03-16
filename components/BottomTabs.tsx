'use client';

import { useState } from 'react';
import { DollarSign, Target, List, BarChart2, Landmark } from 'lucide-react';
import dynamic from 'next/dynamic';

const CostTab = dynamic(() => import('./CostTab'), { ssr: false });
const WeaponsTab = dynamic(() => import('./WeaponsTab'), { ssr: false });
const StrikeLogTab = dynamic(() => import('./StrikeLogTab'), { ssr: false });
const OddsTab = dynamic(() => import('./OddsTab'), { ssr: false });
const FundingTab = dynamic(() => import('./FundingTab'), { ssr: false });

const TABS = [
  { key: 'cost', label: 'THE COST', icon: DollarSign },
  { key: 'weapons', label: 'WEAPONS', icon: Target },
  { key: 'strikes', label: 'STRIKE LOG', icon: List },
  { key: 'odds', label: 'PREDICTION ODDS', icon: BarChart2 },
  { key: 'funding', label: 'GOV & FUNDING', icon: Landmark },
] as const;

type TabKey = typeof TABS[number]['key'];

export default function BottomTabs() {
  const [active, setActive] = useState<TabKey>('cost');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-primary)' }}>
      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
          overflowX: 'auto',
          flexShrink: 0,
        }}
      >
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--accent-red)' : '2px solid transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: '11px',
                fontWeight: isActive ? 700 : 400,
                letterSpacing: '0.08em',
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
              }}
            >
              <Icon size={12} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {active === 'cost' && <CostTab />}
        {active === 'weapons' && <WeaponsTab />}
        {active === 'strikes' && <StrikeLogTab />}
        {active === 'odds' && <OddsTab />}
        {active === 'funding' && <FundingTab />}
      </div>
    </div>
  );
}
