'use client';

import { useState, useEffect, useCallback } from 'react';

export interface LiveQuote {
  ticker: string;
  name: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  lastUpdated: string;
}

export interface LiveSignal {
  quote: LiveQuote;
  rsi: number;
  rsiSignal: { type: string; label: string; description: string };
  drawdown: number;
  drawdownSignal: { type: string; label: string; description: string };
  volumeRatio: number;
  overallSignal: { type: string; label: string; description: string };
  category: string;
}

export interface MacroData {
  vix: { price: number; change: number; changePercent: number } | null;
  dollarIndex: { price: number; change: number; changePercent: number } | null;
  tenYearYield: { price: number; change: number } | null;
  fiveYearYield: { price: number; change: number } | null;
  thirtyYearYield: { price: number; change: number } | null;
  thirteenWeekYield: { price: number; change: number } | null;
  tlt: { price: number; change: number; changePercent: number } | null;
  gold: { price: number; change: number; changePercent: number } | null;
}

// Hook to fetch live signal data for all tracked assets
export function useSignalData(refreshInterval = 30_000) {
  const [data, setData] = useState<Record<string, LiveSignal>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/market/live?type=signals');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setLastUpdated(json.lastUpdated);
        setError(null);
      } else {
        setError(json.error || 'Failed to fetch data');
      }
    } catch {
      setError('Network error fetching market data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return { data, loading, error, lastUpdated, refresh: fetchData };
}

// Hook to fetch macro data (VIX, Dollar, Yields)
export function useMacroData(refreshInterval = 30_000) {
  const [data, setData] = useState<MacroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/market/live?type=macro');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setLastUpdated(json.lastUpdated);
      }
    } catch {
      // Silent fail for macro - will show last data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return { data, loading, lastUpdated, refresh: fetchData };
}

// Hook to fetch quotes for specific tickers
export function useQuotes(tickers: string[], refreshInterval = 30_000) {
  const [data, setData] = useState<Record<string, LiveQuote>>({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (tickers.length === 0) return;
    try {
      const res = await fetch(`/api/v1/market/live?type=quotes&tickers=${tickers.join(',')}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [tickers]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return { data, loading, refresh: fetchData };
}
