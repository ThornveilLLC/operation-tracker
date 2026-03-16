import { NextResponse } from 'next/server';

export const revalidate = 600; // 10 minutes

export interface AcledEvent {
  event_date: string;
  event_type: string;
  sub_event_type: string;
  actor1: string;
  actor2: string;
  country: string;
  location: string;
  latitude: string;
  longitude: string;
  fatalities: string;
  notes: string;
  source: string;
}

export async function GET() {
  const key = process.env.ACLED_KEY;
  const email = process.env.ACLED_EMAIL;

  if (!key || !email) {
    return NextResponse.json(
      {
        error: 'ACLED API key not configured',
        message: 'Set ACLED_KEY and ACLED_EMAIL in .env.local. Get a free key at acleddata.com.',
        events: [],
      },
      { status: 200 }
    );
  }

  try {
    const params = new URLSearchParams({
      key,
      email,
      country: 'Iran|Israel|Yemen|Lebanon|Syria',
      event_date: '2025-01-01|2026-12-31',
      event_date_where: 'BETWEEN',
      limit: '500',
      fields: 'event_date|event_type|sub_event_type|actor1|actor2|country|location|latitude|longitude|fatalities|notes|source',
    });

    const url = `https://api.acleddata.com/acled/read?${params.toString()}`;
    const res = await fetch(url, { next: { revalidate: 600 } });

    if (!res.ok) {
      throw new Error(`ACLED API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    return NextResponse.json({
      events: data.data || [],
      count: data.count || 0,
      lastUpdated: new Date().toISOString(),
      source: 'Armed Conflict Location & Event Data Project (ACLED)',
      sourceUrl: 'https://acleddata.com',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to fetch ACLED data',
        message,
        events: [],
      },
      { status: 200 }
    );
  }
}
