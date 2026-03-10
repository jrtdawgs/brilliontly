'use client';

import { useState } from 'react';
import MetricCard from '@/components/dashboard/MetricCard';
import SignalCard from '@/components/dashboard/SignalCard';
import MacroPanel from '@/components/dashboard/MacroPanel';
import { formatCurrency, formatPercent } from '@/lib/utils';
import type { PortfolioMetrics } from '@/lib/analytics/metrics';
import type { Signal } from '@/lib/analytics/signals';

// Demo metrics data - will be replaced by real API calls
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

const DEMO_ACCOUNTS = [
  {
    id: '401k',
    name: '401(k)',
    type: '401k',
    value: 47250,
    change: 312.50,
    changePercent: 0.0066,
    holdings: [
      { ticker: 'FXAIX', name: 'Fidelity 500 Index', value: 47250, allocation: 100, change: 0.66 },
    ],
  },
  {
    id: 'roth',
    name: 'Roth IRA',
    type: 'roth_ira',
    value: 15800,
    change: -89.30,
    changePercent: -0.0056,
    holdings: [
      { ticker: 'QQQM', name: 'Invesco Nasdaq 100', value: 15800, allocation: 100, change: -0.56 },
    ],
  },
  {
    id: 'taxable',
    name: 'Taxable Brokerage',
    type: 'taxable',
    value: 28450,
    change: 445.20,
    changePercent: 0.0159,
    holdings: [
      { ticker: 'SPY', name: 'S&P 500 ETF', value: 5690, allocation: 20, change: 0.45 },
      { ticker: 'QQQ', name: 'Nasdaq 100 ETF', value: 5690, allocation: 20, change: -0.32 },
      { ticker: 'SOXL', name: '3x Semiconductors', value: 2845, allocation: 10, change: 4.21 },
      { ticker: 'BTC-USD', name: 'Bitcoin', value: 4267, allocation: 15, change: 2.15 },
      { ticker: 'ETH-USD', name: 'Ethereum', value: 2845, allocation: 10, change: 1.87 },
      { ticker: 'BITX', name: '2x Bitcoin ETF', value: 4267, allocation: 15, change: 3.42 },
      { ticker: 'ETHU', name: '2x Ether ETF', value: 2845, allocation: 10, change: 2.65 },
    ],
  },
];

const DEMO_SIGNALS: { ticker: string; name: string; signal: Signal }[] = [
  { ticker: 'SPY', name: 'S&P 500', signal: { type: 'neutral', label: 'Hold / Wait', description: 'RSI at 52. No strong buy or sell signal right now.', value: 52, threshold: 'RSI 30-70' } },
  { ticker: 'QQQ', name: 'Nasdaq 100', signal: { type: 'buy', label: 'Oversold Bounce', description: 'RSI dropped to 28 and is now recovering. Tech has been beaten down and may be due for a bounce.', value: 28, threshold: 'RSI < 30' } },
  { ticker: 'SOXL', name: 'Semis 3x', signal: { type: 'strong_buy', label: 'Capitulation Zone', description: 'SOXL is down 35% from highs with RSI at 22 and volume 2.5x normal. This pattern often marks a bottom for leveraged semi plays.', value: 22, threshold: 'RSI < 25 + 2x volume' } },
  { ticker: 'BTC-USD', name: 'Bitcoin', signal: { type: 'buy', label: 'Oversold', description: 'Bitcoin RSI at 31, just above oversold territory. Drawdown of 18% from recent highs. Historically a decent entry zone.', value: 31, threshold: 'RSI near 30' } },
  { ticker: 'GLD', name: 'Gold', signal: { type: 'neutral', label: 'Neutral Trend', description: 'Gold is trending sideways. No clear signal in either direction.', value: 48, threshold: 'RSI 40-60' } },
];

export default function InvestingPage() {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const totalValue = DEMO_ACCOUNTS.reduce((sum, a) => sum + a.value, 0);
  const totalChange = DEMO_ACCOUNTS.reduce((sum, a) => sum + a.change, 0);
  const totalChangePercent = totalChange / (totalValue - totalChange);

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Long-Term Investing</h1>
        <p className="text-gray-400 mt-1">Portfolio analytics, metrics, and buy signals for building wealth</p>
      </div>

      {/* Portfolio Summary */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-sm text-gray-400 mb-1">Total Portfolio Value</p>
            <p className="text-4xl font-bold text-white">{formatCurrency(totalValue)}</p>
            <p className={`text-sm mt-1 ${totalChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalChange >= 0 ? '+' : ''}{formatCurrency(totalChange)} ({formatPercent(totalChangePercent)}) today
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-xs bg-[#1e293b] text-gray-300 px-3 py-1.5 rounded-lg hover:bg-[#334155] transition-colors">
              Refresh Data
            </button>
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
            <p className={`text-sm mt-1 ${account.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {account.change >= 0 ? '+' : ''}{formatCurrency(account.change)} ({formatPercent(account.changePercent)})
            </p>

            {/* Holdings mini table */}
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

      {/* Buy Signals */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Buy / Sell Signals</h3>
        <p className="text-sm text-gray-400 mb-4">Based on RSI, drawdown, volume, and capitulation analysis. Tap to expand.</p>
        <div className="grid md:grid-cols-2 gap-4">
          {DEMO_SIGNALS.map((s) => (
            <SignalCard
              key={s.ticker}
              signal={s.signal}
              title={`${s.ticker} - ${s.name}`}
            />
          ))}
        </div>
      </div>

      {/* Macro Panel */}
      <MacroPanel />

      {/* Disclaimer */}
      <div className="text-center py-4">
        <p className="text-xs text-gray-600">
          For informational purposes only. Not financial advice. Past performance does not guarantee future results.
        </p>
      </div>
    </div>
  );
}
