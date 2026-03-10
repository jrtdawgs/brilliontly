'use client';

import { useState } from 'react';
import SignalCard from '@/components/dashboard/SignalCard';
import MacroPanel from '@/components/dashboard/MacroPanel';
import { getSignalColor, getSignalBg } from '@/lib/utils';
import type { Signal } from '@/lib/analytics/signals';

type Category = 'all' | 'equity' | 'leveraged' | 'crypto' | 'commodities' | 'sector';

interface AssetRow {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
  rsi: number;
  rsiSignal: Signal;
  drawdown: number;
  drawdownSignal: Signal;
  volumeRatio: number;
  volumeSignal: Signal;
  overallSignal: Signal;
  category: Category;
}

// Demo signal data - replaced by real API in production
const DEMO_ASSETS: AssetRow[] = [
  {
    ticker: 'SPY', name: 'S&P 500 ETF', price: 522.45, changePercent: 0.45, rsi: 52,
    rsiSignal: { type: 'neutral', label: 'Neutral', description: 'RSI at 52. No extreme reading.', value: 52, threshold: '30-70' },
    drawdown: -0.035, drawdownSignal: { type: 'neutral', label: 'Near Highs', description: 'SPY is within 3.5% of its high.', value: -0.035, threshold: '0-5%' },
    volumeRatio: 1.1, volumeSignal: { type: 'neutral', label: 'Normal Volume', description: 'Normal trading volume.', value: 1.1, threshold: 'Normal' },
    overallSignal: { type: 'neutral', label: 'Hold / Wait', description: 'No clear signal. Market is in a normal range.', value: 0, threshold: 'Mixed' },
    category: 'equity',
  },
  {
    ticker: 'QQQ', name: 'Nasdaq 100', price: 438.20, changePercent: -0.82, rsi: 38,
    rsiSignal: { type: 'neutral', label: 'Slightly Weak', description: 'RSI at 38. Getting close to oversold but not there yet.', value: 38, threshold: '30-70' },
    drawdown: -0.078, drawdownSignal: { type: 'neutral', label: 'Pullback', description: 'QQQ is down 7.8% from its high. Minor pullback territory.', value: -0.078, threshold: '5-10%' },
    volumeRatio: 1.4, volumeSignal: { type: 'neutral', label: 'Slightly Elevated', description: 'Volume is 1.4x the 20-day average.', value: 1.4, threshold: 'Normal-ish' },
    overallSignal: { type: 'neutral', label: 'Watch Closely', description: 'QQQ is pulling back. If RSI drops below 30, it could be a buying opportunity.', value: -0.2, threshold: 'Approaching buy zone' },
    category: 'equity',
  },
  {
    ticker: 'SOXL', name: '3x Semiconductors', price: 18.45, changePercent: 4.21, rsi: 22,
    rsiSignal: { type: 'strong_buy', label: 'Extremely Oversold', description: 'RSI at 22 is deeply oversold. SOXL has been crushed and may bounce hard.', value: 22, threshold: 'Below 25' },
    drawdown: -0.42, drawdownSignal: { type: 'strong_buy', label: 'Severe Drawdown', description: 'SOXL is down 42% from its high. This is extreme for even a leveraged ETF.', value: -0.42, threshold: '40%+' },
    volumeRatio: 2.8, volumeSignal: { type: 'strong_buy', label: 'Climactic Selling', description: 'Volume is 2.8x the 20-day average on a big move. This looks like capitulation selling.', value: 2.8, threshold: '2.5x+' },
    overallSignal: { type: 'strong_buy', label: 'Capitulation Signal', description: 'Multiple indicators show extreme oversold conditions with panic selling. Historically a strong short-term buying opportunity for a bounce trade.', value: 1.8, threshold: 'All signals aligned' },
    category: 'leveraged',
  },
  {
    ticker: 'TQQQ', name: '3x Nasdaq', price: 52.30, changePercent: -2.46, rsi: 29,
    rsiSignal: { type: 'buy', label: 'Oversold', description: 'RSI just hit 29. TQQQ is oversold and could bounce.', value: 29, threshold: 'Below 30' },
    drawdown: -0.22, drawdownSignal: { type: 'buy', label: 'Bear Territory', description: 'TQQQ is down 22% from highs. Bear market territory for a leveraged ETF.', value: -0.22, threshold: '20-40%' },
    volumeRatio: 1.8, volumeSignal: { type: 'neutral', label: 'Elevated Volume', description: 'Volume is 1.8x normal. Selling pressure is building.', value: 1.8, threshold: '1.5-2x' },
    overallSignal: { type: 'buy', label: 'Buy Signal', description: 'RSI is oversold and drawdown is significant. Could be a good entry for a swing trade.', value: 0.8, threshold: 'Oversold + drawdown' },
    category: 'leveraged',
  },
  {
    ticker: 'NVDA', name: 'NVIDIA', price: 875.40, changePercent: 2.15, rsi: 45,
    rsiSignal: { type: 'neutral', label: 'Neutral', description: 'RSI at 45. Mid-range, no signal.', value: 45, threshold: '30-70' },
    drawdown: -0.12, drawdownSignal: { type: 'neutral', label: 'Correction', description: 'NVDA is down 12% from highs. Normal correction territory.', value: -0.12, threshold: '10-20%' },
    volumeRatio: 1.3, volumeSignal: { type: 'neutral', label: 'Normal Volume', description: 'Volume is within normal range.', value: 1.3, threshold: 'Normal' },
    overallSignal: { type: 'neutral', label: 'Neutral', description: 'No strong signal either way. NVDA is in a correction but not oversold yet.', value: 0, threshold: 'Mixed' },
    category: 'equity',
  },
  {
    ticker: 'BTC-USD', name: 'Bitcoin', price: 67250, changePercent: 2.15, rsi: 31,
    rsiSignal: { type: 'buy', label: 'Nearly Oversold', description: 'Bitcoin RSI at 31, just above oversold. Could be getting ready to bounce.', value: 31, threshold: 'Near 30' },
    drawdown: -0.18, drawdownSignal: { type: 'neutral', label: 'Pullback', description: 'Bitcoin is down 18% from its all-time high. Standard crypto pullback.', value: -0.18, threshold: '10-20%' },
    volumeRatio: 1.6, volumeSignal: { type: 'neutral', label: 'Elevated Volume', description: 'Trading volume is 1.6x normal. Interest is picking up.', value: 1.6, threshold: '1.5-2x' },
    overallSignal: { type: 'buy', label: 'Buying Opportunity', description: 'Bitcoin is pulling back with RSI approaching oversold. Historically, buying BTC near RSI 30 has been profitable.', value: 0.7, threshold: 'RSI + drawdown' },
    category: 'crypto',
  },
  {
    ticker: 'ETH-USD', name: 'Ethereum', price: 3420, changePercent: 1.87, rsi: 35,
    rsiSignal: { type: 'neutral', label: 'Weak but Not Oversold', description: 'RSI at 35. Approaching oversold but not quite there.', value: 35, threshold: '30-40' },
    drawdown: -0.28, drawdownSignal: { type: 'buy', label: 'Bear Territory', description: 'ETH is down 28% from highs. Significant pullback.', value: -0.28, threshold: '20-40%' },
    volumeRatio: 1.2, volumeSignal: { type: 'neutral', label: 'Normal Volume', description: 'Volume is within normal range.', value: 1.2, threshold: 'Normal' },
    overallSignal: { type: 'neutral', label: 'Watch Closely', description: 'ETH has pulled back significantly but RSI is not yet oversold. Wait for RSI below 30 for a stronger signal.', value: 0.2, threshold: 'Partial signal' },
    category: 'crypto',
  },
  {
    ticker: 'BITX', name: '2x Bitcoin ETF', price: 32.50, changePercent: 3.42, rsi: 28,
    rsiSignal: { type: 'buy', label: 'Oversold', description: 'BITX RSI at 28 is oversold. The leveraged Bitcoin ETF has been hit hard.', value: 28, threshold: 'Below 30' },
    drawdown: -0.31, drawdownSignal: { type: 'buy', label: 'Bear Territory', description: 'BITX is down 31% from highs. Major pullback for a leveraged product.', value: -0.31, threshold: '20-40%' },
    volumeRatio: 2.1, volumeSignal: { type: 'buy', label: 'Elevated Volume', description: 'Volume is 2.1x normal on a big move.', value: 2.1, threshold: '2x+' },
    overallSignal: { type: 'buy', label: 'Strong Buy Signal', description: 'BITX shows oversold RSI, significant drawdown, and elevated volume. Multiple indicators support a bounce trade.', value: 1.2, threshold: 'Multiple signals aligned' },
    category: 'leveraged',
  },
  {
    ticker: 'GLD', name: 'SPDR Gold', price: 215.80, changePercent: 0.32, rsi: 62,
    rsiSignal: { type: 'neutral', label: 'Neutral', description: 'Gold RSI at 62. Trending higher but not overbought.', value: 62, threshold: '30-70' },
    drawdown: -0.02, drawdownSignal: { type: 'neutral', label: 'Near All-Time Highs', description: 'Gold is within 2% of its all-time high.', value: -0.02, threshold: '0-5%' },
    volumeRatio: 1.0, volumeSignal: { type: 'neutral', label: 'Normal Volume', description: 'Trading volume is normal.', value: 1.0, threshold: 'Normal' },
    overallSignal: { type: 'neutral', label: 'Bullish Trend', description: 'Gold is in a strong uptrend near highs. Not a great entry but the trend is your friend.', value: 0.3, threshold: 'Uptrend' },
    category: 'commodities',
  },
  {
    ticker: 'SLV', name: 'iShares Silver', price: 28.40, changePercent: -0.45, rsi: 48,
    rsiSignal: { type: 'neutral', label: 'Neutral', description: 'Silver RSI at 48. Mid-range.', value: 48, threshold: '30-70' },
    drawdown: -0.08, drawdownSignal: { type: 'neutral', label: 'Minor Pullback', description: 'Silver is down 8% from recent highs.', value: -0.08, threshold: '5-10%' },
    volumeRatio: 0.9, volumeSignal: { type: 'neutral', label: 'Normal Volume', description: 'Trading volume is below average.', value: 0.9, threshold: 'Normal' },
    overallSignal: { type: 'neutral', label: 'No Signal', description: 'Silver has no clear directional signal right now.', value: 0, threshold: 'Neutral' },
    category: 'commodities',
  },
  {
    ticker: 'TSLA', name: 'Tesla', price: 178.50, changePercent: -1.23, rsi: 33,
    rsiSignal: { type: 'neutral', label: 'Weak', description: 'Tesla RSI at 33. Getting close to oversold territory.', value: 33, threshold: '30-40' },
    drawdown: -0.32, drawdownSignal: { type: 'buy', label: 'Bear Territory', description: 'Tesla is down 32% from its high. Deep correction.', value: -0.32, threshold: '20-40%' },
    volumeRatio: 1.5, volumeSignal: { type: 'neutral', label: 'Slightly Elevated', description: 'Volume is 1.5x normal.', value: 1.5, threshold: '1-2x' },
    overallSignal: { type: 'neutral', label: 'Approaching Buy Zone', description: 'Tesla is deeply discounted but RSI needs to drop below 30 for a clear buy signal.', value: 0.3, threshold: 'Partial signal' },
    category: 'equity',
  },
];

export default function DayTradingPage() {
  const [filter, setFilter] = useState<Category>('all');
  const [sortBy, setSortBy] = useState<'signal' | 'rsi' | 'drawdown' | 'volume'>('signal');

  const filteredAssets = DEMO_ASSETS
    .filter((a) => filter === 'all' || a.category === filter)
    .sort((a, b) => {
      const scoreMap = { strong_buy: 2, buy: 1, neutral: 0, sell: -1, strong_sell: -2 };
      switch (sortBy) {
        case 'signal': return scoreMap[b.overallSignal.type] - scoreMap[a.overallSignal.type];
        case 'rsi': return a.rsi - b.rsi;
        case 'drawdown': return a.drawdown - b.drawdown;
        case 'volume': return b.volumeRatio - a.volumeRatio;
        default: return 0;
      }
    });

  const categories: { key: Category; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'equity', label: 'Equities' },
    { key: 'leveraged', label: 'Leveraged' },
    { key: 'crypto', label: 'Crypto' },
    { key: 'commodities', label: 'Commodities' },
  ];

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Day Trading Signals</h1>
        <p className="text-gray-400 mt-1">RSI, capitulation, volume spikes, and buy signals across all assets</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Strong Buy Signals', value: DEMO_ASSETS.filter(a => a.overallSignal.type === 'strong_buy').length.toString(), color: 'text-green-400', bg: 'bg-green-500/15' },
          { label: 'Buy Signals', value: DEMO_ASSETS.filter(a => a.overallSignal.type === 'buy').length.toString(), color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
          { label: 'Oversold (RSI < 30)', value: DEMO_ASSETS.filter(a => a.rsi < 30).length.toString(), color: 'text-amber-400', bg: 'bg-amber-500/15' },
          { label: 'Capitulation Alerts', value: DEMO_ASSETS.filter(a => a.volumeRatio > 2.5 && a.rsi < 30).length.toString(), color: 'text-red-400', bg: 'bg-red-500/15' },
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

      {/* Signal Table */}
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
                    <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded border ${getSignalBg(asset.overallSignal.type)} ${getSignalColor(asset.overallSignal.type)}`}>
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

      {/* Detailed Signal Cards for top opportunities */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Top Opportunities</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {filteredAssets
            .filter((a) => a.overallSignal.type === 'strong_buy' || a.overallSignal.type === 'buy')
            .map((asset) => (
              <div key={asset.ticker} className="space-y-2">
                <h4 className="text-sm font-semibold text-white">{asset.ticker} - {asset.name}</h4>
                <SignalCard signal={asset.rsiSignal} title="RSI Signal" />
                <SignalCard signal={asset.drawdownSignal} title="Drawdown Signal" />
                <SignalCard signal={asset.volumeSignal} title="Volume Signal" />
                <SignalCard signal={asset.overallSignal} title="Overall Signal" />
              </div>
            ))}
        </div>
      </div>

      {/* Macro Panel */}
      <MacroPanel />

      <div className="text-center py-4">
        <p className="text-xs text-gray-600">
          For informational purposes only. Not financial advice. Day trading carries significant risk of loss.
        </p>
      </div>
    </div>
  );
}
