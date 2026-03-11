# PRD-005: Brilliontly Complete Platform Reference

| Field          | Value                                      |
|----------------|--------------------------------------------|
| **Document**   | PRD-005                                    |
| **Title**      | Complete Platform Reference                |
| **Author**     | Joshua Torres                              |
| **Status**     | Living Document                            |
| **Created**    | 2026-03-10                                 |
| **Platform**   | Brilliontly                                |
| **Repository** | github.com/jrtdawgs/brilliontly             |
| **Production** | brilliontly.vercel.app                  |

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Features](#3-features)
4. [API Reference](#4-api-reference)
5. [Security](#5-security)
6. [Data Sources](#6-data-sources)
7. [Components](#7-components)
8. [Deployment](#8-deployment)
9. [Roadmap](#9-roadmap)
10. [Appendix](#10-appendix)

---

## 1. Overview

### 1.1 Product Summary

Brilliontly is a personal finance and investing intelligence platform built by Joshua Torres. It provides real-time market signals, portfolio analytics, retirement projections, and day-trading screening across 30+ tracked assets. The platform is designed to deliver institutional-grade analytics in plain English, making complex financial data accessible to individual investors.

### 1.2 Core Value Propositions

- **Real-time market intelligence** with live buy/sell signals derived from RSI, drawdown, volume, and capitulation analysis.
- **Portfolio analytics engine** computing Sharpe, Sortino, Alpha, Beta, and eight additional risk-adjusted metrics.
- **Three operating modes** tailored to distinct investment mindsets: long-term Investing, active Day Trading, and Retirement planning.
- **Encrypted financial data storage** with AES-256-GCM encryption at rest and bcrypt-hashed credentials.
- **Zero-dependency AI** chatbot providing knowledge-based financial guidance without external API calls.

### 1.3 Tech Stack

| Layer          | Technology                                           |
|----------------|------------------------------------------------------|
| Framework      | Next.js 16.1.6 (App Router)                         |
| Language       | TypeScript                                           |
| Styling        | Tailwind CSS v4                                      |
| Database       | SQLite via better-sqlite3                            |
| Encryption     | AES-256-GCM (financial data), bcrypt (passwords)     |
| Authentication | JWT with HTTP-only cookies                           |
| Market Data    | Yahoo Finance API (unofficial), CoinGecko API        |
| Deployment     | Vercel (auto-deploy on push to master)               |
| Version Control| GitHub                                               |

---

## 2. Architecture

### 2.1 Application Structure

Brilliontly uses the Next.js App Router pattern. All pages are server-rendered or client-rendered React components under the `app/` directory. API routes live under `app/api/` and serve as the backend layer.

```
brilliontly-app/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── login/page.tsx              # Login
│   ├── signup/page.tsx             # Signup
│   ├── dashboard/page.tsx          # Mode selection redirect
│   ├── investing/page.tsx          # Portfolio dashboard
│   ├── day-trading/page.tsx        # Signal screener
│   ├── retirement/page.tsx         # Retirement projections
│   ├── accounts/page.tsx           # Account management
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── signup/route.ts
│       │   ├── me/route.ts
│       │   └── logout/route.ts
│       └── v1/
│           ├── market/
│           │   ├── live/route.ts
│           │   └── [ticker]/route.ts
│           ├── metrics/route.ts
│           └── accounts/
│               ├── route.ts
│               └── import-csv/route.ts
├── components/
├── lib/
├── docs/
│   └── prds/
├── public/
└── ...
```

### 2.2 Data Flow

1. **Market Data Pipeline**: Yahoo Finance API / CoinGecko -> 15-second in-memory cache -> API routes -> Frontend (auto-refresh every 30 seconds).
2. **User Data Pipeline**: User input / CSV import -> API route -> AES-256-GCM encryption -> SQLite storage.
3. **Analytics Pipeline**: Portfolio data + market data -> metrics engine -> computed Sharpe, Sortino, Alpha, Beta, etc. -> rendered MetricCards with plain-English tooltips.
4. **Auth Pipeline**: Signup (bcrypt hash) -> Login (bcrypt verify) -> JWT cookie (7-day expiry) -> `/api/auth/me` validation on protected routes.

### 2.3 Caching Strategy

- **In-memory cache** with 15-second TTL for market data.
- **Batch fetching** of 10 tickers per request to Yahoo Finance to avoid rate limiting.
- Frontend polls every 30 seconds via `setInterval` / `useEffect`.

---

## 3. Features

### 3.1 Landing Page (`/`)

The public-facing entry point for Brilliontly.

| Element                   | Description                                                              |
|---------------------------|--------------------------------------------------------------------------|
| Hero Section              | Platform name, tagline, and primary CTA                                  |
| Feature Cards (3)         | Investing, Day Trading, and Retirement mode summaries                    |
| Metrics Showcase Grid     | Preview of portfolio analytics capabilities                              |
| Tracked Assets Ticker Cloud | Visual display of all 30+ tracked assets                              |
| Call to Action            | Signup / login prompt                                                    |
| Footer                    | Standard footer with links and attribution                               |

### 3.2 Investing Dashboard (`/investing`)

The long-term portfolio intelligence view.

**Account Cards (3)**
- 401(k), Roth IRA, and Taxable account summary cards.
- Each card displays holdings, allocation, and current value.

**Asset Allocation Breakdown**
- Visual breakdown of holdings across all three account types.

**Portfolio Metric Cards (12)**
- Sharpe Ratio, Sortino Ratio, Beta, Alpha, Max Drawdown, Volatility, Calmar Ratio, Treynor Ratio, VaR (95%), Information Ratio, Correlation, and overall risk score.
- Each card includes a plain-English tooltip explaining the metric in non-technical language.

**Live Buy/Sell Signals**
- Real-time signals pulled from Yahoo Finance for tracked assets.
- Signal logic based on RSI, drawdown, volume spikes, and capitulation detection.

**Live Macro Panel**
- Real-time display of VIX, Dollar Index, Treasury Yields, TLT, and Gold.

### 3.3 Day Trading Screener (`/day-trading`)

A real-time signal screener for active traders.

| Feature                    | Description                                                             |
|----------------------------|-------------------------------------------------------------------------|
| Signal Screener            | 30+ tracked assets with live data                                       |
| Category Filters           | Filter by asset class (stocks, ETFs, crypto, leveraged, commodities)    |
| Sort Options               | Sort by price, change %, RSI, drawdown, volume, signal strength         |
| Data Table Columns         | Ticker, Price, Change %, RSI, Drawdown from High, Volume, Signal        |
| Top Opportunities          | Highlighted assets with strongest buy/sell signals                      |
| Live Macro Panel           | Same macro panel as Investing view                                      |
| Auto-Refresh               | Data refreshes every 30 seconds automatically                           |

### 3.4 Retirement Planner (`/retirement`)

Scenario-based retirement projection engine.

| Feature                      | Description                                                           |
|------------------------------|-----------------------------------------------------------------------|
| Scenario Projections         | Bull, Bear, and Normal market return scenarios                        |
| Account Contribution Tracking| Track contributions across 401(k), Roth IRA, and Taxable              |
| Projection Calculator        | Inputs: current age, current savings, monthly contribution            |
| Scenario Comparison          | Side-by-side comparison of all three scenarios                        |
| Bar Chart Visualization      | Visual representation of projected growth over time                   |
| Glide Path Recommendations   | Age-based asset allocation suggestions (equity vs. bonds)             |
| 401(k) vs Roth Comparison    | Tax-advantaged account strategy comparison                            |

### 3.5 Account Management (`/accounts`)

Encrypted account storage with multi-format import.

| Feature                | Description                                                                |
|------------------------|----------------------------------------------------------------------------|
| Manual Entry           | Add accounts and holdings by hand                                          |
| CSV Import             | Upload brokerage CSV exports for automatic parsing                         |
| Brokerage Auto-Detection | Automatically identifies Fidelity, Schwab, Robinhood, Vanguard formats  |
| Preview Mode           | Parsed CSV data is shown for review before saving (no auto-save)           |
| Encrypted Account List | All stored accounts are AES-256-GCM encrypted at rest                     |
| Danger Zone Delete     | Destructive account deletion with confirmation                            |

### 3.6 Authentication (`/login`, `/signup`)

| Feature                  | Description                                                              |
|--------------------------|--------------------------------------------------------------------------|
| Login                    | Email and password form with JWT cookie issuance                         |
| Signup                   | Registration with password confirmation field                            |
| Security Info Footer     | Displays encryption and security practices to users                      |
| Session Management       | 7-day JWT expiry, HTTP-only cookie, logout endpoint                      |

### 3.7 Dashboard (`/dashboard`)

Mode selection redirect page. Routes users to their preferred mode (Investing, Day Trading, or Retirement).

### 3.8 Big Bull Chatbot (GatorChat)

A knowledge-based floating chatbot embedded across the platform.

| Attribute          | Detail                                                                      |
|--------------------|-----------------------------------------------------------------------------|
| Mascot             | Alligator named "Big Bull"                                                  |
| Visual Design      | Custom SVG: dark navy outline, green body, proper tail, scute ridges, teeth, armored plates |
| Intelligence       | Keyword matching with approximately 50 knowledge entries (NOT AI-connected) |
| Categories Covered | Portfolio basics, account types, holdings, metrics, signals, macro analysis, strategy |
| Tone               | Always plain English; never code-like or overly technical text              |

---

## 4. API Reference

### 4.1 Market Data APIs

#### `GET /api/v1/market/live?type=signals`

Returns live quotes with computed technical indicators for all 30+ tracked assets.

**Response fields per asset**: ticker, name, price, change, changePercent, RSI (14-period), drawdownFromHigh, volume, volumeAvg, signal (BUY / SELL / HOLD), signalStrength, capitulationDetected.

#### `GET /api/v1/market/live?type=macro`

Returns live macro indicators.

**Response fields**: VIX (value + interpretation), Dollar Index (DXY), Treasury Yields (2Y, 10Y, 30Y, spread), TLT (price + change), Gold (price + change).

#### `GET /api/v1/market/live?type=quotes&tickers=X,Y`

Returns live quotes for specific tickers passed as a comma-separated list.

#### `GET /api/v1/market/[ticker]`

Returns an individual ticker quote or historical price data.

### 4.2 Analytics API

#### `POST /api/v1/metrics`

Computes portfolio-level risk and performance metrics.

**Request body**: Portfolio holdings with weights, historical returns.

**Response fields**: Sharpe Ratio, Sortino Ratio, Beta, Alpha, Max Drawdown, Volatility, Calmar Ratio, Treynor Ratio, VaR (95%), Information Ratio, Correlation Matrix.

### 4.3 Account APIs

#### `GET /api/v1/accounts`

Returns all encrypted accounts for the authenticated user (decrypted at read time).

#### `POST /api/v1/accounts`

Creates a new account with holdings. Data is encrypted before storage.

#### `DELETE /api/v1/accounts`

Deletes an account by ID. Requires authentication.

#### `POST /api/v1/accounts/import-csv`

Accepts a CSV file upload. Parses and returns a preview of detected holdings. Does not persist data.

**Supported formats**: Fidelity, Schwab, Robinhood, Vanguard, Generic.

**Response fields**: detectedBrokerage, holdings (array of ticker, name, shares, costBasis).

### 4.4 Auth APIs

| Endpoint                | Method | Description                                      |
|-------------------------|--------|--------------------------------------------------|
| `/api/auth/signup`      | POST   | Register a new user. Passwords hashed with bcrypt (12 rounds). |
| `/api/auth/login`       | POST   | Authenticate and issue JWT cookie (7-day expiry). |
| `/api/auth/me`          | GET    | Validate current session. Returns user profile.   |
| `/api/auth/logout`      | POST   | Clear JWT cookie and end session.                 |

---

## 5. Security

### 5.1 Encryption

| Concern              | Implementation                                                          |
|----------------------|-------------------------------------------------------------------------|
| Financial data at rest | AES-256-GCM encryption. Each record encrypted individually.           |
| Encryption key       | Stored in `BRILLIONTLY_ENCRYPTION_KEY` environment variable.            |
| Password storage     | bcrypt hashing with 12 salt rounds. Plaintext passwords never stored.   |

### 5.2 Authentication

| Concern              | Implementation                                                          |
|----------------------|-------------------------------------------------------------------------|
| Session tokens       | JWT signed with `JWT_SECRET` environment variable.                      |
| Cookie attributes    | HTTP-only, 7-day expiry.                                                |
| Protected routes     | All `/api/v1/*` routes require valid JWT. Auth checked via `/api/auth/me`. |

### 5.3 Environment Variables

| Variable                     | Purpose                            |
|------------------------------|------------------------------------|
| `BRILLIONTLY_ENCRYPTION_KEY` | AES-256-GCM key for financial data |
| `JWT_SECRET`                 | JWT signing secret                 |

---

## 6. Data Sources

### 6.1 Yahoo Finance (Unofficial API)

- **Usage**: Stock quotes, ETF prices, crypto prices, historical data, volume data.
- **Caching**: 15-second in-memory cache to reduce API calls.
- **Rate Limiting Mitigation**: Batch fetching in groups of 10 tickers.
- **Computed Indicators**: RSI (14-period), drawdown from all-time/52-week high, volume spike detection, 50/200 SMA crossover.

### 6.2 CoinGecko API

- **Usage**: Cryptocurrency price data as a supplementary source.

### 6.3 Tracked Assets (30+)

| Category        | Tickers                                                    |
|-----------------|------------------------------------------------------------|
| Broad Market    | SPY, VOO, VTI, QQQ, QQQM, DIA, IWM                       |
| Sector ETFs     | XLE, XLF, XLK                                             |
| Leveraged ETFs  | SOXL, TQQQ, UPRO, BITX, ETHU                              |
| Mega-Cap Stocks | AAPL, MSFT, NVDA, GOOG, AMZN, META, TSLA                  |
| Dividend        | SCHD                                                       |
| Bonds           | TLT, AGG                                                   |
| Commodities     | GLD, SLV, GDX                                             |
| Crypto          | BTC-USD, ETH-USD                                           |
| Index Funds     | FXAIX                                                      |

### 6.4 Analytics Engine

**Metrics Computed**

| Metric              | Description                                                          |
|----------------------|----------------------------------------------------------------------|
| Sharpe Ratio         | Risk-adjusted return relative to the risk-free rate                  |
| Sortino Ratio        | Like Sharpe but only penalizes downside volatility                   |
| Beta                 | Portfolio sensitivity to market movements                            |
| Alpha                | Excess return above what Beta would predict                          |
| Max Drawdown         | Largest peak-to-trough decline                                      |
| Volatility           | Standard deviation of returns                                       |
| Calmar Ratio         | Annualized return divided by max drawdown                            |
| Treynor Ratio        | Excess return per unit of systematic risk (Beta)                     |
| VaR (95%)            | Maximum expected loss at 95% confidence level                        |
| Information Ratio    | Active return relative to tracking error versus benchmark            |
| Correlation Matrix   | Cross-asset correlation of returns                                   |

**Signal Logic**

| Signal                | Methodology                                                         |
|-----------------------|---------------------------------------------------------------------|
| RSI                   | 14-period Relative Strength Index. Below 30 = oversold, above 70 = overbought. |
| Drawdown from High    | Current price vs. 52-week or all-time high, expressed as percentage. |
| Capitulation Detection| Triggered when price drop + volume spike + RSI oversold occur simultaneously. |
| Moving Average Crossover | 50-day SMA crossing above/below 200-day SMA (Golden/Death Cross). |
| Volume Spike          | Current volume significantly exceeding average volume.              |

**Macro Interpretation**

| Indicator      | Interpretation Approach                                              |
|----------------|----------------------------------------------------------------------|
| VIX            | Contrarian: extreme fear levels signal potential buying opportunities |
| Dollar Index   | Strong dollar impact on multinational earnings and commodities        |
| Yield Curve    | 2Y-10Y spread analysis for recession signaling                      |
| Rate Environment | Fed policy context for equity and bond positioning                 |

---

## 7. Components

### 7.1 UI Component Inventory

| Component         | Description                                                             |
|-------------------|-------------------------------------------------------------------------|
| Navigation        | Top nav with three mode tabs: Investing, Day Trading, Retirement        |
| MetricCard        | Displays a single portfolio metric with hover/tap tooltip in plain English |
| SignalCard        | Displays a buy/sell/hold signal with expandable description             |
| LiveMacroPanel    | Real-time macro data panel (VIX, DXY, yields, TLT, gold)               |
| GatorChat         | Floating chatbot widget with Big Bull alligator mascot                  |
| Account Cards     | Summary cards for 401(k), Roth IRA, and Taxable accounts               |
| Data Table        | Sortable, filterable table used in the Day Trading screener             |
| Bar Chart         | Retirement projection visualization                                    |
| Ticker Cloud      | Visual cloud of all tracked asset tickers on the landing page           |
| Live Status       | Green dot indicator with timestamp showing last data refresh            |

### 7.2 Design System

- **Framework**: Tailwind CSS v4.
- **Live indicators**: Green dot with timestamp for real-time data freshness.
- **Tooltips**: Plain-English explanations on all metric cards (hover on desktop, tap on mobile).
- **Auto-refresh**: 30-second polling interval with visual status indicators.

---

## 8. Deployment

### 8.1 Infrastructure

| Attribute          | Value                                    |
|--------------------|------------------------------------------|
| Hosting            | Vercel                                   |
| Production URL     | brilliontly.vercel.app                |
| Repository         | github.com/jrtdawgs/brilliontly           |
| Branch             | master                                   |
| Deploy Trigger     | Auto-deploy on push to master            |
| Database           | SQLite (better-sqlite3), local file      |

### 8.2 Founder's Portfolio (Reference Data)

The following allocations are used as the founder's reference portfolio within the platform:

| Account     | Allocation                                                   |
|-------------|--------------------------------------------------------------|
| 401(k)      | 100% FXAIX (Fidelity 500 Index Fund)                        |
| Roth IRA    | 100% QQQM (Invesco Nasdaq 100 ETF)                          |
| Taxable     | SPY, QQQ, SOXL, BTC, ETH, BITX, ETHU (split allocation)    |

---

## 9. Roadmap

### 9.1 Brokerage Integration

| Item                        | Detail                                                         |
|-----------------------------|----------------------------------------------------------------|
| SnapTrade Integration       | Real-time account linking for Fidelity and Robinhood           |
| SnapTrade Free Tier         | 5 connections available                                        |
| SnapTrade Connection Portal | User onboarding flow for linking brokerage accounts            |
| Plaid (Backup)              | Alternative brokerage integration if SnapTrade is insufficient |

### 9.2 Database Migration

| Item                        | Detail                                                         |
|-----------------------------|----------------------------------------------------------------|
| Current                     | SQLite via better-sqlite3 (local file, not serverless-compatible) |
| Target Options              | Turso (serverless SQLite) or Vercel KV                         |
| Motivation                  | Enable full serverless deployment on Vercel without local file dependency |

### 9.3 Portfolio Analytics Upgrade

| Item                              | Detail                                                     |
|-----------------------------------|------------------------------------------------------------|
| Real Portfolio Metrics            | Compute Sharpe, Alpha, Beta, etc. from actual linked account data instead of static/sample data |
| Live Holdings Sync                | Automatic portfolio updates via SnapTrade or Plaid         |

---

## 10. Appendix

### 10.1 CSV Import Format Support

| Brokerage   | Auto-Detected | Fields Parsed                              |
|-------------|---------------|--------------------------------------------|
| Fidelity    | Yes           | Ticker, Name, Shares, Cost Basis           |
| Schwab      | Yes           | Ticker, Name, Shares, Cost Basis           |
| Robinhood   | Yes           | Ticker, Name, Shares, Cost Basis           |
| Vanguard    | Yes           | Ticker, Name, Shares, Cost Basis           |
| Generic     | Fallback      | Ticker, Name, Shares, Cost Basis           |

### 10.2 Chatbot Knowledge Categories

1. Portfolio basics (what is a portfolio, diversification, rebalancing)
2. Account types (401k, Roth IRA, Taxable, HSA)
3. Holdings (individual stocks, ETFs, index funds, crypto)
4. Metrics (Sharpe, Sortino, Beta, Alpha, drawdown, volatility)
5. Signals (RSI, capitulation, moving averages, volume)
6. Macro (VIX, yields, dollar index, Fed policy)
7. Strategy (buy and hold, dollar cost averaging, glide paths)

### 10.3 Document History

| Date       | Version | Change                          |
|------------|---------|---------------------------------|
| 2026-03-10 | 1.0     | Initial complete platform audit |
