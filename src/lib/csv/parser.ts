// CSV Parser for brokerage exports
// Supports: Fidelity, Schwab, Robinhood, Vanguard
// Raw CSV is processed in memory only - never persisted

import type { HoldingData } from '@/lib/db/database';

export type Brokerage = 'fidelity' | 'schwab' | 'robinhood' | 'vanguard' | 'generic';
export type AccountType = 'taxable' | '401k' | 'roth_ira' | 'hsa' | 'traditional_ira';

export interface AccountGroup {
  accountType: AccountType;
  accountName: string;
  holdings: HoldingData[];
}

interface ParseResult {
  success: boolean;
  brokerage: Brokerage;
  accounts: AccountGroup[];
  errors: string[];
}

// Parse CSV text into rows
function parseCSVRows(text: string): string[][] {
  const lines = text.trim().split(/\r?\n/);
  return lines.map((line) => {
    const row: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    return row;
  });
}

// Detect which brokerage the CSV is from based on headers
function detectBrokerage(headers: string[]): Brokerage {
  const headerStr = headers.join(',').toLowerCase();

  if (headerStr.includes('account number') && headerStr.includes('symbol') && headerStr.includes('description') && headerStr.includes('quantity')) {
    return 'fidelity';
  }
  if (headerStr.includes('symbol') && headerStr.includes('name') && headerStr.includes('quantity') && headerStr.includes('cost basis')) {
    return 'schwab';
  }
  if (headerStr.includes('instrument') && headerStr.includes('quantity') && headerStr.includes('average cost')) {
    return 'robinhood';
  }
  if (headerStr.includes('investment name') && headerStr.includes('symbol') && headerStr.includes('shares')) {
    return 'vanguard';
  }

  return 'generic';
}

// Detect account type from an account name string
function detectAccountType(accountName: string): AccountType {
  const n = accountName.toLowerCase();
  if (n.includes('roth')) return 'roth_ira';
  if (n.includes('401k') || n.includes('401(k)')) return '401k';
  if (n.includes('hsa') || n.includes('health savings')) return 'hsa';
  if (n.includes('traditional ira') || n.includes('trad ira') || n.includes('rollover ira')) return 'traditional_ira';
  if (n.includes('ira')) return 'traditional_ira';
  return 'taxable';
}

// Detect account type by scanning the entire CSV text for keywords (fallback)
function detectAccountTypeFromText(csvText: string): AccountType {
  const t = csvText.toLowerCase();
  if (t.includes('roth')) return 'roth_ira';
  if (t.includes('401(k)') || t.includes('401k')) return '401k';
  if (t.includes('hsa') || t.includes('health savings')) return 'hsa';
  if (t.includes('traditional ira') || t.includes('rollover ira')) return 'traditional_ira';
  if (t.includes('ira')) return 'traditional_ira';
  return 'taxable';
}

function accountTypeName(type: AccountType, brokerage: string): string {
  const broker = brokerage === 'generic' ? 'Imported' : brokerage.charAt(0).toUpperCase() + brokerage.slice(1);
  switch (type) {
    case 'roth_ira': return `${broker} Roth IRA`;
    case '401k': return `${broker} 401(k)`;
    case 'hsa': return `${broker} HSA`;
    case 'traditional_ira': return `${broker} Traditional IRA`;
    default: return `${broker} Brokerage`;
  }
}

// Find column index by partial header match
function findColumn(headers: string[], ...names: string[]): number {
  const lowerHeaders = headers.map((h) => h.toLowerCase().trim());
  for (const name of names) {
    const idx = lowerHeaders.findIndex((h) => h.includes(name.toLowerCase()));
    if (idx >= 0) return idx;
  }
  return -1;
}

// Clean number string (remove $, commas, etc.)
function parseNumber(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[$,\s]/g, '').replace(/[()]/g, '-');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// Determine asset type from ticker/name
function guessAssetType(ticker: string, name: string): string {
  const t = ticker.toUpperCase();
  const n = name.toLowerCase();

  if (['BTC-USD', 'BTC', 'ETH-USD', 'ETH'].includes(t)) return 'crypto';
  if (['BITX', 'ETHU', 'BITO', 'GBTC', 'ETHE'].includes(t)) return 'crypto_etf';
  if (['SOXL', 'TQQQ', 'UPRO', 'SPXL', 'TECL', 'FNGU', 'LABU'].includes(t)) return 'leveraged_etf';
  if (n.includes('index fund') || t === 'FXAIX' || t === 'FSKAX' || t === 'VFIAX') return 'index_fund';
  if (n.includes('3x') || n.includes('2x') || n.includes('ultra') || n.includes('leveraged')) return 'leveraged_etf';
  if (n.includes('bitcoin') || n.includes('ethereum') || n.includes('crypto')) return 'crypto_etf';

  return 'etf';
}

// Parse Fidelity CSV — groups rows by Account Name column to split 401k/Roth/taxable
function parseFidelity(rows: string[][], headers: string[], brokerage: Brokerage): AccountGroup[] {
  const accountNameCol = findColumn(headers, 'account name');
  const symbolCol = findColumn(headers, 'symbol');
  const nameCol = findColumn(headers, 'description', 'name');
  const sharesCol = findColumn(headers, 'quantity', 'shares');
  const priceCol = findColumn(headers, 'last price', 'price');

  if (symbolCol < 0 || sharesCol < 0) return [];

  const grouped = new Map<string, HoldingData[]>();

  for (const row of rows) {
    const ticker = row[symbolCol]?.replace('**', '').trim();
    if (!ticker || ticker === '--' || ticker.includes('Total') || ticker.includes('Pending')) continue;

    const shares = parseNumber(row[sharesCol]);
    if (shares <= 0) continue;

    const acctKey = accountNameCol >= 0 ? (row[accountNameCol]?.trim() || 'Unknown') : 'Unknown';
    const name = row[nameCol] || ticker;

    if (!grouped.has(acctKey)) grouped.set(acctKey, []);
    grouped.get(acctKey)!.push({
      ticker,
      name,
      shares,
      costBasis: parseNumber(row[priceCol]),
      targetAllocation: 0,
      assetType: guessAssetType(ticker, name),
    });
  }

  if (grouped.size === 0) return [];

  // If no account name column, return all as one group with text-detected type
  if (accountNameCol < 0) {
    const holdings = [...grouped.values()].flat();
    return [{ accountType: 'taxable', accountName: accountTypeName('taxable', brokerage), holdings }];
  }

  return [...grouped.entries()].map(([acctName, holdings]) => {
    const accountType = detectAccountType(acctName);
    return {
      accountType,
      accountName: acctName || accountTypeName(accountType, brokerage),
      holdings,
    };
  });
}

// Parse Schwab CSV
function parseSchwab(rows: string[][], headers: string[], brokerage: Brokerage, csvText: string): AccountGroup[] {
  const symbolCol = findColumn(headers, 'symbol');
  const nameCol = findColumn(headers, 'name', 'description');
  const sharesCol = findColumn(headers, 'quantity', 'shares');
  const costCol = findColumn(headers, 'cost basis', 'cost');
  const priceCol = findColumn(headers, 'price');

  if (symbolCol < 0 || sharesCol < 0) return [];

  const holdings: HoldingData[] = rows
    .filter((row) => row[symbolCol] && !row[symbolCol].includes('Total') && !row[symbolCol].includes('Account'))
    .map((row) => {
      const ticker = row[symbolCol]?.trim() || '';
      const name = row[nameCol] || ticker;
      const shares = parseNumber(row[sharesCol]);
      const costBasis = costCol >= 0 ? parseNumber(row[costCol]) / (shares || 1) : parseNumber(row[priceCol]);
      return { ticker, name, shares, costBasis, targetAllocation: 0, assetType: guessAssetType(ticker, name) };
    })
    .filter((h) => h.shares > 0 && h.ticker);

  const accountType = detectAccountTypeFromText(csvText);
  return [{ accountType, accountName: accountTypeName(accountType, brokerage), holdings }];
}

// Parse Robinhood CSV
function parseRobinhood(rows: string[][], headers: string[], brokerage: Brokerage): AccountGroup[] {
  const instrumentCol = findColumn(headers, 'instrument', 'symbol', 'name');
  const sharesCol = findColumn(headers, 'quantity', 'shares');
  const costCol = findColumn(headers, 'average cost', 'cost');

  if (instrumentCol < 0 || sharesCol < 0) return [];

  const holdings: HoldingData[] = rows
    .filter((row) => row[instrumentCol])
    .map((row) => {
      const ticker = row[instrumentCol]?.trim() || '';
      return { ticker, name: ticker, shares: parseNumber(row[sharesCol]), costBasis: parseNumber(row[costCol]), targetAllocation: 0, assetType: guessAssetType(ticker, ticker) };
    })
    .filter((h) => h.shares > 0 && h.ticker);

  return [{ accountType: 'taxable', accountName: 'Robinhood Brokerage', holdings }];
}

// Parse Vanguard CSV — may have account type in metadata rows above headers
function parseVanguard(rows: string[][], headers: string[], brokerage: Brokerage, csvText: string): AccountGroup[] {
  const symbolCol = findColumn(headers, 'symbol', 'ticker');
  const nameCol = findColumn(headers, 'investment name', 'name');
  const sharesCol = findColumn(headers, 'shares', 'quantity');
  const priceCol = findColumn(headers, 'share price', 'price');

  if (symbolCol < 0 || sharesCol < 0) return [];

  const holdings: HoldingData[] = rows
    .filter((row) => row[symbolCol] && row[symbolCol] !== '--')
    .map((row) => {
      const ticker = row[symbolCol]?.trim() || '';
      const name = row[nameCol] || ticker;
      return { ticker, name, shares: parseNumber(row[sharesCol]), costBasis: parseNumber(row[priceCol]), targetAllocation: 0, assetType: guessAssetType(ticker, name) };
    })
    .filter((h) => h.shares > 0 && h.ticker);

  const accountType = detectAccountTypeFromText(csvText);
  return [{ accountType, accountName: accountTypeName(accountType, brokerage), holdings }];
}

// Generic CSV parser (best effort)
function parseGeneric(rows: string[][], headers: string[], brokerage: Brokerage, csvText: string): AccountGroup[] {
  const symbolCol = findColumn(headers, 'symbol', 'ticker', 'instrument');
  const nameCol = findColumn(headers, 'name', 'description', 'instrument');
  const sharesCol = findColumn(headers, 'shares', 'quantity', 'qty', 'amount');
  const costCol = findColumn(headers, 'cost', 'price', 'basis', 'average');

  if (symbolCol < 0 || sharesCol < 0) return [];

  const holdings: HoldingData[] = rows
    .filter((row) => row[symbolCol])
    .map((row) => {
      const ticker = row[symbolCol]?.trim() || '';
      const name = nameCol >= 0 ? row[nameCol] || ticker : ticker;
      return { ticker, name, shares: parseNumber(row[sharesCol]), costBasis: costCol >= 0 ? parseNumber(row[costCol]) : 0, targetAllocation: 0, assetType: guessAssetType(ticker, name) };
    })
    .filter((h) => h.shares > 0 && h.ticker);

  const accountType = detectAccountTypeFromText(csvText);
  return [{ accountType, accountName: accountTypeName(accountType, brokerage), holdings }];
}

// Main CSV parsing function
export function parseCSV(csvText: string): ParseResult {
  const errors: string[] = [];

  try {
    const rows = parseCSVRows(csvText);
    if (rows.length < 2) {
      return { success: false, brokerage: 'generic', accounts: [], errors: ['CSV file is empty or has no data rows.'] };
    }

    // Find the header row — some brokerages have metadata rows before the actual headers
    let headerRowIdx = 0;
    for (let i = 0; i < Math.min(rows.length, 10); i++) {
      const rowStr = rows[i].join(',').toLowerCase();
      if (rowStr.includes('symbol') || rowStr.includes('instrument') || rowStr.includes('investment name')) {
        headerRowIdx = i;
        break;
      }
    }

    const headers = rows[headerRowIdx];
    const dataRows = rows.slice(headerRowIdx + 1).filter((r) => r.some((c) => c.trim()));
    const brokerage = detectBrokerage(headers);

    let accounts: AccountGroup[];

    switch (brokerage) {
      case 'fidelity':
        accounts = parseFidelity(dataRows, headers, brokerage);
        break;
      case 'schwab':
        accounts = parseSchwab(dataRows, headers, brokerage, csvText);
        break;
      case 'robinhood':
        accounts = parseRobinhood(dataRows, headers, brokerage);
        break;
      case 'vanguard':
        accounts = parseVanguard(dataRows, headers, brokerage, csvText);
        break;
      default:
        accounts = parseGeneric(dataRows, headers, brokerage, csvText);
    }

    accounts = accounts.filter((a) => a.holdings.length > 0);

    if (accounts.length === 0) {
      errors.push('No valid holdings found in CSV. Make sure the file has columns for ticker/symbol, shares/quantity, and optionally price/cost basis.');
    }

    return { success: accounts.length > 0, brokerage, accounts, errors };
  } catch (err) {
    return {
      success: false,
      brokerage: 'generic',
      accounts: [],
      errors: [`Failed to parse CSV: ${err instanceof Error ? err.message : 'Unknown error'}`],
    };
  }
}
