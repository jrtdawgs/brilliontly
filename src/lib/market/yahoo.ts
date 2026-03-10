// Yahoo Finance API client (using free unofficial API)
// No API key required

export interface QuoteData {
  ticker: string;
  name: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  marketCap: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Fetch current quote for a ticker
export async function getQuote(ticker: string): Promise<QuoteData | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!res.ok) return null;

    const data = await res.json();
    const result = data.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const price = meta.regularMarketPrice;
    const previousClose = meta.chartPreviousClose || meta.previousClose;

    return {
      ticker: meta.symbol,
      name: meta.shortName || meta.longName || ticker,
      price,
      previousClose,
      change: price - previousClose,
      changePercent: ((price - previousClose) / previousClose) * 100,
      dayHigh: meta.regularMarketDayHigh || price,
      dayLow: meta.regularMarketDayLow || price,
      volume: meta.regularMarketVolume || 0,
      marketCap: meta.marketCap || 0,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || price,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow || price,
    };
  } catch {
    console.error(`Failed to fetch quote for ${ticker}`);
    return null;
  }
}

// Fetch historical price data
export async function getHistoricalData(
  ticker: string,
  range: '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' = '1y',
  interval: '1d' | '1wk' | '1mo' = '1d'
): Promise<HistoricalDataPoint[]> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=${interval}&range=${range}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) return [];

    const data = await res.json();
    const result = data.chart?.result?.[0];
    if (!result) return [];

    const timestamps = result.timestamp || [];
    const quotes = result.indicators?.quote?.[0] || {};

    const historicalData: HistoricalDataPoint[] = [];

    for (let i = 0; i < timestamps.length; i++) {
      if (quotes.close?.[i] != null) {
        historicalData.push({
          date: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
          open: quotes.open?.[i] || 0,
          high: quotes.high?.[i] || 0,
          low: quotes.low?.[i] || 0,
          close: quotes.close[i],
          volume: quotes.volume?.[i] || 0,
        });
      }
    }

    return historicalData;
  } catch {
    console.error(`Failed to fetch historical data for ${ticker}`);
    return [];
  }
}

// Fetch quotes for multiple tickers
export async function getMultipleQuotes(tickers: string[]): Promise<Map<string, QuoteData>> {
  const results = new Map<string, QuoteData>();
  const promises = tickers.map(async (ticker) => {
    const quote = await getQuote(ticker);
    if (quote) results.set(ticker, quote);
  });
  await Promise.all(promises);
  return results;
}
