import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

export function formatLargeNumber(value: number): string {
  if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(1)}T`;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return formatCurrency(value);
}

export function getSignalColor(type: string): string {
  switch (type) {
    case 'strong_buy': return 'text-green-400';
    case 'buy': return 'text-emerald-400';
    case 'neutral': return 'text-amber-400';
    case 'sell': return 'text-orange-400';
    case 'strong_sell': return 'text-red-400';
    default: return 'text-gray-400';
  }
}

export function getSignalBg(type: string): string {
  switch (type) {
    case 'strong_buy': return 'bg-green-500/15 border-green-500/30';
    case 'buy': return 'bg-emerald-500/15 border-emerald-500/30';
    case 'neutral': return 'bg-amber-500/15 border-amber-500/30';
    case 'sell': return 'bg-orange-500/15 border-orange-500/30';
    case 'strong_sell': return 'bg-red-500/15 border-red-500/30';
    default: return 'bg-gray-500/15 border-gray-500/30';
  }
}

export function getRatingColor(rating: 'good' | 'neutral' | 'bad'): string {
  switch (rating) {
    case 'good': return 'text-green-400';
    case 'neutral': return 'text-amber-400';
    case 'bad': return 'text-red-400';
  }
}

export function getRatingBg(rating: 'good' | 'neutral' | 'bad'): string {
  switch (rating) {
    case 'good': return 'bg-green-500/15';
    case 'neutral': return 'bg-amber-500/15';
    case 'bad': return 'bg-red-500/15';
  }
}
