'use client';

import { useState } from 'react';
import type { Signal } from '@/lib/analytics/signals';
import { getSignalColor, getSignalBg } from '@/lib/utils';

export default function SignalCard({
  signal,
  title,
}: {
  signal: Signal;
  title?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const signalLabel = {
    strong_buy: 'STRONG BUY',
    buy: 'BUY',
    neutral: 'NEUTRAL',
    sell: 'CAUTION',
    strong_sell: 'STRONG CAUTION',
  }[signal.type];

  return (
    <div
      className={`border rounded-xl p-4 cursor-pointer transition-all ${getSignalBg(signal.type)}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between">
        <div>
          {title && <div className="text-xs text-gray-400 mb-1">{title}</div>}
          <div className="text-sm font-medium text-white">{signal.label}</div>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded ${getSignalColor(signal.type)} bg-black/30`}>
          {signalLabel}
        </span>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/10 fade-in">
          <p className="text-sm text-gray-300 leading-relaxed">{signal.description}</p>
          <p className="text-xs text-gray-500 mt-2">{signal.threshold}</p>
        </div>
      )}
    </div>
  );
}
