// Centralized source configuration and citation helpers
// All data sources used in this application

export const RSS_FEEDS = [
  {
    url: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml',
    name: 'BBC Middle East',
    color: '#c0392b',
    shortName: 'BBC',
  },
  {
    url: 'https://rss.reuters.com/reuters/topNews',
    name: 'Reuters Top News',
    color: '#e67e22',
    shortName: 'Reuters',
  },
  {
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    name: 'Al Jazeera',
    color: '#f1c40f',
    shortName: 'AJ',
  },
  {
    url: 'https://feeds.npr.org/1004/rss.xml',
    name: 'NPR World',
    color: '#27ae60',
    shortName: 'NPR',
  },
  {
    url: 'https://apnews.com/hub/middle-east/feed',
    name: 'AP Middle East',
    color: '#2980b9',
    shortName: 'AP',
  },
  {
    url: 'https://www.theguardian.com/world/middleeast/rss',
    name: 'Guardian Middle East',
    color: '#8e44ad',
    shortName: 'Guardian',
  },
];

export const CENTCOM_RSS = 'https://www.centcom.mil/rss/';

export const CONFLICT_KEYWORDS = [
  'iran',
  'israel',
  'idf',
  'irgc',
  'tehran',
  'operation epic fury',
  'centcom',
  'middle east war',
  'hezbollah',
  'houthi',
  'gaza',
  'lebanon',
  'strike',
  'missile',
  'airstrike',
];

export const WEAPONS_ARTICLES = [
  { title: 'F-35_Lightning_II', side: 'coalition', operator: '🇺🇸🇮🇱' },
  { title: 'Iron_Dome', side: 'coalition', operator: '🇮🇱' },
  { title: 'Shahab-3', side: 'iran', operator: '🇮🇷' },
  { title: 'Arrow_3', side: 'coalition', operator: '🇮🇱' },
  { title: 'F-15_Eagle', side: 'coalition', operator: '🇺🇸🇮🇱' },
  { title: 'Fateh-110', side: 'iran', operator: '🇮🇷' },
  { title: 'Qiam-1', side: 'iran', operator: '🇮🇷' },
  { title: "David%27s_Sling", side: 'coalition', operator: '🇮🇱' },
  { title: 'AGM-158_JASSM', side: 'coalition', operator: '🇺🇸' },
  { title: 'GBU-57_Massive_Ordnance_Penetrator', side: 'coalition', operator: '🇺🇸' },
];

export const ACLED_EVENT_COLORS: Record<string, string> = {
  'Air/drone strike': '#c0392b',
  'Airstrike': '#c0392b',
  'Armed clash': '#2980b9',
  'Shelling/artillery/missile attack': '#e67e22',
  'Explosion/remote violence': '#f1c40f',
  'Protests': '#8e44ad',
  'Riots': '#8e44ad',
  'Strategic development': '#27ae60',
  default: '#6b7a8d',
};

export function getEventColor(eventType: string): string {
  for (const [key, color] of Object.entries(ACLED_EVENT_COLORS)) {
    if (eventType?.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return ACLED_EVENT_COLORS.default;
}

export function cite(source: string, url?: string): string {
  return url ? `Source: <a href="${url}" target="_blank" rel="noopener">${source}</a>` : `Source: ${source}`;
}

// Known funding events — each MUST have a source URL
export const FUNDING_EVENTS = [
  {
    id: 1,
    description: 'US Congress approves emergency military aid package for Israel',
    date: '2024-04-24',
    amount: '$26.38 billion',
    category: 'US Aid',
    source: 'Reuters',
    sourceUrl: 'https://www.reuters.com/world/us/biden-sign-israel-ukraine-aid-into-law-2024-04-24/',
  },
  {
    id: 2,
    description: 'US deploys additional carrier strike group to Eastern Mediterranean',
    date: '2024-10-01',
    amount: 'N/A',
    category: 'US Aid',
    source: 'Pentagon Statement',
    sourceUrl: 'https://www.defense.gov/',
  },
  {
    id: 3,
    description: 'US imposes new sanctions package on Iran targeting oil exports and IRGC entities',
    date: '2024-09-25',
    amount: 'N/A',
    category: 'Sanctions',
    source: 'US Treasury',
    sourceUrl: 'https://home.treasury.gov/news/press-releases',
  },
  {
    id: 4,
    description: "Iran increases defense budget amid ongoing conflict — official government figures",
    date: '2025-01-01',
    amount: 'Classified / Not publicly disclosed',
    category: 'Defense Budget',
    source: 'Reuters',
    sourceUrl: 'https://www.reuters.com',
  },
  {
    id: 5,
    description: 'Houthi movement receives Iranian materiel support — UN Panel of Experts report',
    date: '2024-01-15',
    amount: 'Undisclosed',
    category: 'Proxy Funding',
    source: 'UN Panel of Experts on Yemen',
    sourceUrl: 'https://www.un.org/securitycouncil/sanctions/2140/panel-of-experts',
  },
  {
    id: 6,
    description: 'UN emergency humanitarian appeal for Gaza — $1.2B requested',
    date: '2024-10-05',
    amount: '$1.2 billion (requested)',
    category: 'Humanitarian',
    source: 'OCHA / UN',
    sourceUrl: 'https://www.ochaopt.org/',
  },
];

// Cost estimates — all must have source citations
export const COST_ESTIMATES = [
  {
    category: 'US military operational costs (CENTCOM operations)',
    estimate: 'No verified public figure available',
    dateOfEstimate: '—',
    source: 'Pentagon — classified operational budgets',
    sourceUrl: 'https://www.defense.gov/',
    note: 'DoD has not publicly disclosed real-time operational costs.',
  },
  {
    category: "Israel defense spending increase (2024 emergency budget)",
    estimate: '~$27 billion (additional)',
    dateOfEstimate: '2024',
    source: "Israeli Ministry of Finance / Reuters",
    sourceUrl: 'https://www.reuters.com',
    note: 'Figure reflects supplemental budget request; actual expenditure may differ.',
  },
  {
    category: 'WTI crude oil price impact — conflict risk premium',
    estimate: 'Live — see oil price widget',
    dateOfEstimate: 'Real-time',
    source: 'U.S. Energy Information Administration',
    sourceUrl: 'https://www.eia.gov/',
    note: 'Risk premium is analyst-estimated and contested.',
  },
  {
    category: 'Strait of Hormuz shipping insurance surcharge',
    estimate: 'Up to 0.5–1% additional war risk premium',
    dateOfEstimate: '2024',
    source: 'Lloyd\'s Market Association / Reuters',
    sourceUrl: 'https://www.reuters.com',
    note: 'Fluctuates with threat level assessments.',
  },
  {
    category: 'Iranian economic damage (sanctions + conflict)',
    estimate: 'No verified consolidated figure',
    dateOfEstimate: '—',
    source: 'IMF / World Bank',
    sourceUrl: 'https://www.imf.org',
    note: 'IMF Iran GDP data limited; figures heavily disputed.',
  },
  {
    category: 'Regional GDP impact (MENA)',
    estimate: 'Significant negative impact — no single figure',
    dateOfEstimate: '2024',
    source: 'World Bank MENA Economic Monitor',
    sourceUrl: 'https://www.worldbank.org/en/region/mena',
    note: 'World Bank warns of substantial downside risks but does not give single war-cost figure.',
  },
];
