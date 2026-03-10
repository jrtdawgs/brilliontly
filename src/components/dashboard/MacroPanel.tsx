'use client';

import { getVIXSignal, getDollarSignal, getRateEnvironment, getYieldCurveSignal } from '@/lib/analytics/macro';
import { getSignalColor, getSignalBg } from '@/lib/utils';

interface MacroData {
  vix: number;
  dollarIndex: number;
  dollarChange: number;
  tenYearYield: number;
  twoYearYield: number;
  thirteenWeekYield: number;
}

// Demo data - replaced by real API data in production
const DEMO_MACRO: MacroData = {
  vix: 18.5,
  dollarIndex: 103.2,
  dollarChange: -0.3,
  tenYearYield: 4.25,
  twoYearYield: 4.65,
  thirteenWeekYield: 5.25,
};

export default function MacroPanel({ data = DEMO_MACRO }: { data?: MacroData }) {
  const vixSignal = getVIXSignal(data.vix);
  const dollarSignal = getDollarSignal(data.dollarIndex, data.dollarChange);
  const rateEnv = getRateEnvironment(data.tenYearYield, data.thirteenWeekYield);
  const yieldCurve = getYieldCurveSignal(data.tenYearYield, data.twoYearYield);

  const indicators = [
    {
      name: 'VIX (Fear Index)',
      value: data.vix.toFixed(1),
      signal: vixSignal.signal,
      description: vixSignal.description,
    },
    {
      name: 'US Dollar Index',
      value: data.dollarIndex.toFixed(1),
      signal: dollarSignal.signal,
      description: dollarSignal.description,
    },
    {
      name: '10Y Treasury Yield',
      value: `${data.tenYearYield.toFixed(2)}%`,
      signal: rateEnv.signal,
      description: rateEnv.description,
      extra: rateEnv.environment,
    },
    {
      name: 'Yield Curve (10Y-2Y)',
      value: `${yieldCurve.spread.toFixed(2)}%`,
      signal: yieldCurve.signal,
      description: yieldCurve.description,
    },
  ];

  const signalMap = {
    bullish: 'buy' as const,
    bearish: 'sell' as const,
    neutral: 'neutral' as const,
  };

  return (
    <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Market Conditions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {indicators.map((ind) => (
          <div
            key={ind.name}
            className={`border rounded-lg p-4 ${getSignalBg(signalMap[ind.signal])}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">{ind.name}</span>
              <span className={`text-xs font-semibold uppercase ${getSignalColor(signalMap[ind.signal])}`}>
                {ind.signal}
              </span>
            </div>
            <div className="text-xl font-bold text-white">{ind.value}</div>
            {ind.extra && (
              <div className="text-xs text-gray-400 mt-1">{ind.extra}</div>
            )}
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">{ind.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
