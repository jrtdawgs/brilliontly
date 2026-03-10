# PRD-002: Phase 1 - MVP Dashboard & Analytics Engine

### Parent: PRD-001 (Master)
### Version: 1.0
### Date: 2026-03-10

---

## 1. Objective

Build a fully functional investment dashboard that:
- Displays the founder's 3 accounts with real-time pricing
- Calculates and visualizes advanced portfolio metrics
- Provides clear, beginner-friendly explanations of each metric
- Exposes a REST API that can later be opened to clients

## 2. User Stories

### US-1: Portfolio Overview
**As a** user, **I want to** see all my accounts on one dashboard
**so that** I understand my total investment picture.

**Acceptance Criteria:**
- Dashboard shows 3 account cards (401k, Roth IRA, Taxable)
- Each card shows: account name, total value, daily change ($ and %), holdings list
- Aggregate portfolio value shown at top
- Data refreshes on page load and via manual refresh button

### US-2: Holdings Detail
**As a** user, **I want to** drill into each holding
**so that** I can see performance metrics for individual positions.

**Acceptance Criteria:**
- Click a holding to see: current price, daily/weekly/monthly/YTD/1Y returns
- Mini price chart (sparkline) for each holding
- Position size in $ and % of account

### US-3: Core Metrics Dashboard
**As a** user, **I want to** see advanced risk/return metrics
**so that** I can make better investment decisions.

**Acceptance Criteria:**
- Metrics panel showing: Sharpe, Sortino, Beta, Alpha, Max Drawdown, Volatility
- Each metric has a tooltip explaining what it means in plain English
- Color coding: green (good), yellow (moderate), red (concerning)
- Metrics calculated for each account AND aggregate portfolio

### US-4: Allocation Visualization
**As a** user, **I want to** see my allocation breakdown visually
**so that** I understand my diversification.

**Acceptance Criteria:**
- Donut/pie chart of allocation by holding
- Stacked bar showing: equity vs crypto vs leveraged exposure
- Table with exact percentages

### US-5: Rebalancing Signals
**As a** user, **I want to** know when my portfolio drifts from target
**so that** I can rebalance at the right time.

**Acceptance Criteria:**
- Set target allocations per account
- Show current vs target with drift percentage
- Visual indicator when drift exceeds threshold (default 5%)
- Suggested trades to rebalance

## 3. Pages

### 3.1 Landing Page (`/`)
- Hero section explaining Brillontly
- Feature highlights
- CTA to sign up / log in

### 3.2 Dashboard (`/dashboard`)
- Account summary cards
- Aggregate portfolio value + daily change
- Quick metrics summary
- Holdings table

### 3.3 Analytics (`/analytics`)
- Full metrics panel with all risk/return metrics
- Correlation matrix heatmap
- Allocation charts
- Historical performance chart

### 3.4 Account Detail (`/account/[id]`)
- Individual account deep dive
- Holdings with individual metrics
- Account-specific recommendations

### 3.5 API Docs (`/api-docs`)
- Interactive API documentation
- Endpoint descriptions and examples

## 4. Data Flow

```
User loads dashboard
  -> Next.js server component fetches from DB (user portfolio config)
  -> API route calls Yahoo Finance / CoinGecko for current prices
  -> Prices cached for 5 minutes (avoid rate limits)
  -> Analytics engine calculates metrics from historical data
  -> Results returned to UI with metric explanations
```

## 5. Database Schema (Phase 1)

```sql
-- Users
users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  created_at TIMESTAMP
)

-- Accounts (401k, Roth IRA, Taxable)
accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  name TEXT,           -- "401(k)", "Roth IRA", "Taxable"
  account_type TEXT,   -- "401k", "roth_ira", "taxable"
  created_at TIMESTAMP
)

-- Holdings within accounts
holdings (
  id TEXT PRIMARY KEY,
  account_id TEXT REFERENCES accounts(id),
  ticker TEXT,
  name TEXT,
  shares REAL,
  cost_basis REAL,
  target_allocation REAL,  -- target % for rebalancing
  asset_type TEXT,          -- "equity", "etf", "crypto", "leveraged_etf"
  created_at TIMESTAMP
)

-- Cached price data
price_cache (
  ticker TEXT,
  price REAL,
  change_percent REAL,
  fetched_at TIMESTAMP,
  PRIMARY KEY (ticker, fetched_at)
)

-- Historical metrics snapshots
metrics_snapshots (
  id TEXT PRIMARY KEY,
  account_id TEXT REFERENCES accounts(id),
  metrics_json TEXT,  -- JSON blob of calculated metrics
  calculated_at TIMESTAMP
)
```

## 6. Component Architecture

```
app/
  layout.tsx              -- Root layout with nav
  page.tsx                -- Landing page
  dashboard/
    page.tsx              -- Main dashboard
    loading.tsx           -- Skeleton loader
  analytics/
    page.tsx              -- Full analytics view
  account/
    [id]/page.tsx         -- Account detail

components/
  ui/                     -- shadcn/ui components
  dashboard/
    AccountCard.tsx        -- Account summary card
    PortfolioSummary.tsx   -- Aggregate value header
    HoldingsTable.tsx      -- Holdings list with prices
  analytics/
    MetricsPanel.tsx       -- Risk/return metrics grid
    MetricCard.tsx         -- Individual metric with tooltip
    AllocationChart.tsx    -- Donut chart
    CorrelationMatrix.tsx  -- Heatmap
    PerformanceChart.tsx   -- Line chart of returns
  rebalancing/
    DriftIndicator.tsx     -- Current vs target
    RebalanceSignal.tsx    -- Suggested trades

lib/
  analytics/
    metrics.ts            -- Core metric calculations
    returns.ts            -- Return calculations
    risk.ts               -- Risk calculations
  market/
    yahoo.ts              -- Yahoo Finance API client
    coingecko.ts          -- CoinGecko API client
    cache.ts              -- Price caching layer
  db/
    schema.ts             -- Drizzle ORM schema
    queries.ts            -- Database queries
```

## 7. Metric Definitions & Explanations

Each metric displayed will include a plain-English tooltip:

| Metric | Tooltip |
|--------|---------|
| Sharpe Ratio | "How much extra return you're getting for the risk you're taking. Above 1.0 is good, above 2.0 is great." |
| Sortino Ratio | "Like Sharpe, but only penalizes downside volatility. Higher is better." |
| Beta | "How much your portfolio moves vs the S&P 500. Beta of 1.0 = moves with market. Above 1.0 = more volatile." |
| Alpha | "Your excess return beyond what the market gave you. Positive alpha = you're beating the market on a risk-adjusted basis." |
| Max Drawdown | "The biggest peak-to-trough drop. Shows worst-case scenario you've experienced." |
| Volatility | "How much your portfolio bounces around. Higher = more unpredictable." |
| Calmar Ratio | "Return divided by worst drawdown. Shows if the returns justify the pain." |
| VaR (95%) | "On 95% of days, you won't lose more than this amount." |

## 8. Non-Functional Requirements

- First Contentful Paint < 1.5s
- API response (cached) < 200ms
- API response (fresh calc) < 3s
- Mobile responsive (works on phone)
- Dark mode support
- Accessible (WCAG 2.1 AA)

## 9. Out of Scope (Phase 1)

- Multi-user authentication (hardcoded single user)
- Payment/billing
- PDF report generation
- AI recommendations
- Backtesting
- Real-time websocket price updates
