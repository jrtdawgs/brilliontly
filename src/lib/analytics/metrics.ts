// Core financial metrics calculations
// All calculations use standard financial formulas

export interface MetricResult {
  value: number;
  label: string;
  description: string;
  rating: 'good' | 'neutral' | 'bad';
  format: 'percent' | 'ratio' | 'currency' | 'number';
}

export interface PortfolioMetrics {
  totalReturn: MetricResult;
  annualizedReturn: MetricResult;
  sharpeRatio: MetricResult;
  sortinoRatio: MetricResult;
  beta: MetricResult;
  alpha: MetricResult;
  maxDrawdown: MetricResult;
  volatility: MetricResult;
  calmarRatio: MetricResult;
  treynorRatio: MetricResult;
  valueAtRisk95: MetricResult;
  informationRatio: MetricResult;
}

// Calculate daily returns from price series
export function calculateDailyReturns(prices: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  return returns;
}

// Mean of an array
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

// Standard deviation
export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const squaredDiffs = values.map((v) => (v - avg) ** 2);
  return Math.sqrt(squaredDiffs.reduce((sum, v) => sum + v, 0) / (values.length - 1));
}

// Downside deviation (only negative returns)
export function downsideDeviation(returns: number[], threshold: number = 0): number {
  const downsideReturns = returns.filter((r) => r < threshold);
  if (downsideReturns.length === 0) return 0;
  const squaredDiffs = downsideReturns.map((r) => (r - threshold) ** 2);
  return Math.sqrt(squaredDiffs.reduce((sum, v) => sum + v, 0) / returns.length);
}

// Total return from price series
export function totalReturn(prices: number[]): number {
  if (prices.length < 2) return 0;
  return (prices[prices.length - 1] - prices[0]) / prices[0];
}

// Annualized return (CAGR)
export function annualizedReturn(prices: number[], tradingDays: number = 252): number {
  if (prices.length < 2) return 0;
  const total = totalReturn(prices);
  const years = prices.length / tradingDays;
  if (years <= 0) return 0;
  return Math.pow(1 + total, 1 / years) - 1;
}

// Annualized volatility
export function annualizedVolatility(dailyReturns: number[], tradingDays: number = 252): number {
  return standardDeviation(dailyReturns) * Math.sqrt(tradingDays);
}

// Sharpe Ratio
export function sharpeRatio(
  dailyReturns: number[],
  riskFreeRate: number = 0.05,
  tradingDays: number = 252
): number {
  const annReturn = mean(dailyReturns) * tradingDays;
  const annVol = annualizedVolatility(dailyReturns, tradingDays);
  if (annVol === 0) return 0;
  return (annReturn - riskFreeRate) / annVol;
}

// Sortino Ratio
export function sortinoRatio(
  dailyReturns: number[],
  riskFreeRate: number = 0.05,
  tradingDays: number = 252
): number {
  const annReturn = mean(dailyReturns) * tradingDays;
  const downDev = downsideDeviation(dailyReturns) * Math.sqrt(tradingDays);
  if (downDev === 0) return 0;
  return (annReturn - riskFreeRate) / downDev;
}

// Beta (vs benchmark)
export function beta(portfolioReturns: number[], benchmarkReturns: number[]): number {
  const length = Math.min(portfolioReturns.length, benchmarkReturns.length);
  if (length < 2) return 1;

  const pReturns = portfolioReturns.slice(0, length);
  const bReturns = benchmarkReturns.slice(0, length);

  const pMean = mean(pReturns);
  const bMean = mean(bReturns);

  let covariance = 0;
  let benchVariance = 0;

  for (let i = 0; i < length; i++) {
    covariance += (pReturns[i] - pMean) * (bReturns[i] - bMean);
    benchVariance += (bReturns[i] - bMean) ** 2;
  }

  if (benchVariance === 0) return 1;
  return covariance / benchVariance;
}

// Alpha (Jensen's Alpha)
export function alpha(
  portfolioReturns: number[],
  benchmarkReturns: number[],
  riskFreeRate: number = 0.05,
  tradingDays: number = 252
): number {
  const portfolioAnnReturn = mean(portfolioReturns) * tradingDays;
  const benchmarkAnnReturn = mean(benchmarkReturns) * tradingDays;
  const b = beta(portfolioReturns, benchmarkReturns);
  return portfolioAnnReturn - (riskFreeRate + b * (benchmarkAnnReturn - riskFreeRate));
}

// Max Drawdown
export function maxDrawdown(prices: number[]): number {
  if (prices.length < 2) return 0;
  let peak = prices[0];
  let maxDd = 0;

  for (const price of prices) {
    if (price > peak) peak = price;
    const dd = (peak - price) / peak;
    if (dd > maxDd) maxDd = dd;
  }

  return -maxDd; // Return as negative number
}

// Calmar Ratio
export function calmarRatio(prices: number[], tradingDays: number = 252): number {
  const annReturn = annualizedReturn(prices, tradingDays);
  const mdd = Math.abs(maxDrawdown(prices));
  if (mdd === 0) return 0;
  return annReturn / mdd;
}

// Treynor Ratio
export function treynorRatio(
  portfolioReturns: number[],
  benchmarkReturns: number[],
  riskFreeRate: number = 0.05,
  tradingDays: number = 252
): number {
  const annReturn = mean(portfolioReturns) * tradingDays;
  const b = beta(portfolioReturns, benchmarkReturns);
  if (b === 0) return 0;
  return (annReturn - riskFreeRate) / b;
}

// Value at Risk (Historical, 95%)
export function valueAtRisk(dailyReturns: number[], confidence: number = 0.95): number {
  const sorted = [...dailyReturns].sort((a, b) => a - b);
  const index = Math.floor(sorted.length * (1 - confidence));
  return sorted[index] || 0;
}

// Information Ratio
export function informationRatio(
  portfolioReturns: number[],
  benchmarkReturns: number[],
  tradingDays: number = 252
): number {
  const length = Math.min(portfolioReturns.length, benchmarkReturns.length);
  const activeReturns: number[] = [];

  for (let i = 0; i < length; i++) {
    activeReturns.push(portfolioReturns[i] - benchmarkReturns[i]);
  }

  const activeReturn = mean(activeReturns) * tradingDays;
  const trackingError = standardDeviation(activeReturns) * Math.sqrt(tradingDays);

  if (trackingError === 0) return 0;
  return activeReturn / trackingError;
}

// Correlation between two return series
export function correlation(returns1: number[], returns2: number[]): number {
  const length = Math.min(returns1.length, returns2.length);
  if (length < 2) return 0;

  const r1 = returns1.slice(0, length);
  const r2 = returns2.slice(0, length);

  const mean1 = mean(r1);
  const mean2 = mean(r2);

  let cov = 0;
  let var1 = 0;
  let var2 = 0;

  for (let i = 0; i < length; i++) {
    const d1 = r1[i] - mean1;
    const d2 = r2[i] - mean2;
    cov += d1 * d2;
    var1 += d1 * d1;
    var2 += d2 * d2;
  }

  const denom = Math.sqrt(var1 * var2);
  if (denom === 0) return 0;
  return cov / denom;
}

// Correlation matrix for multiple return series
export function correlationMatrix(
  allReturns: { ticker: string; returns: number[] }[]
): { tickers: string[]; matrix: number[][] } {
  const tickers = allReturns.map((r) => r.ticker);
  const matrix: number[][] = [];

  for (let i = 0; i < allReturns.length; i++) {
    const row: number[] = [];
    for (let j = 0; j < allReturns.length; j++) {
      if (i === j) {
        row.push(1);
      } else {
        row.push(correlation(allReturns[i].returns, allReturns[j].returns));
      }
    }
    matrix.push(row);
  }

  return { tickers, matrix };
}

// Rate a metric value
function rateMetric(
  name: string,
  value: number
): 'good' | 'neutral' | 'bad' {
  switch (name) {
    case 'sharpeRatio':
      return value >= 1 ? 'good' : value >= 0.5 ? 'neutral' : 'bad';
    case 'sortinoRatio':
      return value >= 1.5 ? 'good' : value >= 0.75 ? 'neutral' : 'bad';
    case 'beta':
      return value <= 1.2 && value >= 0.8 ? 'neutral' : value > 1.5 ? 'bad' : 'good';
    case 'alpha':
      return value > 0.02 ? 'good' : value > -0.02 ? 'neutral' : 'bad';
    case 'maxDrawdown':
      return value > -0.1 ? 'good' : value > -0.2 ? 'neutral' : 'bad';
    case 'volatility':
      return value < 0.15 ? 'good' : value < 0.25 ? 'neutral' : 'bad';
    case 'totalReturn':
    case 'annualizedReturn':
      return value > 0.1 ? 'good' : value > 0 ? 'neutral' : 'bad';
    case 'calmarRatio':
      return value > 1 ? 'good' : value > 0.5 ? 'neutral' : 'bad';
    case 'treynorRatio':
      return value > 0.1 ? 'good' : value > 0 ? 'neutral' : 'bad';
    case 'valueAtRisk95':
      return value > -0.02 ? 'good' : value > -0.04 ? 'neutral' : 'bad';
    case 'informationRatio':
      return value > 0.5 ? 'good' : value > 0 ? 'neutral' : 'bad';
    default:
      return 'neutral';
  }
}

// Calculate all portfolio metrics
export function calculateAllMetrics(
  portfolioPrices: number[],
  benchmarkPrices: number[],
  riskFreeRate: number = 0.05
): PortfolioMetrics {
  const pReturns = calculateDailyReturns(portfolioPrices);
  const bReturns = calculateDailyReturns(benchmarkPrices);

  const totalRet = totalReturn(portfolioPrices);
  const annRet = annualizedReturn(portfolioPrices);
  const sharpe = sharpeRatio(pReturns, riskFreeRate);
  const sortino = sortinoRatio(pReturns, riskFreeRate);
  const b = beta(pReturns, bReturns);
  const a = alpha(pReturns, bReturns, riskFreeRate);
  const mdd = maxDrawdown(portfolioPrices);
  const vol = annualizedVolatility(pReturns);
  const calmar = calmarRatio(portfolioPrices);
  const treynor = treynorRatio(pReturns, bReturns, riskFreeRate);
  const var95 = valueAtRisk(pReturns);
  const ir = informationRatio(pReturns, bReturns);

  return {
    totalReturn: {
      value: totalRet,
      label: 'Total Return',
      description: 'How much your portfolio has grown since you started. This is your total gain or loss as a percentage.',
      rating: rateMetric('totalReturn', totalRet),
      format: 'percent',
    },
    annualizedReturn: {
      value: annRet,
      label: 'Annualized Return',
      description: 'Your average yearly return, accounting for compounding. This tells you what your portfolio earns per year on average.',
      rating: rateMetric('annualizedReturn', annRet),
      format: 'percent',
    },
    sharpeRatio: {
      value: sharpe,
      label: 'Sharpe Ratio',
      description: 'How much extra return you earn for each unit of risk you take. Above 1.0 is good, above 2.0 is great. Below 0 means you would have been better off in a savings account.',
      rating: rateMetric('sharpeRatio', sharpe),
      format: 'ratio',
    },
    sortinoRatio: {
      value: sortino,
      label: 'Sortino Ratio',
      description: 'Similar to Sharpe, but it only counts the bad kind of volatility (losses). A higher number means your returns come with less painful drops.',
      rating: rateMetric('sortinoRatio', sortino),
      format: 'ratio',
    },
    beta: {
      value: b,
      label: 'Beta',
      description: 'How much your portfolio moves compared to the overall market (S&P 500). A beta of 1.0 means it moves with the market. Above 1.0 means more volatile, below 1.0 means less volatile.',
      rating: rateMetric('beta', b),
      format: 'ratio',
    },
    alpha: {
      value: a,
      label: 'Alpha',
      description: 'Your extra return beyond what the market gave you, adjusted for risk. Positive alpha means you are beating the market. Negative means you are underperforming.',
      rating: rateMetric('alpha', a),
      format: 'percent',
    },
    maxDrawdown: {
      value: mdd,
      label: 'Max Drawdown',
      description: 'The biggest drop from a peak to a bottom that your portfolio experienced. This shows the worst-case pain you have gone through.',
      rating: rateMetric('maxDrawdown', mdd),
      format: 'percent',
    },
    volatility: {
      value: vol,
      label: 'Volatility',
      description: 'How much your portfolio value bounces around day to day, measured over a year. Lower means smoother, higher means more wild swings.',
      rating: rateMetric('volatility', vol),
      format: 'percent',
    },
    calmarRatio: {
      value: calmar,
      label: 'Calmar Ratio',
      description: 'Your annual return divided by your worst drawdown. It tells you whether the gains are worth the pain. Above 1.0 is solid.',
      rating: rateMetric('calmarRatio', calmar),
      format: 'ratio',
    },
    treynorRatio: {
      value: treynor,
      label: 'Treynor Ratio',
      description: 'Like Sharpe ratio, but measures return per unit of market risk specifically. Useful for seeing if you are being compensated for market exposure.',
      rating: rateMetric('treynorRatio', treynor),
      format: 'ratio',
    },
    valueAtRisk95: {
      value: var95,
      label: 'Value at Risk (95%)',
      description: 'On 95 out of 100 trading days, your daily loss will not exceed this amount. Think of it as your typical worst day.',
      rating: rateMetric('valueAtRisk95', var95),
      format: 'percent',
    },
    informationRatio: {
      value: ir,
      label: 'Information Ratio',
      description: 'How consistently you outperform the benchmark. A higher number means your outperformance is steady, not just lucky.',
      rating: rateMetric('informationRatio', ir),
      format: 'ratio',
    },
  };
}
