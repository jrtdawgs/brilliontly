# PRD-001: Brillontly - Investment Advisory Platform
## Master Product Requirements Document

### Version: 1.0
### Date: 2026-03-10
### Author: Joshua Torres

---

## 1. Vision

Brillontly is a personal investment advisory platform that provides institutional-grade
portfolio analytics to individual investors. It serves two purposes:
1. **Personal Use** - Advanced portfolio tracking and analytics for the founder's accounts
2. **SaaS Product** - Offer the same analytics engine as a service to paying clients

## 2. Problem Statement

Retail investors lack access to the advanced metrics and analytics that institutional
investors use daily. Most free tools show basic P&L but miss critical risk-adjusted
performance measures, correlation analysis, factor exposure, and tax optimization signals.

Leveraged ETFs (SOXL, BITX, ETHU) and crypto exposure require specialized analytics
that mainstream brokerages don't provide - particularly around volatility decay, leverage
drag, and correlation breakdowns during market stress.

## 3. Target Users

### Primary (Founder)
- Beginner investor running 3 accounts:
  - 401(k): 100% FXAIX (Fidelity 500 Index)
  - Roth IRA: 100% QQQM (Invesco Nasdaq 100 ETF)
  - Taxable: SPY, QQQ, SOXL, BTC, ETH, BITX, ETHU split
- Needs education-friendly analytics with explanations
- Wants to maximize returns while understanding risk

### Secondary (Future Clients)
- Self-directed retail investors
- People running leveraged/crypto-heavy portfolios
- Users who want advisor-level analytics without advisor fees

## 4. Tech Stack (100% Free Tier)

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 14 (App Router) + TypeScript | Best React framework, free on Vercel |
| Styling | Tailwind CSS + shadcn/ui | Modern, fast, free |
| Charts | Recharts + Lightweight Charts | Free, performant financial charts |
| Backend API | Next.js API Routes + Python microservice | API routes for app, Python for heavy math |
| Database | SQLite (local) / Turso (hosted free) | Zero cost, 9GB free on Turso |
| Auth | NextAuth.js (Auth.js v5) | Free, supports OAuth |
| Market Data | Yahoo Finance API (yfinance) | Free, reliable |
| Crypto Data | CoinGecko Free API | 30 calls/min free tier |
| Hosting | Vercel (free tier) | Free hosting, CI/CD, edge functions |
| Analytics Engine | Python (numpy, pandas, scipy) | Best math/finance libraries |
| Caching | Vercel KV (free tier) or in-memory | Reduce API calls |

## 5. Feature Roadmap

### Phase 1 - MVP (Current)
- [ ] Portfolio dashboard with account overview
- [ ] Real-time price fetching (equities + crypto)
- [ ] Core metrics: returns, Sharpe, Sortino, beta, alpha, max drawdown
- [ ] Holdings breakdown with allocation visualization
- [ ] Basic rebalancing signals

### Phase 2 - Advanced Analytics
- [ ] Correlation matrix heatmap
- [ ] Factor exposure analysis (market, size, value, momentum)
- [ ] Leverage decay calculator for SOXL/BITX/ETHU
- [ ] Monte Carlo simulation for portfolio projections
- [ ] Tax-loss harvesting scanner (taxable account)
- [ ] Sector/industry exposure analysis

### Phase 3 - SaaS Features
- [ ] Multi-user auth and onboarding
- [ ] Client portfolio CRUD
- [ ] Public API with API key auth
- [ ] Webhook notifications (drawdown alerts, rebalance signals)
- [ ] Report generation (PDF export)
- [ ] Subscription/billing (Stripe free until revenue)

### Phase 4 - Intelligence
- [ ] AI-powered portfolio recommendations
- [ ] Backtesting engine
- [ ] Scenario analysis (rate hikes, recession, crypto winter)
- [ ] Peer portfolio comparison
- [ ] News sentiment integration

## 6. Founder's Portfolio Configuration

### Account 1: 401(k)
| Ticker | Allocation | Type |
|--------|-----------|------|
| FXAIX | 100% | S&P 500 Index Fund |

### Account 2: Roth IRA
| Ticker | Allocation | Type |
|--------|-----------|------|
| QQQM | 100% | Nasdaq 100 ETF |

### Account 3: Taxable Brokerage
| Ticker | Allocation | Type |
|--------|-----------|------|
| SPY | TBD% | S&P 500 ETF |
| QQQ | TBD% | Nasdaq 100 ETF |
| SOXL | TBD% | 3x Leveraged Semiconductors |
| BTC | TBD% | Bitcoin |
| ETH | TBD% | Ethereum |
| BITX | TBD% | 2x Bitcoin Strategy ETF |
| ETHU | TBD% | 2x Ether ETF |

*Note: Taxable account allocations to be confirmed by founder*

## 7. Key Metrics to Calculate

### Return Metrics
- Total return (per account and aggregate)
- Annualized return (CAGR)
- Time-weighted return (TWR)
- Money-weighted return (IRR)

### Risk Metrics
- Standard deviation (volatility)
- Beta (vs S&P 500)
- Max drawdown
- Value at Risk (VaR) - 95% and 99%
- Conditional VaR (CVaR / Expected Shortfall)

### Risk-Adjusted Performance
- Sharpe Ratio (excess return per unit of total risk)
- Sortino Ratio (excess return per unit of downside risk)
- Treynor Ratio (excess return per unit of systematic risk)
- Calmar Ratio (annualized return / max drawdown)
- Information Ratio (active return / tracking error)
- Alpha (Jensen's Alpha)

### Correlation & Exposure
- Correlation matrix across all holdings
- R-squared (how much movement explained by benchmark)
- Sector exposure breakdown
- Factor loadings (Fama-French)
- Crypto vs equity correlation

### Leverage-Specific
- Leverage decay estimation
- Volatility drag calculator
- Recommended holding period analysis
- Path dependency visualization

## 8. API Endpoints (for SaaS)

```
GET    /api/v1/portfolio              - List portfolios
POST   /api/v1/portfolio              - Create portfolio
GET    /api/v1/portfolio/:id          - Get portfolio details
PUT    /api/v1/portfolio/:id          - Update portfolio
DELETE /api/v1/portfolio/:id          - Delete portfolio

GET    /api/v1/portfolio/:id/metrics  - Get all metrics
GET    /api/v1/portfolio/:id/returns  - Get return metrics
GET    /api/v1/portfolio/:id/risk     - Get risk metrics
GET    /api/v1/portfolio/:id/signals  - Get rebalancing signals

GET    /api/v1/market/quote/:ticker   - Get current price
GET    /api/v1/market/history/:ticker - Get historical data

POST   /api/v1/analyze                - Analyze any portfolio
POST   /api/v1/simulate               - Run Monte Carlo sim

GET    /api/v1/alerts                 - List active alerts
POST   /api/v1/alerts                 - Create alert
```

## 9. Success Metrics

- Personal: Make more informed investment decisions with data-driven insights
- Platform: Onboard first 10 beta users within 3 months of SaaS launch
- Technical: API response time < 500ms for cached data, < 3s for fresh calculations

## 10. Constraints

- $0 budget - everything must run on free tiers
- Yahoo Finance rate limits (2,000 requests/hour)
- CoinGecko free tier (30 calls/min)
- Vercel free tier (100GB bandwidth, 100 hours serverless)

## 11. Legal Disclaimer

Brillontly provides analytics and educational information only. It is NOT a registered
investment advisor. All metrics are for informational purposes. Users make their own
investment decisions. Past performance does not guarantee future results.
