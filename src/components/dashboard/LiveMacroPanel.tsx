'use client';

import { useMacroData } from '@/lib/hooks/useMarketData';
import { getVIXSignal, getDollarSignal, getRateEnvironment, getYieldCurveSignal } from '@/lib/analytics/macro';
import { getSignalColor, getSignalBg } from '@/lib/utils';

export default function LiveMacroPanel() {
  const { data, loading, lastUpdated } = useMacroData(10_000);

  const signalMap = {
    bullish: 'buy' as const,
    bearish: 'sell' as const,
    neutral: 'neutral' as const,
  };

  if (loading && !data) {
    return (
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Market Conditions</h3>
        <div className="animate-pulse text-gray-500 text-center py-8">Loading live macro data...</div>
      </div>
    );
  }

  if (!data) return null;

  const vixPrice = data.vix?.price ?? 20;
  const dollarPrice = data.dollarIndex?.price ?? 100;
  const dollarChange = data.dollarIndex?.changePercent ?? 0;
  const tenYield = data.tenYearYield?.price ?? 4.0;
  const twoYield = data.fiveYearYield?.price ?? 4.0; // Using 5Y as proxy when 2Y unavailable
  const thirteenWeekYield = data.thirteenWeekYield?.price ?? 5.0;

  const vixSignal = getVIXSignal(vixPrice);
  const dollarSignal = getDollarSignal(dollarPrice, dollarChange);
  const rateEnv = getRateEnvironment(tenYield, thirteenWeekYield);
  const yieldCurve = getYieldCurveSignal(tenYield, twoYield);

  const indicators = [
    {
      name: 'VIX (Fear Index)',
      value: vixPrice.toFixed(2),
      change: data.vix ? `${data.vix.changePercent >= 0 ? '+' : ''}${data.vix.changePercent.toFixed(2)}%` : '',
      signal: vixSignal.signal,
      description: vixSignal.description,
    },
    {
      name: 'US Dollar Index',
      value: dollarPrice.toFixed(2),
      change: data.dollarIndex ? `${data.dollarIndex.changePercent >= 0 ? '+' : ''}${data.dollarIndex.changePercent.toFixed(2)}%` : '',
      signal: dollarSignal.signal,
      description: dollarSignal.description,
    },
    {
      name: '10Y Treasury Yield',
      value: `${tenYield.toFixed(3)}%`,
      change: data.tenYearYield ? `${data.tenYearYield.change >= 0 ? '+' : ''}${data.tenYearYield.change.toFixed(3)}` : '',
      signal: rateEnv.signal,
      description: rateEnv.description,
      extra: rateEnv.environment,
    },
    {
      name: 'Yield Curve (10Y-5Y)',
      value: `${yieldCurve.spread.toFixed(3)}%`,
      signal: yieldCurve.signal,
      description: yieldCurve.description,
    },
  ];

  // Add TLT and Gold if available
  if (data.tlt) {
    indicators.push({
      name: 'TLT (20Y+ Bonds)',
      value: `$${data.tlt.price.toFixed(2)}`,
      change: `${data.tlt.changePercent >= 0 ? '+' : ''}${data.tlt.changePercent.toFixed(2)}%`,
      signal: data.tlt.changePercent > 0.5 ? 'bullish' : data.tlt.changePercent < -0.5 ? 'bearish' : 'neutral',
      description: data.tlt.changePercent > 0.5
        ? 'Bonds are rallying. Investors are seeking safety, which may signal risk-off sentiment.'
        : data.tlt.changePercent < -0.5
        ? 'Bonds are selling off. Rising yields may put pressure on growth stocks.'
        : 'Bond market is relatively calm today.',
    });
  }

  if (data.gold) {
    indicators.push({
      name: 'Gold (GLD)',
      value: `$${data.gold.price.toFixed(2)}`,
      change: `${data.gold.changePercent >= 0 ? '+' : ''}${data.gold.changePercent.toFixed(2)}%`,
      signal: data.gold.changePercent > 0.5 ? 'bullish' : data.gold.changePercent < -0.5 ? 'bearish' : 'neutral',
      description: data.gold.changePercent > 0.5
        ? 'Gold is rising. Investors may be hedging against inflation or uncertainty.'
        : data.gold.changePercent < -0.5
        ? 'Gold is declining. Risk appetite may be increasing.'
        : 'Gold is trading relatively flat today.',
    });
  }

  return (
    <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Market Conditions</h3>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              Live {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {indicators.map((ind) => (
          <div
            key={ind.name}
            className={`border rounded-lg p-4 ${getSignalBg(signalMap[ind.signal as keyof typeof signalMap] || 'neutral')}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">{ind.name}</span>
              <span className={`text-xs font-semibold uppercase ${getSignalColor(signalMap[ind.signal as keyof typeof signalMap] || 'neutral')}`}>
                {ind.signal}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-xl font-bold text-white">{ind.value}</div>
              {ind.change && (
                <span className={`text-xs font-mono ${
                  ind.change.startsWith('+') ? 'text-green-400' : ind.change.startsWith('-') ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {ind.change}
                </span>
              )}
            </div>
            {'extra' in ind && ind.extra && (
              <div className="text-xs text-gray-400 mt-1">{ind.extra}</div>
            )}
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">{ind.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
