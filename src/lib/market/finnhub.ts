// Finnhub API client — free tier: 60 calls/min
// Sign up at https://finnhub.io to get a free API key
// Set FINNHUB_API_KEY in Vercel environment variables

import type { QuoteData, HistoricalDataPoint } from './yahoo';

const BASE = 'https://finnhub.io/api/v1';

function token() {
  return process.env.FINNHUB_API_KEY || '';
}

// Map Yahoo-style tickers to Finnhub equivalents
function toFinnhubSymbol(ticker: string): string {
  const map: Record<string, string> = {
    'BTC-USD': 'BINANCE:BTCUSDT',
    'ETH-USD': 'BINANCE:ETHUSDT',
  };
  return map[ticker] ?? ticker;
}

function isCrypto(ticker: string) {
  return ticker === 'BTC-USD' || ticker === 'ETH-USD';
}

// Fetch current quote
export async function getFinnhubQuote(ticker: string): Promise<QuoteData | null> {
  const key = token();
  if (!key) return null;

  const symbol = toFinnhubSymbol(ticker);
  const isCryptoTicker = isCrypto(ticker);

  try {
    // For crypto, use a quote endpoint
    const url = isCryptoTicker
      ? `${BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${key}`
      : `${BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${key}`;

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;

    const data = await res.json();
    // Finnhub returns { c, d, dp, h, l, o, pc, t }
    if (!data.c || data.c === 0) return null;

    return {
      ticker,
      name: ticker,
      price: data.c,
      previousClose: data.pc,
      change: data.d,
      changePercent: data.dp,
      dayHigh: data.h,
      dayLow: data.l,
      volume: 0,
      avgVolume: 0,
      marketCap: 0,
      fiftyTwoWeekHigh: data.h,
      fiftyTwoWeekLow: data.l,
      lastUpdated: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

// Fetch historical candle data (for RSI/drawdown calculation)
export async function getFinnhubHistory(
  ticker: string,
  days = 90
): Promise<HistoricalDataPoint[]> {
  const key = token();
  if (!key) return [];

  const symbol = toFinnhubSymbol(ticker);
  const isCryptoTicker = isCrypto(ticker);
  const to = Math.floor(Date.now() / 1000);
  const from = to - days * 24 * 60 * 60;

  try {
    const endpoint = isCryptoTicker ? 'crypto/candle' : 'stock/candle';
    const url = `${BASE}/${endpoint}?symbol=${encodeURIComponent(symbol)}&resolution=D&from=${from}&to=${to}&token=${key}`;

    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];

    const data = await res.json();
    if (data.s !== 'ok' || !data.c) return [];

    return data.t.map((timestamp: number, i: number) => ({
      date: new Date(timestamp * 1000).toISOString().split('T')[0],
      open: data.o[i] ?? 0,
      high: data.h[i] ?? 0,
      low: data.l[i] ?? 0,
      close: data.c[i],
      volume: data.v?.[i] ?? 0,
    }));
  } catch {
    return [];
  }
}

// Fetch multiple quotes in parallel (respects 60 calls/min free tier)
export async function getFinnhubQuotes(tickers: string[]): Promise<Map<string, QuoteData>> {
  const results = new Map<string, QuoteData>();

  // Batch in groups of 10 with small delay between batches to stay under rate limit
  const batchSize = 10;
  for (let i = 0; i < tickers.length; i += batchSize) {
    const batch = tickers.slice(i, i + batchSize);
    const settled = await Promise.allSettled(
      batch.map(async (ticker) => {
        const quote = await getFinnhubQuote(ticker);
        if (quote) results.set(ticker, quote);
      })
    );
    // Small delay between batches if not the last batch
    if (i + batchSize < tickers.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
    void settled;
  }

  return results;
}
