'use client';

import { useState } from 'react';
import MetricCard from '@/components/dashboard/MetricCard';
import SignalCard from '@/components/dashboard/SignalCard';
import LiveMacroPanel from '@/components/dashboard/LiveMacroPanel';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { useSignalData } from '@/lib/hooks/useMarketData';
import type { PortfolioMetrics } from '@/lib/analytics/metrics';
import type { Signal } from '@/lib/analytics/signals';

// Demo metrics data - will be replaced by real portfolio data when accounts are linked
const DEMO_METRICS: PortfolioMetrics = {
  totalReturn: { value: 0.142, label: 'Total Return', description: 'How much your portfolio has grown since you started. This is your total gain or loss as a percentage.', rating: 'good', format: 'percent' },
  annualizedReturn: { value: 0.118, label: 'Annualized Return', description: 'Your average yearly return, accounting for compounding.', rating: 'good', format: 'percent' },
  sharpeRatio: { value: 1.42, label: 'Sharpe Ratio', description: 'How much extra return you earn for each unit of risk you take. Above 1.0 is good, above 2.0 is great.', rating: 'good', format: 'ratio' },
  sortinoRatio: { value: 1.87, label: 'Sortino Ratio', description: 'Similar to Sharpe, but it only counts the bad kind of volatility (losses). Higher is better.', rating: 'good', format: 'ratio' },
  beta: { value: 1.18, label: 'Beta', description: 'How much your portfolio moves compared to the market. 1.0 = same as market.', rating: 'neutral', format: 'ratio' },
  alpha: { value: 0.032, label: 'Alpha', description: 'Your extra return beyond what the market gave you, adjusted for risk.', rating: 'good', format: 'percent' },
  maxDrawdown: { value: -0.123, label: 'Max Drawdown', description: 'The biggest peak-to-bottom drop your portfolio experienced.', rating: 'neutral', format: 'percent' },
  volatility: { value: 0.168, label: 'Volatility', description: 'How much your portfolio bounces around day to day, measured over a year.', rating: 'neutral', format: 'percent' },
  calmarRatio: { value: 0.96, label: 'Calmar Ratio', description: 'Your annual return divided by your worst drawdown.', rating: 'neutral', format: 'ratio' },
  treynorRatio: { value: 0.085, label: 'Treynor Ratio', description: 'Return per unit of market risk specifically.', rating: 'neutral', format: 'ratio' },
  valueAtRisk95: { value: -0.021, label: 'Value at Risk (95%)', description: 'On 95 out of 100 trading days, your daily loss will not exceed this amount.', rating: 'neutral', format: 'percent' },
  informationRatio: { value: 0.45, label: 'Information Ratio', description: 'How consistently you outperform the benchmark.', rating: 'neutral', format: 'ratio' },
};

// Portfolio tickers to track for live pricing
const PORTFOLIO_TICKERS = ['FXAIX', 'QQQM', 'SPY', 'QQQ', 'SOXL', 'BTC-USD', 'ETH-USD', 'BITX', 'ETHU'];

export default function InvestingPage() {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const { data: signalData, loading, lastUpdated, refresh } = useSignalData(30_000);

  // Get live prices for portfolio tickers
  const getPrice = (ticker: string) => signalData[ticker]?.quote?.price;
  const getChange = (ticker: string) => signalData[ticker]?.quote?.changePercent ?? 0;

  // Build live buy signals for portfolio holdings
  const liveSignals: { ticker: string; name: string; signal: Signal }[] = PORTFOLIO_TICKERS
    .filter(t => signalData[t])
    .map(ticker => ({
      ticker,
      name: signalData[ticker].quote.name,
      signal: signalData[ticker].overallSignal as unknown as Signal,
    }));

  // Demo account values (will be real once brokerage integration is added)
  const DEMO_ACCOUNTS = [
    {
      id: '401k',
      name: '401(k)',
      type: '401k',
      value: 47250,
      changePercent: getChange('FXAIX'),
      holdings: [
        { ticker: 'FXAIX', name: 'Fidelity 500 Index', allocation: 100, change: getChange('FXAIX') },
      ],
    },
    {
      id: 'roth',
      name: 'Roth IRA',
      type: 'roth_ira',
      value: 15800,
      changePercent: getChange('QQQM'),
      holdings: [
        { ticker: 'QQQM', name: 'Invesco Nasdaq 100', allocation: 100, change: getChange('QQQM') },
      ],
    },
    {
      id: 'taxable',
      name: 'Taxable Brokerage',
      type: 'taxable',
      value: 28450,
      changePercent: 0,
      holdings: [
        { ticker: 'SPY', name: 'S&P 500 ETF', allocation: 20, change: getChange('SPY') },
        { ticker: 'QQQ', name: 'Nasdaq 100 ETF', allocation: 20, change: getChange('QQQ') },
        { ticker: 'SOXL', name: '3x Semiconductors', allocation: 10, change: getChange('SOXL') },
        { ticker: 'BTC-USD', name: 'Bitcoin', allocation: 15, change: getChange('BTC-USD') },
        { ticker: 'ETH-USD', name: 'Ethereum', allocation: 10, change: getChange('ETH-USD') },
        { ticker: 'BITX', name: '2x Bitcoin ETF', allocation: 15, change: getChange('BITX') },
        { ticker: 'ETHU', name: '2x Ether ETF', allocation: 10, change: getChange('ETHU') },
      ],
    },
  ];

  const totalValue = DEMO_ACCOUNTS.reduce((sum, a) => sum + a.value, 0);
  // Weighted average change
  const weightedChange = DEMO_ACCOUNTS.reduce((sum, a) => sum + (a.value * a.changePercent / 100), 0);
  const totalChangePercent = totalValue > 0 ? (weightedChange / totalValue) * 100 : 0;
  const totalChange = totalValue * totalChangePercent / 100;

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Long-Term Investing</h1>
          <p className="text-gray-400 mt-1">Portfolio analytics, metrics, and buy signals for building wealth</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              Live {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={refresh}
            disabled={loading}
            className="text-xs bg-[#1e293b] text-gray-300 px-3 py-1.5 rounded-lg hover:bg-[#334155] transition-colors disabled:opacity-50"
          >
            {loading && Object.keys(signalData).length === 0 ? 'Loading...' : 'Refresh'}
          </button>
          <div className={`w-2 h-2 rounded-full ${loading && Object.keys(signalData).length === 0 ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`} />
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">Total Portfolio Value</p>
            <p className="text-4xl font-bold text-white">{formatCurrency(totalValue)}</p>
            <p className={`text-sm mt-1 ${totalChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalChange >= 0 ? '+' : ''}{formatCurrency(Math.abs(totalChange))} ({formatPercent(totalChangePercent / 100)}) today
            </p>
          </div>
          <div className="text-xs text-gray-500">
            Account values are demo. Link your accounts for real data.
          </div>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {DEMO_ACCOUNTS.map((account) => (
          <button
            key={account.id}
            onClick={() => setSelectedAccount(selectedAccount === account.id ? null : account.id)}
            className={`text-left bg-[#111827] border rounded-xl p-5 transition-all ${
              selectedAccount === account.id ? 'border-green-500/50 shadow-lg shadow-green-500/5' : 'border-[#1e293b] hover:border-[#334155]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">{account.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${
                account.type === '401k' ? 'bg-blue-500/15 text-blue-400' :
                account.type === 'roth_ira' ? 'bg-purple-500/15 text-purple-400' :
                'bg-amber-500/15 text-amber-400'
              }`}>
                {account.type === '401k' ? '401(k)' : account.type === 'roth_ira' ? 'Roth IRA' : 'Taxable'}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(account.value)}</p>

            {/* Holdings mini table with LIVE changes */}
            <div className="mt-4 space-y-2">
              {account.holdings.map((h) => (
                <div key={h.ticker} className="flex items-center justify-between text-xs">
                  <span className="text-gray-300 font-mono">{h.ticker}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">{h.allocation}%</span>
                    <span className={h.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {h.change >= 0 ? '+' : ''}{h.change.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Allocation Breakdown */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Asset Allocation</h3>
        <div className="space-y-3">
          {[
            { label: 'S&P 500 Index (FXAIX + SPY)', value: 52910, pct: 57.8, color: 'bg-blue-500' },
            { label: 'Nasdaq 100 (QQQM + QQQ)', value: 21490, pct: 23.5, color: 'bg-purple-500' },
            { label: 'Crypto Direct (BTC + ETH)', value: 7112, pct: 7.8, color: 'bg-orange-500' },
            { label: 'Leveraged ETFs (SOXL + BITX + ETHU)', value: 9957, pct: 10.9, color: 'bg-red-500' },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-300">{item.label}</span>
                <span className="text-gray-400">{formatCurrency(item.value)} ({item.pct}%)</span>
              </div>
              <div className="w-full bg-[#1e293b] rounded-full h-2">
                <div className={`${item.color} rounded-full h-2 transition-all`} style={{ width: `${item.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-xs text-amber-300">
            Note: 10.9% of your portfolio is in leveraged ETFs and crypto ETFs, which carry significantly higher risk due to leverage decay. Consider if this matches your risk tolerance.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Portfolio Metrics</h3>
        <p className="text-sm text-gray-400 mb-4">Hover or tap any metric to see what it means in plain English</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.values(DEMO_METRICS).map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </div>
      </div>

      {/* Live Buy Signals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Live Buy / Sell Signals</h3>
            <p className="text-sm text-gray-400 mt-1">Real-time RSI, drawdown, and capitulation analysis for your holdings</p>
          </div>
          {lastUpdated && (
            <span className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Live
            </span>
          )}
        </div>
        {liveSignals.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {liveSignals.map((s) => (
              <SignalCard
                key={s.ticker}
                signal={s.signal}
                title={`${s.ticker} - ${s.name}`}
              />
            ))}
          </div>
        ) : loading ? (
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-8 text-center">
            <div className="animate-pulse text-green-400 font-semibold">Loading live signals...</div>
          </div>
        ) : null}
      </div>

      {/* Live Macro Panel */}
      <LiveMacroPanel />

      {/* Disclaimer */}
      <div className="text-center py-4">
        <p className="text-xs text-gray-600">
          Live data from Yahoo Finance. Auto-refreshes every 30 seconds. For informational purposes only. Not financial advice.
        </p>
      </div>
    </div>
  );
}
