import { NextResponse } from 'next/server';
import { WEAPONS_ARTICLES } from '@/lib/sources';

export const revalidate = 3600; // 1 hour — Wikipedia summaries don't change often

interface WikiSummary {
  title: string;
  extract: string;
  thumbnail?: { source: string; width: number; height: number };
  content_urls?: { desktop?: { page: string } };
}

async function fetchWikiSummary(articleTitle: string): Promise<WikiSummary | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${articleTitle}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function GET() {
  const results = await Promise.allSettled(
    WEAPONS_ARTICLES.map(async w => {
      const summary = await fetchWikiSummary(w.title);
      if (!summary) return null;
      return {
        articleTitle: w.title,
        side: w.side,
        operator: w.operator,
        name: summary.title,
        extract: summary.extract?.slice(0, 400) || 'Summary unavailable.',
        thumbnail: summary.thumbnail?.source || null,
        wikiUrl: summary.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${w.title}`,
        source: 'Wikipedia',
      };
    })
  );

  const weapons = results
    .map(r => (r.status === 'fulfilled' ? r.value : null))
    .filter(Boolean);

  const coalition = weapons.filter(w => w?.side === 'coalition');
  const iran = weapons.filter(w => w?.side === 'iran');

  return NextResponse.json({
    coalition,
    iran,
    lastUpdated: new Date().toISOString(),
    source: 'Wikipedia',
    sourceUrl: 'https://en.wikipedia.org',
  });
}
