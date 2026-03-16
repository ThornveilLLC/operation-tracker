import { NextResponse } from 'next/server';

export const revalidate = 300;

export interface PolymarketMarket {
  id: string;
  question: string;
  slug: string;
  outcomePrices?: string;
  outcomes?: string;
  volume?: number;
  endDate?: string;
  active?: boolean;
}

async function searchPolymarket(query: string): Promise<PolymarketMarket[]> {
  try {
    const res = await fetch(
      `https://gamma-api.polymarket.com/markets?search=${encodeURIComponent(query)}&closed=false&limit=20`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const [iranMarkets, israelMarkets, meMarkets] = await Promise.all([
      searchPolymarket('iran'),
      searchPolymarket('israel'),
      searchPolymarket('middle east'),
    ]);

    // Deduplicate by id
    const seen = new Set<string>();
    const allMarkets: PolymarketMarket[] = [];
    for (const m of [...iranMarkets, ...israelMarkets, ...meMarkets]) {
      if (!seen.has(m.id)) {
        seen.add(m.id);
        allMarkets.push(m);
      }
    }

    // Parse out YES price for binary markets
    const processed = allMarkets.map(m => {
      let yesPrice: number | null = null;
      let noPrice: number | null = null;

      try {
        if (m.outcomePrices) {
          const prices = JSON.parse(m.outcomePrices);
          if (Array.isArray(prices) && prices.length >= 2) {
            yesPrice = parseFloat(prices[0]) * 100;
            noPrice = parseFloat(prices[1]) * 100;
          }
        }
      } catch {
        // ignore parse errors
      }

      return { ...m, yesPrice, noPrice };
    });

    return NextResponse.json({
      markets: processed,
      count: processed.length,
      lastUpdated: new Date().toISOString(),
      disclaimer: 'Prediction markets reflect crowd speculation only, not intelligence assessments. Not financial advice.',
      source: 'Polymarket',
      sourceUrl: 'https://polymarket.com',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch Polymarket data', message, markets: [] },
      { status: 200 }
    );
  }
}
