import { NextResponse } from 'next/server';
import { getQuote, getHistoricalData } from '@/lib/market/yahoo';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const url = new URL(request.url);
  const range = (url.searchParams.get('range') || '1y') as '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y';
  const type = url.searchParams.get('type') || 'quote';

  try {
    if (type === 'history') {
      const data = await getHistoricalData(ticker, range);
      return NextResponse.json({ success: true, ticker, data });
    }

    const quote = await getQuote(ticker);
    if (!quote) {
      return NextResponse.json(
        { success: false, error: `Could not fetch quote for ${ticker}` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: quote });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}
