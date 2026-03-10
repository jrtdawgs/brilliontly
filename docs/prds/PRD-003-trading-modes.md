# PRD-003: Trading Modes - Investing, Day Trading, Retirement

### Parent: PRD-001 (Master)
### Version: 1.0
### Date: 2026-03-10

---

## 1. Objective

Create three distinct sections/modes within Brillontly, each tailored to a different
investing style with relevant tools, signals, and metrics for that approach.

## 2. The Three Modes

### Mode 1: Long-Term Investing (/investing)
**Who it is for:** Buy-and-hold investors building wealth over years

**Key Features:**
- Portfolio allocation visualization
- Sharpe, Sortino, Alpha, Beta, Max Drawdown
- Correlation matrix across holdings
- Rebalancing signals (when drift exceeds 5%)
- Capitulation buy signals (RSI + VIX + drawdown combo)
- Dollar cost averaging tracker
- Tax-loss harvesting scanner (taxable accounts only)
- Sector/factor exposure analysis
- Monte Carlo projections

**Key Watchlist Assets:**
- SPY, QQQ, QQQM, FXAIX, VOO, VTI, SCHD
- GLD, SLV, GDX (gold/silver for hedging)
- TLT, AGG (bonds for diversification)
- BTC-USD, ETH-USD

**Macro Dashboard:**
- VIX (fear gauge - when to buy dips)
- Yield curve (recession warning)
- Dollar index (impact on returns)
- 10Y Treasury yield (rates environment)

### Mode 2: Day Trading (/day-trading)
**Who it is for:** Active traders looking at intraday and short-term moves

**Key Features:**
- RSI (14-period) with overbought/oversold zones
- Volume spike detection
- Moving average crossovers (9/21 EMA, 50/200 SMA)
- Support and resistance levels
- Capitulation signals (real-time-ish)
- VIX tracking (fear = opportunity)
- Dollar strength impact
- Intraday price chart with indicators
- Quick-look signal dashboard ("What's hot today")

**Key Watchlist Assets:**
- SPY, QQQ (indices for direction)
- SOXL, TQQQ, UPRO (leveraged for swings)
- BITX, ETHU (leveraged crypto)
- NVDA, TSLA, AAPL, META (high-volume movers)
- BTC-USD, ETH-USD

**Signals Specific to Day Trading:**
- RSI crossing below 30 or above 70
- Volume 2x+ above 20-day average
- Price crossing above/below key moving averages
- VIX spikes (buy the fear)
- Gap up/gap down detection

### Mode 3: Retirement Planning (/retirement)
**Who it is for:** Long-horizon retirement savers (401k, Roth IRA focus)

**Key Features:**
- Retirement projection calculator (compound growth)
- Target retirement date tracking
- Contribution tracking vs IRS limits
  - 401k: $23,500 (2026) + catch-up if applicable
  - Roth IRA: $7,000 (2026) + catch-up if applicable
- Account comparison (401k vs Roth IRA tax analysis)
- Risk assessment for retirement timeline
- Glide path recommendation (equity % based on age)
- Social Security estimate integration
- Required Minimum Distribution (RMD) calculator
- Safe withdrawal rate (4% rule and variants)

**Key Watchlist Assets:**
- FXAIX (401k core)
- QQQM (Roth IRA core)
- Target date funds comparison
- Bond allocation suggestions by age

**Metrics for Retirement:**
- Years to retirement
- Current savings rate
- Projected portfolio value at retirement
- Monthly income in retirement (at 4% withdrawal)
- Gap analysis (what you have vs what you need)

## 3. User Stories

### US-3.1: Mode Switching
**As a** user, **I want to** switch between Investing, Day Trading, and Retirement views
**so that** I see relevant tools for my current activity.

**Acceptance Criteria:**
- Navigation shows three clear modes
- Each mode has its own dashboard layout
- Watchlists are mode-specific
- Signals and metrics are tailored to the mode

### US-3.2: Day Trading Signal Dashboard
**As a** day trader, **I want to** see a quick-look signal dashboard
**so that** I know which assets have buy/sell signals right now.

**Acceptance Criteria:**
- Table of tracked assets with RSI, drawdown, volume signals
- Color-coded: green (buy), yellow (watch), red (caution)
- Sort by signal strength
- Filter by category (equity, crypto, leveraged, commodities)

### US-3.3: Retirement Projection
**As a** retirement saver, **I want to** see how my money will grow
**so that** I know if I am on track.

**Acceptance Criteria:**
- Input: current age, target retirement age, current savings, monthly contribution
- Output: projected portfolio value with confidence interval
- Chart showing growth over time
- Shows what you will have at current pace vs what you need

## 4. Founder's Watchlist (from Robinhood)

| Ticker | Name | Purpose |
|--------|------|---------|
| ^VIX | CBOE Volatility Index | Fear gauge - buy signal when high |
| UUP | Invesco DB US Dollar Bullish Fund | Dollar strength tracking |
| TLT | 20+ Year Treasury Bond ETF | Interest rate / bond market |
| GLD | SPDR Gold Trust | Safe haven / inflation hedge |

## 5. Page Structure

```
/investing          - Long-term investing dashboard
/investing/signals  - Buy/sell signals for long-term holds
/investing/watchlist - Custom watchlist with metrics

/day-trading        - Day trading dashboard
/day-trading/signals - Real-time-ish buy/sell signals
/day-trading/screener - Signal screener with filters

/retirement         - Retirement planning dashboard
/retirement/calculator - Projection calculator
/retirement/contributions - Contribution tracker
```

## 6. Navigation Design

Top navigation bar with three tabs:
- Investing (chart icon)
- Day Trading (lightning bolt icon)
- Retirement (piggy bank icon)

Each mode remembers its own state. Users can switch freely.
The Gator chatbot is available in all modes and adjusts its advice
based on the active mode context.
