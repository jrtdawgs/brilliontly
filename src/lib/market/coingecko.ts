// CoinGecko API client (free tier - 30 calls/min)
// No API key required

export interface CryptoQuote {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  marketCap: number;
  volume24h: number;
  high24h: number;
  low24h: number;
}

const CRYPTO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
};

export async function getCryptoQuote(symbol: string): Promise<CryptoQuote | null> {
  const id = CRYPTO_IDS[symbol.toUpperCase()];
  if (!id) return null;

  try {
    const url = `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`;
    const res = await fetch(url, {
      next: { revalidate: 300 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const market = data.market_data;

    return {
      id: data.id,
      symbol: data.symbol.toUpperCase(),
      name: data.name,
      price: market.current_price.usd,
      change24h: market.price_change_24h,
      changePercent24h: market.price_change_percentage_24h,
      marketCap: market.market_cap.usd,
      volume24h: market.total_volume.usd,
      high24h: market.high_24h.usd,
      low24h: market.low_24h.usd,
    };
  } catch {
    console.error(`Failed to fetch crypto quote for ${symbol}`);
    return null;
  }
}

export async function getCryptoHistory(
  symbol: string,
  days: number = 365
): Promise<{ date: string; price: number }[]> {
  const id = CRYPTO_IDS[symbol.toUpperCase()];
  if (!id) return [];

  try {
    const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}&interval=daily`;
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return (data.prices || []).map(([timestamp, price]: [number, number]) => ({
      date: new Date(timestamp).toISOString().split('T')[0],
      price,
    }));
  } catch {
    console.error(`Failed to fetch crypto history for ${symbol}`);
    return [];
  }
}
