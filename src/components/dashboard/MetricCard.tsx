'use client';

import { useState } from 'react';
import type { MetricResult } from '@/lib/analytics/metrics';
import { formatPercent, formatNumber, formatCurrency, getRatingColor, getRatingBg } from '@/lib/utils';

export default function MetricCard({ metric }: { metric: MetricResult }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const formattedValue = (() => {
    switch (metric.format) {
      case 'percent': return formatPercent(metric.value);
      case 'ratio': return formatNumber(metric.value);
      case 'currency': return formatCurrency(metric.value);
      case 'number': return formatNumber(metric.value);
    }
  })();

  return (
    <div
      className={`metric-card relative bg-[#111827] border border-[#1e293b] rounded-xl p-4 cursor-pointer ${getRatingBg(metric.rating)}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip(!showTooltip)}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400 uppercase tracking-wider">{metric.label}</span>
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className={`text-2xl font-bold ${getRatingColor(metric.rating)}`}>
        {formattedValue}
      </div>
      <div className={`text-xs mt-1 ${getRatingColor(metric.rating)}`}>
        {metric.rating === 'good' ? 'Good' : metric.rating === 'neutral' ? 'Moderate' : 'Needs Attention'}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#1e293b] border border-[#334155] rounded-lg p-3 text-sm text-gray-300 shadow-xl z-10 fade-in">
          {metric.description}
        </div>
      )}
    </div>
  );
}
