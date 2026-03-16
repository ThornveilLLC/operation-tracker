import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { RSS_FEEDS, CENTCOM_RSS, CONFLICT_KEYWORDS } from '@/lib/sources';

export const revalidate = 300; // 5 minutes

const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:thumbnail', 'enclosure'],
  },
  timeout: 8000,
});

function matchesKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return CONFLICT_KEYWORDS.some(kw => lower.includes(kw));
}

export interface NewsItem {
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

async function fetchFeed(url: string, sourceName: string, sourceShort: string, sourceColor: string, isOfficial = false): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(url);
    return feed.items
      .filter(item => {
        const text = `${item.title || ''} ${item.contentSnippet || ''} ${item.content || ''}`;
        return isOfficial || matchesKeyword(text);
      })
      .slice(0, 30)
      .map(item => ({
        id: `${sourceShort}-${item.guid || item.link || item.title || Math.random()}`,
        title: item.title || '(No title)',
        link: item.link || '',
        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
        source: sourceName,
        sourceShort,
        sourceColor,
        excerpt: item.contentSnippet?.slice(0, 200),
        isOfficial,
      }));
  } catch (err) {
    console.warn(`Failed to fetch ${sourceName}:`, err);
    return [];
  }
}

export async function GET() {
  const results = await Promise.allSettled([
    ...RSS_FEEDS.map(feed => fetchFeed(feed.url, feed.name, feed.shortName, feed.color)),
    fetchFeed(CENTCOM_RSS, 'CENTCOM Official', 'CENTCOM', '#2980b9', true),
  ]);

  const allItems: NewsItem[] = results
    .flatMap(r => (r.status === 'fulfilled' ? r.value : []))
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, 50);

  const official = allItems.filter(i => i.isOfficial);
  const news = allItems.filter(i => !i.isOfficial);

  return NextResponse.json(
    { news, official, lastUpdated: new Date().toISOString() },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    }
  );
}
