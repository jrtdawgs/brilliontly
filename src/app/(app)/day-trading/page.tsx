'use client';

import { useState } from 'react';
import SignalCard from '@/components/dashboard/SignalCard';
import LiveMacroPanel from '@/components/dashboard/LiveMacroPanel';
import { getSignalColor, getSignalBg } from '@/lib/utils';
import { useSignalData } from '@/lib/hooks/useMarketData';
import type { Signal } from '@/lib/analytics/signals';

type Category = 'all' | 'Equity' | 'Leveraged' | 'Crypto' | 'Crypto ETF' | 'Commodities' | 'Tech' | 'Sector' | 'Bonds';

export default function DayTradingPage() {
  const [filter, setFilter] = useState<Category>('all');
  const [sortBy, setSortBy] = useState<'signal' | 'rsi' | 'drawdown' | 'volume'>('signal');
  const { data: signalData, loading, lastUpdated, refresh } = useSignalData(30_000);

  const assets = Object.entries(signalData).map(([ticker, s]) => ({
    ticker,
    name: s.quote.name,
    price: s.quote.price,
    changePercent: s.quote.changePercent,
    rsi: s.rsi,
    rsiSignal: s.rsiSignal as unknown as Signal,
    drawdown: s.drawdown,
    drawdownSignal: s.drawdownSignal as unknown as Signal,
    volumeRatio: s.volumeRatio,
    overallSignal: s.overallSignal as unknown as Signal,
    category: s.category,
  }));

  const filteredAssets = assets
    .filter((a) => filter === 'all' || a.category === filter)
    .sort((a, b) => {
      const scoreMap: Record<string, number> = { strong_buy: 2, buy: 1, neutral: 0, sell: -1, strong_sell: -2 };
      switch (sortBy) {
        case 'signal': return (scoreMap[b.overallSignal.type] || 0) - (scoreMap[a.overallSignal.type] || 0);
        case 'rsi': return a.rsi - b.rsi;
        case 'drawdown': return a.drawdown - b.drawdown;
        case 'volume': return b.volumeRatio - a.volumeRatio;
        default: return 0;
      }
    });

  const categories: { key: Category; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'Equity', label: 'Equities' },
    { key: 'Tech', label: 'Tech' },
    { key: 'Leveraged', label: 'Leveraged' },
    { key: 'Crypto', label: 'Crypto' },
    { key: 'Crypto ETF', label: 'Crypto ETFs' },
    { key: 'Commodities', label: 'Commodities' },
    { key: 'Bonds', label: 'Bonds' },
  ];

  const strongBuyCount = assets.filter(a => a.overallSignal.type === 'strong_buy').length;
  const buyCount = assets.filter(a => a.overallSignal.type === 'buy').length;
  const oversoldCount = assets.filter(a => a.rsi < 30).length;
  const capitulationCount = assets.filter(a => a.volumeRatio > 2.5 && a.rsi < 30).length;

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Day Trading Signals</h1>
          <p className="text-gray-400 mt-1">
            Live RSI, capitulation, volume spikes, and buy signals across all assets
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={refresh}
            disabled={loading}
            className="text-xs bg-[#1e293b] text-gray-300 px-3 py-1.5 rounded-lg hover:bg-[#334155] transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`} />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Strong Buy Signals', value: strongBuyCount.toString(), color: 'text-green-400', bg: 'bg-green-500/15' },
          { label: 'Buy Signals', value: buyCount.toString(), color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
          { label: 'Oversold (RSI < 30)', value: oversoldCount.toString(), color: 'text-amber-400', bg: 'bg-amber-500/15' },
          { label: 'Capitulation Alerts', value: capitulationCount.toString(), color: 'text-red-400', bg: 'bg-red-500/15' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} border border-white/5 rounded-xl p-4`}>
            <div className="text-xs text-gray-400 mb-1">{stat.label}</div>
            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1 bg-[#111827] rounded-lg p-1">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filter === cat.key
                  ? 'bg-[#1e293b] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-[#111827] rounded-lg p-1">
          {[
            { key: 'signal' as const, label: 'Signal Strength' },
            { key: 'rsi' as const, label: 'Lowest RSI' },
            { key: 'drawdown' as const, label: 'Biggest Drop' },
            { key: 'volume' as const, label: 'Volume Spike' },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                sortBy === s.key
                  ? 'bg-[#1e293b] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && assets.length === 0 && (
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-12 text-center">
          <div className="animate-pulse text-green-400 text-lg font-semibold mb-2">Fetching Live Market Data...</div>
          <p className="text-gray-500 text-sm">Getting real-time quotes and computing signals for 30+ assets</p>
        </div>
      )}

      {/* Signal Table */}
      {filteredAssets.length > 0 && (
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e293b]">
                  <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Asset</th>
                  <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">Price</th>
                  <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">Change</th>
                  <th className="text-center text-xs text-gray-500 font-medium px-4 py-3">RSI</th>
                  <th className="text-center text-xs text-gray-500 font-medium px-4 py-3">Drawdown</th>
                  <th className="text-center text-xs text-gray-500 font-medium px-4 py-3">Volume</th>
                  <th className="text-center text-xs text-gray-500 font-medium px-4 py-3">Signal</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => (
                  <tr key={asset.ticker} className="border-b border-[#1e293b]/50 hover:bg-[#1e293b]/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-mono text-sm text-white font-medium">{asset.ticker}</div>
                      <div className="text-xs text-gray-500">{asset.name}</div>
                    </td>
                    <td className="text-right px-4 py-3">
                      <span className="text-sm text-white font-mono">
                        ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="text-right px-4 py-3">
                      <span className={`text-sm font-mono ${asset.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                      </span>
                    </td>
                    <td className="text-center px-4 py-3">
                      <span className={`text-sm font-mono font-medium ${
                        asset.rsi <= 30 ? 'text-green-400' : asset.rsi >= 70 ? 'text-red-400' : 'text-gray-300'
                      }`}>
                        {asset.rsi.toFixed(0)}
                      </span>
                    </td>
                    <td className="text-center px-4 py-3">
                      <span className={`text-sm font-mono ${
                        asset.drawdown <= -0.20 ? 'text-green-400' : asset.drawdown <= -0.10 ? 'text-amber-400' : 'text-gray-400'
                      }`}>
                        {(asset.drawdown * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center px-4 py-3">
                      <span className={`text-sm font-mono ${
                        asset.volumeRatio >= 2.5 ? 'text-green-400' : asset.volumeRatio >= 1.5 ? 'text-amber-400' : 'text-gray-400'
                      }`}>
                        {asset.volumeRatio.toFixed(1)}x
                      </span>
                    </td>
                    <td className="text-center px-4 py-3">
                      <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded border ${getSignalBg(asset.overallSignal.type as 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell')} ${getSignalColor(asset.overallSignal.type as 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell')}`}>
                        {asset.overallSignal.type === 'strong_buy' ? 'STRONG BUY' :
                         asset.overallSignal.type === 'buy' ? 'BUY' :
                         asset.overallSignal.type === 'sell' ? 'CAUTION' :
                         asset.overallSignal.type === 'strong_sell' ? 'SELL' : 'NEUTRAL'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Signal Cards for top opportunities */}
      {filteredAssets.filter(a => a.overallSignal.type === 'strong_buy' || a.overallSignal.type === 'buy').length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Top Opportunities</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {filteredAssets
              .filter((a) => a.overallSignal.type === 'strong_buy' || a.overallSignal.type === 'buy')
              .slice(0, 6)
              .map((asset) => (
                <div key={asset.ticker} className="space-y-2">
                  <h4 className="text-sm font-semibold text-white">{asset.ticker} - {asset.name}</h4>
                  <SignalCard signal={asset.rsiSignal} title="RSI Signal" />
                  <SignalCard signal={asset.drawdownSignal} title="Drawdown Signal" />
                  <SignalCard signal={asset.overallSignal} title="Overall Signal" />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Macro Panel */}
      <LiveMacroPanel />

      <div className="text-center py-4">
        <p className="text-xs text-gray-600">
          Live data from Yahoo Finance. Auto-refreshes every 30 seconds. For informational purposes only. Not financial advice.
        </p>
      </div>
    </div>
  );
}
