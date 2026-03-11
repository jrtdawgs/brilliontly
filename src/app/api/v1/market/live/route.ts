import { NextResponse } from 'next/server';
import { getMultipleQuotes, getHistoricalData, type QuoteData } from '@/lib/market/yahoo';
import { getFinnhubQuotes, getFinnhubHistory } from '@/lib/market/finnhub';
import { calculateRSI, rsiSignal, currentDrawdown, drawdownSignal, overallSignal } from '@/lib/analytics/signals';
import { TRACKED_ASSETS } from '@/lib/analytics/signals';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Macro tickers — kept on Yahoo Finance (indices not on Finnhub free tier)
const MACRO_TICKERS = ['^VIX', 'DX-Y.NYB', '^TNX', '^FVX', '^TYX', '^IRX', 'TLT', 'UUP', 'GLD'];

const NO_CACHE = { 'Cache-Control': 'no-store, no-cache, must-revalidate', 'Pragma': 'no-cache' };

const useFinnhub = () => !!process.env.FINNHUB_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';

  try {
    if (type === 'macro') return await getMacroData();

    if (type === 'quotes') {
      const tickersParam = searchParams.get('tickers');
      const tickers = tickersParam ? tickersParam.split(',') : TRACKED_ASSETS.map(a => a.ticker);
      const quotes = useFinnhub()
        ? await getFinnhubQuotes(tickers)
        : await getMultipleQuotes(tickers);
      return NextResponse.json(
        { success: true, data: Object.fromEntries(quotes), lastUpdated: new Date().toISOString() },
        { headers: NO_CACHE }
      );
    }

    return await getSignalData();
  } catch (error) {
    console.error('Live market data error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch live market data' },
      { status: 500, headers: NO_CACHE }
    );
  }
}

async function getMacroData() {
  // Macro always uses Yahoo Finance (VIX, yield indices not on Finnhub free tier)
  const quotes = await getMultipleQuotes(MACRO_TICKERS);

  const vixQuote = quotes.get('^VIX');
  const dollarQuote = quotes.get('DX-Y.NYB') || quotes.get('UUP');
  const tenYearQuote = quotes.get('^TNX');
  const fiveYearQuote = quotes.get('^FVX');
  const thirtyYearQuote = quotes.get('^TYX');
  const thirteenWeekQuote = quotes.get('^IRX');
  const tltQuote = quotes.get('TLT');
  const goldQuote = quotes.get('GLD');

  return NextResponse.json({
    success: true,
    data: {
      vix: vixQuote ? { price: vixQuote.price, change: vixQuote.change, changePercent: vixQuote.changePercent } : null,
      dollarIndex: dollarQuote ? { price: dollarQuote.price, change: dollarQuote.change, changePercent: dollarQuote.changePercent } : null,
      tenYearYield: tenYearQuote ? { price: tenYearQuote.price, change: tenYearQuote.change } : null,
      fiveYearYield: fiveYearQuote ? { price: fiveYearQuote.price, change: fiveYearQuote.change } : null,
      thirtyYearYield: thirtyYearQuote ? { price: thirtyYearQuote.price, change: thirtyYearQuote.change } : null,
      thirteenWeekYield: thirteenWeekQuote ? { price: thirteenWeekQuote.price, change: thirteenWeekQuote.change } : null,
      tlt: tltQuote ? { price: tltQuote.price, change: tltQuote.change, changePercent: tltQuote.changePercent } : null,
      gold: goldQuote ? { price: goldQuote.price, change: goldQuote.change, changePercent: goldQuote.changePercent } : null,
    },
    lastUpdated: new Date().toISOString(),
  }, { headers: NO_CACHE });
}

async function getSignalData() {
  const allTickers = TRACKED_ASSETS.map(a => a.ticker);

  // Use Finnhub if API key is set, otherwise fall back to Yahoo Finance
  const quotes: Map<string, QuoteData> = useFinnhub()
    ? await getFinnhubQuotes(allTickers)
    : await getMultipleQuotes(allTickers);

  const signalResults: Record<string, {
    quote: QuoteData;
    rsi: number;
    rsiSignal: { type: string; label: string; description: string };
    drawdown: number;
    drawdownSignal: { type: string; label: string; description: string };
    volumeRatio: number;
    overallSignal: { type: string; label: string; description: string };
    category: string;
  }> = {};

  const historyPromises = allTickers.map(async (ticker) => {
    const quote = quotes.get(ticker);
    if (!quote) return;

    const asset = TRACKED_ASSETS.find(a => a.ticker === ticker);
    if (!asset) return;

    try {
      const history = useFinnhub()
        ? await getFinnhubHistory(ticker, 90)
        : await getHistoricalData(ticker, '3mo', '1d');

      if (history.length < 15) return;

      const closePrices = history.map(h => h.close);
      const volumes = history.map(h => h.volume);

      const rsi = calculateRSI(closePrices);
      const rsiSig = rsiSignal(rsi);
      const dd = currentDrawdown(closePrices);
      const ddSig = drawdownSignal(dd, asset.name);
      const avgVol = volumes.slice(0, -1).reduce((s, v) => s + v, 0) / Math.max(volumes.length - 1, 1);
      const currentVol = volumes[volumes.length - 1] || 0;
      const volRatio = avgVol > 0 ? currentVol / avgVol : 1;
      const overall = overallSignal([rsiSig, ddSig]);

      signalResults[ticker] = {
        quote,
        rsi,
        rsiSignal: { type: rsiSig.type, label: rsiSig.label, description: rsiSig.description },
        drawdown: dd,
        drawdownSignal: { type: ddSig.type, label: ddSig.label, description: ddSig.description },
        volumeRatio: volRatio,
        overallSignal: { type: overall.type, label: overall.label, description: overall.description },
        category: asset.category,
      };
    } catch {
      // Skip ticker if history fetch fails
    }
  });

  await Promise.all(historyPromises);

  return NextResponse.json({
    success: true,
    data: signalResults,
    tickerCount: Object.keys(signalResults).length,
    lastUpdated: new Date().toISOString(),
    source: useFinnhub() ? 'finnhub' : 'yahoo',
  }, { headers: NO_CACHE });
}
