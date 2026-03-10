import { NextResponse } from 'next/server';
import {
  calculateAllMetrics,
  calculateDailyReturns,
  correlationMatrix,
} from '@/lib/analytics/metrics';
import {
  calculateRSI,
  rsiSignal,
  currentDrawdown,
  drawdownSignal,
  movingAverageSignal,
  overallSignal,
} from '@/lib/analytics/signals';

// POST /api/v1/metrics - Calculate metrics for any portfolio
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { portfolioPrices, benchmarkPrices, tickers } = body;

    if (!portfolioPrices || !benchmarkPrices) {
      return NextResponse.json(
        { success: false, error: 'portfolioPrices and benchmarkPrices arrays are required' },
        { status: 400 }
      );
    }

    // Calculate all metrics
    const metrics = calculateAllMetrics(portfolioPrices, benchmarkPrices);

    // Calculate signals if price data provided
    const rsi = calculateRSI(portfolioPrices);
    const rsiSig = rsiSignal(rsi);
    const dd = currentDrawdown(portfolioPrices);
    const ddSig = drawdownSignal(dd, 'Portfolio');
    const maSig = movingAverageSignal(portfolioPrices);
    const overall = overallSignal([rsiSig, ddSig, maSig]);

    // Calculate correlation matrix if multiple tickers
    let corrMatrix = null;
    if (tickers && Array.isArray(tickers)) {
      const allReturns = tickers.map((t: { ticker: string; prices: number[] }) => ({
        ticker: t.ticker,
        returns: calculateDailyReturns(t.prices),
      }));
      corrMatrix = correlationMatrix(allReturns);
    }

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        signals: {
          rsi: { value: rsi, signal: rsiSig },
          drawdown: { value: dd, signal: ddSig },
          movingAverage: maSig,
          overall,
        },
        correlationMatrix: corrMatrix,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to calculate metrics' },
      { status: 500 }
    );
  }
}

// GET /api/v1/metrics - API documentation
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Brillontly Metrics API',
    version: '1.0',
    endpoints: {
      'POST /api/v1/metrics': {
        description: 'Calculate portfolio metrics and signals',
        body: {
          portfolioPrices: 'number[] - Array of daily closing prices for the portfolio',
          benchmarkPrices: 'number[] - Array of daily closing prices for benchmark (e.g., SPY)',
          tickers: '(optional) Array of {ticker, prices} for correlation matrix',
        },
        returns: 'metrics, signals, correlationMatrix',
      },
      'GET /api/v1/portfolio': {
        description: 'Get portfolio holdings and accounts',
      },
      'GET /api/v1/market/:ticker': {
        description: 'Get current quote for a ticker',
        params: {
          type: '"quote" (default) or "history"',
          range: '"1mo", "3mo", "6mo", "1y", "2y", "5y"',
        },
      },
    },
    metrics_available: [
      'totalReturn', 'annualizedReturn', 'sharpeRatio', 'sortinoRatio',
      'beta', 'alpha', 'maxDrawdown', 'volatility', 'calmarRatio',
      'treynorRatio', 'valueAtRisk95', 'informationRatio',
    ],
    signals_available: ['RSI', 'Drawdown', 'Capitulation', 'Moving Average', 'Volume Spike'],
  });
}
