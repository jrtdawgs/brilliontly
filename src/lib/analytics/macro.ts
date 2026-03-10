// Macro indicators: VIX, Dollar, Interest Rates, Bond Metrics
// These provide market context for investment decisions

export interface MacroIndicator {
  ticker: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  signal: 'bullish' | 'bearish' | 'neutral';
  description: string;
  category: 'fear' | 'currency' | 'rates' | 'bonds';
}

// Macro tickers to track
export const MACRO_TICKERS = [
  { ticker: '^VIX', name: 'CBOE Volatility Index (VIX)', category: 'fear' as const },
  { ticker: 'DX-Y.NYB', name: 'US Dollar Index', category: 'currency' as const },
  { ticker: '^TNX', name: '10-Year Treasury Yield', category: 'rates' as const },
  { ticker: '^FVX', name: '5-Year Treasury Yield', category: 'rates' as const },
  { ticker: '^TYX', name: '30-Year Treasury Yield', category: 'rates' as const },
  { ticker: '^IRX', name: '13-Week Treasury Bill', category: 'rates' as const },
  { ticker: 'TLT', name: '20+ Year Treasury Bond ETF', category: 'bonds' as const },
  { ticker: 'AGG', name: 'US Aggregate Bond ETF', category: 'bonds' as const },
  { ticker: 'LQD', name: 'Investment Grade Corporate Bond ETF', category: 'bonds' as const },
  { ticker: 'HYG', name: 'High Yield Corporate Bond ETF', category: 'bonds' as const },
  { ticker: 'TIP', name: 'TIPS Bond ETF (Inflation Protected)', category: 'bonds' as const },
];

// Interpret VIX level
export function interpretVIX(vixValue: number): MacroIndicator['signal'] & { description: string } {
  if (vixValue >= 35) {
    return {
      signal: 'bullish', // Contrarian - extreme fear = buying opportunity
      description: `VIX at ${vixValue.toFixed(1)} signals extreme fear in the market. Historically, buying when the VIX is above 35 has been very profitable for long-term investors. Warren Buffett says "be greedy when others are fearful." This could be a strong buying opportunity.`,
    } as never;
  }
  if (vixValue >= 25) {
    return {
      signal: 'neutral',
      description: `VIX at ${vixValue.toFixed(1)} shows elevated fear. Markets are nervous but not panicking. Be cautious but start watching for opportunities if it keeps climbing.`,
    } as never;
  }
  if (vixValue >= 20) {
    return {
      signal: 'neutral',
      description: `VIX at ${vixValue.toFixed(1)} is slightly above normal. Some nervousness in the market but nothing extreme.`,
    } as never;
  }
  if (vixValue >= 12) {
    return {
      signal: 'neutral',
      description: `VIX at ${vixValue.toFixed(1)} is in the normal range. Markets are calm and stable. No extreme sentiment either way.`,
    } as never;
  }
  return {
    signal: 'bearish', // Contrarian - extreme complacency can precede drops
    description: `VIX at ${vixValue.toFixed(1)} shows extreme complacency. Markets feel very safe, which ironically is when corrections tend to happen. Be cautious about adding risk here.`,
  } as never;
}

// Interpret VIX for signal display
export function getVIXSignal(vixValue: number): { signal: MacroIndicator['signal']; description: string } {
  if (vixValue >= 35) {
    return {
      signal: 'bullish',
      description: `VIX at ${vixValue.toFixed(1)} signals extreme fear. Historically, buying during extreme fear has been very profitable for patient investors. This could be a strong buying opportunity.`,
    };
  }
  if (vixValue >= 25) {
    return {
      signal: 'neutral',
      description: `VIX at ${vixValue.toFixed(1)} shows elevated fear. Markets are nervous. Start watching for buying opportunities.`,
    };
  }
  if (vixValue <= 12) {
    return {
      signal: 'bearish',
      description: `VIX at ${vixValue.toFixed(1)} shows extreme complacency. Low VIX often precedes market pullbacks. Be cautious.`,
    };
  }
  return {
    signal: 'neutral',
    description: `VIX at ${vixValue.toFixed(1)} is in the normal range. No extreme sentiment.`,
  };
}

// Interpret yield curve (10Y - 2Y spread)
export function getYieldCurveSignal(
  tenYearYield: number,
  twoYearYield: number
): { signal: MacroIndicator['signal']; description: string; spread: number } {
  const spread = tenYearYield - twoYearYield;

  if (spread < -0.5) {
    return {
      signal: 'bearish',
      description: `The yield curve is deeply inverted (${spread.toFixed(2)}%). Short-term bonds pay more than long-term bonds, which has predicted every recession in the last 50 years. This does not mean a crash is imminent, but economic slowdown risk is elevated.`,
      spread,
    };
  }
  if (spread < 0) {
    return {
      signal: 'bearish',
      description: `The yield curve is inverted (${spread.toFixed(2)}%). This is a warning signal. An inverted yield curve often comes 6-18 months before a recession.`,
      spread,
    };
  }
  if (spread < 0.5) {
    return {
      signal: 'neutral',
      description: `The yield curve is flat (${spread.toFixed(2)}%). Neither strongly bullish nor bearish for the economy.`,
      spread,
    };
  }
  return {
    signal: 'bullish',
    description: `The yield curve is normal (${spread.toFixed(2)}%). Long-term rates are above short-term rates, which is healthy for the economy and suggests growth expectations.`,
    spread,
  };
}

// Interpret dollar strength
export function getDollarSignal(
  dollarIndex: number,
  changePercent: number
): { signal: MacroIndicator['signal']; description: string } {
  if (dollarIndex > 108 && changePercent > 0) {
    return {
      signal: 'bearish',
      description: `The US Dollar Index is strong at ${dollarIndex.toFixed(1)} and rising. A strong dollar hurts US exporters and makes foreign investments less attractive. It can also pressure commodity prices and emerging markets.`,
    };
  }
  if (dollarIndex < 95 && changePercent < 0) {
    return {
      signal: 'bullish',
      description: `The US Dollar Index is weak at ${dollarIndex.toFixed(1)} and falling. A weaker dollar is generally bullish for stocks, commodities (gold, silver), and crypto.`,
    };
  }
  return {
    signal: 'neutral',
    description: `The US Dollar Index is at ${dollarIndex.toFixed(1)}. Dollar strength is in a moderate range with no extreme impact on markets.`,
  };
}

// Interest rate environment assessment
export function getRateEnvironment(
  tenYearYield: number,
  thirteenWeekYield: number
): { signal: MacroIndicator['signal']; description: string; environment: string } {
  if (tenYearYield > 5) {
    return {
      signal: 'bearish',
      description: `10-Year yield at ${tenYearYield.toFixed(2)}% is high by modern standards. High rates make bonds competitive with stocks, increase borrowing costs, and can slow the economy. Growth stocks and leveraged positions get hurt most.`,
      environment: 'Restrictive',
    };
  }
  if (tenYearYield > 4) {
    return {
      signal: 'neutral',
      description: `10-Year yield at ${tenYearYield.toFixed(2)}% is moderately high. Rates are impacting borrowing costs but not at crisis levels. Rate-sensitive sectors (real estate, utilities) feel the most pressure.`,
      environment: 'Elevated',
    };
  }
  if (tenYearYield > 2.5) {
    return {
      signal: 'neutral',
      description: `10-Year yield at ${tenYearYield.toFixed(2)}% is in a normal historical range. Interest rates are neither helping nor hurting markets significantly.`,
      environment: 'Normal',
    };
  }
  return {
    signal: 'bullish',
    description: `10-Year yield at ${tenYearYield.toFixed(2)}% is low. Low rates are fuel for stock prices, especially growth and tech stocks. Borrowing is cheap. This environment favors equities over bonds.`,
    environment: 'Accommodative',
  };
}
