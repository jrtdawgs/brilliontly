// Portfolio data types and founder's portfolio configuration
// Phase 1: Static data, later replaced with database

export type AssetType = 'index_fund' | 'etf' | 'leveraged_etf' | 'crypto' | 'crypto_etf';

export interface Holding {
  ticker: string;
  name: string;
  shares: number;
  costBasis: number;
  targetAllocation: number;
  assetType: AssetType;
  isCrypto: boolean; // Use CoinGecko vs Yahoo
}

export interface Account {
  id: string;
  name: string;
  type: '401k' | 'roth_ira' | 'taxable';
  holdings: Holding[];
}

export interface UserPortfolio {
  userId: string;
  name: string;
  accounts: Account[];
}

// Founder's portfolio configuration
export const FOUNDER_PORTFOLIO: UserPortfolio = {
  userId: 'founder',
  name: 'Joshua Torres',
  accounts: [
    {
      id: 'acct-401k',
      name: '401(k)',
      type: '401k',
      holdings: [
        {
          ticker: 'FXAIX',
          name: 'Fidelity 500 Index Fund',
          shares: 100, // Placeholder - update with real numbers
          costBasis: 170,
          targetAllocation: 100,
          assetType: 'index_fund',
          isCrypto: false,
        },
      ],
    },
    {
      id: 'acct-roth',
      name: 'Roth IRA',
      type: 'roth_ira',
      holdings: [
        {
          ticker: 'QQQM',
          name: 'Invesco NASDAQ 100 ETF',
          shares: 50, // Placeholder
          costBasis: 175,
          targetAllocation: 100,
          assetType: 'etf',
          isCrypto: false,
        },
      ],
    },
    {
      id: 'acct-taxable',
      name: 'Taxable Brokerage',
      type: 'taxable',
      holdings: [
        {
          ticker: 'SPY',
          name: 'SPDR S&P 500 ETF',
          shares: 10,
          costBasis: 450,
          targetAllocation: 20,
          assetType: 'etf',
          isCrypto: false,
        },
        {
          ticker: 'QQQ',
          name: 'Invesco QQQ Trust',
          shares: 10,
          costBasis: 380,
          targetAllocation: 20,
          assetType: 'etf',
          isCrypto: false,
        },
        {
          ticker: 'SOXL',
          name: 'Direxion Semiconductor Bull 3X',
          shares: 25,
          costBasis: 25,
          targetAllocation: 10,
          assetType: 'leveraged_etf',
          isCrypto: false,
        },
        {
          ticker: 'BTC-USD',
          name: 'Bitcoin',
          shares: 0.05,
          costBasis: 60000,
          targetAllocation: 15,
          assetType: 'crypto',
          isCrypto: true,
        },
        {
          ticker: 'ETH-USD',
          name: 'Ethereum',
          shares: 1,
          costBasis: 3000,
          targetAllocation: 10,
          assetType: 'crypto',
          isCrypto: true,
        },
        {
          ticker: 'BITX',
          name: 'Volatility Shares 2x Bitcoin Strategy ETF',
          shares: 20,
          costBasis: 30,
          targetAllocation: 15,
          assetType: 'crypto_etf',
          isCrypto: false,
        },
        {
          ticker: 'ETHU',
          name: 'ProShares Ultra Ether ETF',
          shares: 30,
          costBasis: 20,
          targetAllocation: 10,
          assetType: 'crypto_etf',
          isCrypto: false,
        },
      ],
    },
  ],
};

// Get asset type label
export function getAssetTypeLabel(type: AssetType): string {
  switch (type) {
    case 'index_fund': return 'Index Fund';
    case 'etf': return 'ETF';
    case 'leveraged_etf': return 'Leveraged ETF';
    case 'crypto': return 'Cryptocurrency';
    case 'crypto_etf': return 'Crypto ETF';
  }
}

// Get asset type color
export function getAssetTypeColor(type: AssetType): string {
  switch (type) {
    case 'index_fund': return '#3b82f6'; // blue
    case 'etf': return '#10b981'; // green
    case 'leveraged_etf': return '#f59e0b'; // amber
    case 'crypto': return '#8b5cf6'; // purple
    case 'crypto_etf': return '#ef4444'; // red
  }
}

// Calculate risk level for asset type
export function getAssetRiskLevel(type: AssetType): 'Low' | 'Medium' | 'High' | 'Very High' {
  switch (type) {
    case 'index_fund': return 'Low';
    case 'etf': return 'Medium';
    case 'leveraged_etf': return 'Very High';
    case 'crypto': return 'Very High';
    case 'crypto_etf': return 'Very High';
  }
}
