// Buy/sell signal calculations
// RSI, capitulation detection, drawdown analysis, and more

export interface Signal {
  type: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell';
  label: string;
  description: string;
  value: number;
  threshold: string;
}

export interface AssetSignals {
  ticker: string;
  name: string;
  price: number;
  rsi: Signal;
  drawdownFromHigh: Signal;
  capitulation: Signal;
  movingAverage: Signal;
  volumeSpike: Signal;
  overallSignal: Signal;
}

// RSI (Relative Strength Index) - 14 period default
export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50; // neutral if not enough data

  let gains = 0;
  let losses = 0;

  // Initial average gain/loss
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Smoothed RSI for remaining periods
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      avgGain = (avgGain * (period - 1) + change) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
    }
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

// RSI signal interpretation
export function rsiSignal(rsi: number): Signal {
  if (rsi <= 20) {
    return {
      type: 'strong_buy',
      label: 'Extremely Oversold',
      description: 'RSI is below 20, meaning this asset has been beaten down heavily. Historically, assets tend to bounce back from these levels. This could be a strong buying opportunity.',
      value: rsi,
      threshold: 'Below 20 = Extremely Oversold',
    };
  } else if (rsi <= 30) {
    return {
      type: 'buy',
      label: 'Oversold',
      description: 'RSI is below 30, which typically means the selling has been overdone. The asset might be due for a bounce. Many investors start buying at these levels.',
      value: rsi,
      threshold: 'Below 30 = Oversold',
    };
  } else if (rsi >= 80) {
    return {
      type: 'strong_sell',
      label: 'Extremely Overbought',
      description: 'RSI is above 80, meaning buyers have pushed the price up very aggressively. A pullback is likely. Consider taking some profits or waiting before buying more.',
      value: rsi,
      threshold: 'Above 80 = Extremely Overbought',
    };
  } else if (rsi >= 70) {
    return {
      type: 'sell',
      label: 'Overbought',
      description: 'RSI is above 70, suggesting the asset may be getting expensive in the short term. It does not mean it will crash, but a cooling off period is possible.',
      value: rsi,
      threshold: 'Above 70 = Overbought',
    };
  } else {
    return {
      type: 'neutral',
      label: 'Neutral',
      description: 'RSI is in the normal range (30-70). No extreme buying or selling pressure right now.',
      value: rsi,
      threshold: '30-70 = Neutral Zone',
    };
  }
}

// Current drawdown from all-time or 52-week high
export function currentDrawdown(prices: number[]): number {
  if (prices.length === 0) return 0;
  const peak = Math.max(...prices);
  const current = prices[prices.length - 1];
  return (current - peak) / peak;
}

// Drawdown signal interpretation
export function drawdownSignal(drawdown: number, assetName: string): Signal {
  const pct = Math.abs(drawdown) * 100;

  if (pct >= 40) {
    return {
      type: 'strong_buy',
      label: 'Severe Drawdown',
      description: `${assetName} is down ${pct.toFixed(1)}% from its high. Drops this large are rare and often represent major buying opportunities for long-term investors, though it can also mean something is fundamentally wrong. Do your research.`,
      value: drawdown,
      threshold: '40%+ drop = Potential capitulation',
    };
  } else if (pct >= 20) {
    return {
      type: 'buy',
      label: 'Bear Territory',
      description: `${assetName} is down ${pct.toFixed(1)}% from its high. This is officially bear market territory. Historically, buying during bear markets has rewarded patient investors.`,
      value: drawdown,
      threshold: '20-40% drop = Bear market',
    };
  } else if (pct >= 10) {
    return {
      type: 'neutral',
      label: 'Correction',
      description: `${assetName} is down ${pct.toFixed(1)}% from its high. This is a normal correction. Markets correct by 10% or more about once a year on average.`,
      value: drawdown,
      threshold: '10-20% drop = Correction',
    };
  } else if (pct >= 5) {
    return {
      type: 'neutral',
      label: 'Minor Pullback',
      description: `${assetName} is down ${pct.toFixed(1)}% from its high. This is a minor pullback and completely normal market behavior.`,
      value: drawdown,
      threshold: '5-10% drop = Pullback',
    };
  } else {
    return {
      type: 'neutral',
      label: 'Near Highs',
      description: `${assetName} is within ${pct.toFixed(1)}% of its high. The asset is performing well and near peak levels.`,
      value: drawdown,
      threshold: '0-5% from high = Near ATH',
    };
  }
}

// Capitulation detection
// Looks for: extreme volume + sharp price drop + low RSI
export function detectCapitulation(
  prices: number[],
  volumes: number[],
  period: number = 20
): Signal {
  if (prices.length < period + 5 || volumes.length < period + 5) {
    return {
      type: 'neutral',
      label: 'Insufficient Data',
      description: 'Not enough historical data to detect capitulation signals.',
      value: 0,
      threshold: 'Need 25+ days of data',
    };
  }

  const recentPrices = prices.slice(-period);
  const recentVolumes = volumes.slice(-period);

  // Check for sharp recent decline
  const priceChange5d = (prices[prices.length - 1] - prices[prices.length - 6]) / prices[prices.length - 6];

  // Check for volume spike (current volume vs 20-day average)
  const avgVolume = recentVolumes.slice(0, -1).reduce((s, v) => s + v, 0) / (recentVolumes.length - 1);
  const currentVolume = recentVolumes[recentVolumes.length - 1];
  const volumeRatio = avgVolume > 0 ? currentVolume / avgVolume : 1;

  // Check RSI
  const rsi = calculateRSI(prices);

  // Capitulation = sharp drop + high volume + low RSI
  const isCapitulating = priceChange5d < -0.10 && volumeRatio > 2.0 && rsi < 30;
  const isNearCapitulation = priceChange5d < -0.05 && volumeRatio > 1.5 && rsi < 40;

  if (isCapitulating) {
    return {
      type: 'strong_buy',
      label: 'Capitulation Detected',
      description: `Panic selling appears to be happening. The price dropped ${(Math.abs(priceChange5d) * 100).toFixed(1)}% in 5 days on ${volumeRatio.toFixed(1)}x normal volume with RSI at ${rsi.toFixed(0)}. This pattern often marks the bottom of a selloff. Historically, buying during capitulation has been very profitable for long-term holders.`,
      value: priceChange5d,
      threshold: '10%+ drop + 2x volume + RSI < 30',
    };
  } else if (isNearCapitulation) {
    return {
      type: 'buy',
      label: 'Elevated Selling Pressure',
      description: `Selling pressure is building. The price dropped ${(Math.abs(priceChange5d) * 100).toFixed(1)}% in 5 days on ${volumeRatio.toFixed(1)}x normal volume. Watch for further weakness as a potential buying opportunity.`,
      value: priceChange5d,
      threshold: '5%+ drop + 1.5x volume + RSI < 40',
    };
  } else {
    return {
      type: 'neutral',
      label: 'No Capitulation',
      description: 'No signs of panic selling. Markets are trading normally.',
      value: 0,
      threshold: 'Normal trading conditions',
    };
  }
}

// Simple Moving Average crossover signal
export function movingAverageSignal(prices: number[]): Signal {
  if (prices.length < 200) {
    return {
      type: 'neutral',
      label: 'Insufficient Data',
      description: 'Need at least 200 days of data for moving average analysis.',
      value: 0,
      threshold: 'Need 200+ days',
    };
  }

  const sma50 = prices.slice(-50).reduce((s, p) => s + p, 0) / 50;
  const sma200 = prices.slice(-200).reduce((s, p) => s + p, 0) / 200;
  const currentPrice = prices[prices.length - 1];

  const aboveSMA50 = currentPrice > sma50;
  const aboveSMA200 = currentPrice > sma200;
  const goldenCross = sma50 > sma200;

  if (aboveSMA50 && aboveSMA200 && goldenCross) {
    return {
      type: 'buy',
      label: 'Bullish Trend',
      description: 'Price is above both the 50-day and 200-day moving averages, and the 50-day is above the 200-day (Golden Cross). This is a strong uptrend signal.',
      value: (currentPrice / sma200 - 1) * 100,
      threshold: 'Price > 50 SMA > 200 SMA',
    };
  } else if (!aboveSMA50 && !aboveSMA200 && !goldenCross) {
    return {
      type: 'sell',
      label: 'Bearish Trend',
      description: 'Price is below both the 50-day and 200-day moving averages, and the 50-day is below the 200-day (Death Cross). The trend is down. Consider waiting for a reversal before buying.',
      value: (currentPrice / sma200 - 1) * 100,
      threshold: 'Price < 50 SMA < 200 SMA',
    };
  } else if (!aboveSMA50 && aboveSMA200) {
    return {
      type: 'neutral',
      label: 'Pullback in Uptrend',
      description: 'Price dipped below the 50-day average but is still above the 200-day. This could be a healthy pullback and a potential buy-the-dip moment.',
      value: (currentPrice / sma50 - 1) * 100,
      threshold: '200 SMA < Price < 50 SMA',
    };
  } else {
    return {
      type: 'neutral',
      label: 'Mixed Signals',
      description: 'Moving averages are giving mixed signals. The trend is not clearly bullish or bearish. Wait for more clarity.',
      value: 0,
      threshold: 'Conflicting MA signals',
    };
  }
}

// Volume spike detection
export function volumeSpikeSignal(volumes: number[], prices: number[]): Signal {
  if (volumes.length < 21) {
    return {
      type: 'neutral',
      label: 'Insufficient Data',
      description: 'Need at least 21 days of volume data.',
      value: 0,
      threshold: 'Need 21+ days',
    };
  }

  const avgVolume = volumes.slice(-21, -1).reduce((s, v) => s + v, 0) / 20;
  const currentVolume = volumes[volumes.length - 1];
  const volumeRatio = avgVolume > 0 ? currentVolume / avgVolume : 1;
  const priceChange = prices.length >= 2
    ? (prices[prices.length - 1] - prices[prices.length - 2]) / prices[prices.length - 2]
    : 0;

  if (volumeRatio > 3 && priceChange < -0.03) {
    return {
      type: 'strong_buy',
      label: 'Climactic Selling',
      description: `Volume is ${volumeRatio.toFixed(1)}x the 20-day average with a ${(priceChange * 100).toFixed(1)}% price drop. This kind of high-volume selling often marks a short-term bottom as weak hands exit.`,
      value: volumeRatio,
      threshold: '3x+ volume with price drop',
    };
  } else if (volumeRatio > 3 && priceChange > 0.03) {
    return {
      type: 'buy',
      label: 'Breakout Volume',
      description: `Volume is ${volumeRatio.toFixed(1)}x the 20-day average with a ${(priceChange * 100).toFixed(1)}% price gain. High volume on up days confirms buying interest and can signal the start of a new move higher.`,
      value: volumeRatio,
      threshold: '3x+ volume with price gain',
    };
  } else if (volumeRatio > 2) {
    return {
      type: 'neutral',
      label: 'Elevated Volume',
      description: `Volume is ${volumeRatio.toFixed(1)}x normal. Something is attracting attention. Watch the price direction to determine if this is bullish or bearish.`,
      value: volumeRatio,
      threshold: '2-3x normal volume',
    };
  } else {
    return {
      type: 'neutral',
      label: 'Normal Volume',
      description: 'Trading volume is within the normal range. No unusual activity detected.',
      value: volumeRatio,
      threshold: 'Normal trading volume',
    };
  }
}

// Calculate overall signal from all individual signals
export function overallSignal(signals: Signal[]): Signal {
  const scoreMap = {
    strong_buy: 2,
    buy: 1,
    neutral: 0,
    sell: -1,
    strong_sell: -2,
  };

  const totalScore = signals.reduce((sum, s) => sum + scoreMap[s.type], 0);
  const avgScore = totalScore / signals.length;

  if (avgScore >= 1.5) {
    return {
      type: 'strong_buy',
      label: 'Strong Buy Signal',
      description: 'Multiple indicators are pointing to a strong buying opportunity. The asset shows oversold conditions, potential capitulation, and favorable technical patterns.',
      value: avgScore,
      threshold: 'Average signal score >= 1.5',
    };
  } else if (avgScore >= 0.5) {
    return {
      type: 'buy',
      label: 'Buy Signal',
      description: 'The balance of indicators leans bullish. More signals suggest buying than selling. Consider adding to positions or starting a new one.',
      value: avgScore,
      threshold: 'Average signal score 0.5-1.5',
    };
  } else if (avgScore <= -1.5) {
    return {
      type: 'strong_sell',
      label: 'Strong Caution',
      description: 'Multiple indicators suggest this is not a good time to buy. The asset is overbought or in a strong downtrend with no signs of reversal yet.',
      value: avgScore,
      threshold: 'Average signal score <= -1.5',
    };
  } else if (avgScore <= -0.5) {
    return {
      type: 'sell',
      label: 'Caution',
      description: 'More signals lean bearish than bullish. Consider waiting for better conditions before buying.',
      value: avgScore,
      threshold: 'Average signal score -1.5 to -0.5',
    };
  } else {
    return {
      type: 'neutral',
      label: 'Hold / Wait',
      description: 'Signals are mixed with no clear direction. No strong reason to buy or sell right now. Wait for a clearer setup.',
      value: avgScore,
      threshold: 'Average signal score -0.5 to 0.5',
    };
  }
}

// Assets to track for buy signals
export const TRACKED_ASSETS = [
  { ticker: 'SPY', name: 'S&P 500 ETF', category: 'Equity' },
  { ticker: 'QQQ', name: 'Nasdaq 100 ETF', category: 'Equity' },
  { ticker: 'QQQM', name: 'Invesco Nasdaq 100', category: 'Equity' },
  { ticker: 'FXAIX', name: 'Fidelity 500 Index', category: 'Equity' },
  { ticker: 'SOXL', name: 'Direxion Semi Bull 3X', category: 'Leveraged' },
  { ticker: 'TQQQ', name: 'ProShares UltraPro QQQ', category: 'Leveraged' },
  { ticker: 'UPRO', name: 'ProShares UltraPro S&P', category: 'Leveraged' },
  { ticker: 'BITX', name: '2x Bitcoin Strategy', category: 'Crypto ETF' },
  { ticker: 'ETHU', name: '2x Ether ETF', category: 'Crypto ETF' },
  { ticker: 'BTC-USD', name: 'Bitcoin', category: 'Crypto' },
  { ticker: 'ETH-USD', name: 'Ethereum', category: 'Crypto' },
  { ticker: 'GLD', name: 'SPDR Gold Trust', category: 'Commodities' },
  { ticker: 'SLV', name: 'iShares Silver Trust', category: 'Commodities' },
  { ticker: 'GDX', name: 'VanEck Gold Miners', category: 'Commodities' },
  { ticker: 'AAPL', name: 'Apple', category: 'Tech' },
  { ticker: 'MSFT', name: 'Microsoft', category: 'Tech' },
  { ticker: 'NVDA', name: 'NVIDIA', category: 'Tech' },
  { ticker: 'GOOG', name: 'Alphabet', category: 'Tech' },
  { ticker: 'AMZN', name: 'Amazon', category: 'Tech' },
  { ticker: 'META', name: 'Meta Platforms', category: 'Tech' },
  { ticker: 'TSLA', name: 'Tesla', category: 'Tech' },
  { ticker: 'VTI', name: 'Vanguard Total Market', category: 'Equity' },
  { ticker: 'SCHD', name: 'Schwab US Dividend', category: 'Equity' },
  { ticker: 'VOO', name: 'Vanguard S&P 500', category: 'Equity' },
  { ticker: 'IWM', name: 'Russell 2000 ETF', category: 'Equity' },
  { ticker: 'DIA', name: 'Dow Jones ETF', category: 'Equity' },
  { ticker: 'XLE', name: 'Energy Select SPDR', category: 'Sector' },
  { ticker: 'XLF', name: 'Financial Select SPDR', category: 'Sector' },
  { ticker: 'XLK', name: 'Technology Select SPDR', category: 'Sector' },
  { ticker: 'TLT', name: '20+ Year Treasury Bond', category: 'Bonds' },
  { ticker: 'AGG', name: 'US Aggregate Bond', category: 'Bonds' },
];
