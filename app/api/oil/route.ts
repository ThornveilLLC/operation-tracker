import { NextResponse } from 'next/server';

export const revalidate = 3600; // 1 hour

export interface OilDataPoint {
  period: string;
  value: number | null;
}

export async function GET() {
  const eiaKey = process.env.EIA_KEY;

  if (!eiaKey) {
    return NextResponse.json({
      error: 'EIA API key not configured',
      message: 'Set EIA_KEY in .env.local. Get a free key at eia.gov/opendata/register.php',
      data: [],
      latestPrice: null,
      change24h: null,
    });
  }

  try {
    const params = new URLSearchParams({
      api_key: eiaKey,
      frequency: 'daily',
      'data[0]': 'value',
      'sort[0][column]': 'period',
      'sort[0][direction]': 'desc',
      length: '7',
    });

    const res = await fetch(
      `https://api.eia.gov/v2/petroleum/pri/spt/data/?${params.toString()}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      throw new Error(`EIA API error: ${res.status}`);
    }

    const json = await res.json();
    const rawData: Array<{ period: string; value: number | null }> = json?.response?.data || [];

    const data: OilDataPoint[] = rawData.map(d => ({
      period: d.period,
      value: d.value,
    }));

    const latestPrice = data[0]?.value ?? null;
    const previousPrice = data[1]?.value ?? null;
    const change24h = latestPrice !== null && previousPrice !== null
      ? parseFloat((latestPrice - previousPrice).toFixed(2))
      : null;
    const changePct = latestPrice !== null && previousPrice !== null && previousPrice !== 0
      ? parseFloat(((latestPrice - previousPrice) / previousPrice * 100).toFixed(2))
      : null;

    return NextResponse.json({
      data: data.reverse(), // oldest first for sparkline
      latestPrice,
      change24h,
      changePct,
      lastUpdated: new Date().toISOString(),
      source: 'U.S. Energy Information Administration',
      sourceUrl: 'https://www.eia.gov',
      label: 'WTI Crude Oil (USD/barrel)',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch EIA oil price data', message, data: [], latestPrice: null, change24h: null },
      { status: 200 }
    );
  }
}
