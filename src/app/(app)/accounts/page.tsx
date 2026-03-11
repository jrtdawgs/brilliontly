'use client';

import { useState, useRef, useEffect } from 'react';

interface Holding {
  ticker: string;
  name: string;
  shares: number;
  costBasis: number;
  targetAllocation: number;
  assetType: string;
}

interface AccountGroup {
  accountType: string;
  accountName: string;
  holdings: Holding[];
}

const ACCOUNT_TYPE_OPTIONS = [
  { value: '401k', label: '401(k) → Retirement' },
  { value: 'roth_ira', label: 'Roth IRA → Retirement' },
  { value: 'traditional_ira', label: 'Traditional IRA → Retirement' },
  { value: 'hsa', label: 'HSA → Retirement' },
  { value: 'taxable', label: 'Taxable Brokerage → Investing & Day Trading' },
];

const FEEDS_LABEL: Record<string, string> = {
  '401k': 'Retirement',
  roth_ira: 'Retirement',
  traditional_ira: 'Retirement',
  hsa: 'Retirement',
  taxable: 'Investing & Day Trading',
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<{ id: string; accountType: string; name: string; holdings: Holding[] }[]>([]);
  const [showImport, setShowImport] = useState(false);
  const [importBrokerage, setImportBrokerage] = useState('');
  const [importedAccounts, setImportedAccounts] = useState<AccountGroup[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/v1/accounts');
      const data = await res.json();
      if (data.success) setAccounts(data.data);
    } catch {
      // Not logged in or error
    }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    const text = await file.text();

    try {
      const res = await fetch('/api/v1/accounts/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText: text }),
      });
      const data = await res.json();

      if (data.success) {
        setImportedAccounts(data.data.accounts);
        setImportBrokerage(data.data.brokerage);
      } else {
        setError(data.errors?.join(', ') || 'Failed to parse CSV');
      }
    } catch {
      setError('Failed to process CSV file.');
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveAll = async () => {
    setError('');
    let saved = 0;
    for (const acct of importedAccounts) {
      try {
        const res = await fetch('/api/v1/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accountType: acct.accountType,
            name: acct.accountName,
            holdings: acct.holdings,
          }),
        });
        const data = await res.json();
        if (data.success) saved++;
        else setError((prev) => prev + ` ${acct.accountName}: ${data.error}`);
      } catch {
        setError((prev) => prev + ` Failed to save ${acct.accountName}.`);
      }
    }
    if (saved > 0) {
      setSuccess(`${saved} account${saved > 1 ? 's' : ''} imported and encrypted.`);
      setImportedAccounts([]);
      setShowImport(false);
      fetchAccounts();
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete ALL your account data? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/v1/accounts', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { setSuccess(data.message); setAccounts([]); }
    } catch {
      setError('Failed to delete accounts.');
    }
  };

  const updateImportedAccount = (idx: number, field: 'accountType' | 'accountName', value: string) => {
    setImportedAccounts((prev) => prev.map((a, i) => i === idx ? { ...a, [field]: value } : a));
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Accounts</h1>
          <p className="text-gray-400 mt-1">Manage your investment accounts. All data is AES-256 encrypted.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled
            className="bg-[#1e293b] text-gray-500 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed border border-[#334155]"
            title="Coming soon"
          >
            Connect Brokerage
            <span className="ml-1.5 text-[10px] bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded">Soon</span>
          </button>
          <button
            onClick={() => { setShowImport(!showImport); setImportedAccounts([]); setError(''); }}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Import CSV
          </button>
        </div>
      </div>

      {/* Security Badge */}
      <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
        <svg className="w-6 h-6 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <div>
          <p className="text-sm text-green-300 font-medium">Your data is encrypted</p>
          <p className="text-xs text-green-400/70">All account data is encrypted with AES-256-GCM before storage.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">{error}</div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-sm text-green-400">{success}</div>
      )}

      {/* CSV Import */}
      {showImport && (
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 fade-in">
          <h3 className="text-lg font-semibold text-white mb-4">Import from CSV</h3>

          {/* Download instructions */}
          <div className="mb-6 space-y-3">
            <p className="text-sm text-gray-300 font-medium">How to export your holdings:</p>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-[#0d1117] border border-[#1e293b] rounded-lg p-4">
                <p className="text-sm text-blue-400 font-semibold mb-2">Fidelity (401k / Roth IRA)</p>
                <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
                  <li>Log in to NetBenefits or Fidelity.com</li>
                  <li>Go to <span className="text-white">Positions</span></li>
                  <li>Click <span className="text-white">Download</span> (top right)</li>
                  <li>Select <span className="text-white">CSV</span> format</li>
                </ol>
                <p className="text-[10px] text-gray-500 mt-2">Account types auto-detected from CSV</p>
              </div>
              <div className="bg-[#0d1117] border border-[#1e293b] rounded-lg p-4">
                <p className="text-sm text-green-400 font-semibold mb-2">Robinhood (Taxable)</p>
                <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
                  <li>Open Robinhood app or web</li>
                  <li>Go to <span className="text-white">Account → Statements & History</span></li>
                  <li>Click <span className="text-white">Download Account Statement</span></li>
                  <li>Select CSV / spreadsheet format</li>
                </ol>
              </div>
              <div className="bg-[#0d1117] border border-[#1e293b] rounded-lg p-4">
                <p className="text-sm text-purple-400 font-semibold mb-2">Schwab (Taxable / IRA)</p>
                <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
                  <li>Log in to Schwab.com</li>
                  <li>Go to <span className="text-white">Accounts → Positions</span></li>
                  <li>Click <span className="text-white">Export</span></li>
                  <li>Choose <span className="text-white">CSV</span></li>
                </ol>
              </div>
              <div className="bg-[#0d1117] border border-[#1e293b] rounded-lg p-4">
                <p className="text-sm text-cyan-400 font-semibold mb-2">Vanguard (Roth IRA / 401k)</p>
                <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
                  <li>Log in to Vanguard.com</li>
                  <li>Go to <span className="text-white">My Accounts → Holdings</span></li>
                  <li>Click <span className="text-white">Download to spreadsheet</span></li>
                  <li>Save the CSV file</li>
                </ol>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-600 file:text-white hover:file:bg-green-500 file:cursor-pointer"
          />

          {importedAccounts.length > 0 && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300 font-medium">
                  Detected <span className="text-green-400 capitalize">{importBrokerage}</span> — {importedAccounts.length} account{importedAccounts.length > 1 ? 's' : ''} found
                </span>
                <span className="text-xs text-gray-500">Adjust type or name if incorrect</span>
              </div>

              {importedAccounts.map((acct, idx) => (
                <div key={idx} className="bg-[#0d1117] border border-[#334155] rounded-xl p-4 space-y-3">
                  {/* Account type + name editor */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <select
                      value={acct.accountType}
                      onChange={(e) => updateImportedAccount(idx, 'accountType', e.target.value)}
                      className="bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-green-500"
                    >
                      {ACCOUNT_TYPE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={acct.accountName}
                      onChange={(e) => updateImportedAccount(idx, 'accountName', e.target.value)}
                      className="bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-green-500 flex-1 min-w-[160px]"
                    />
                    <span className="text-xs text-cyan-400">→ {FEEDS_LABEL[acct.accountType] || 'Investing'}</span>
                  </div>

                  {/* Holdings table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#1e293b]">
                          <th className="text-left text-gray-500 py-1.5 px-2">Ticker</th>
                          <th className="text-left text-gray-500 py-1.5 px-2">Name</th>
                          <th className="text-right text-gray-500 py-1.5 px-2">Shares</th>
                          <th className="text-right text-gray-500 py-1.5 px-2">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {acct.holdings.map((h, i) => (
                          <tr key={i} className="border-b border-[#1e293b]/40">
                            <td className="py-1.5 px-2 text-white font-mono">{h.ticker}</td>
                            <td className="py-1.5 px-2 text-gray-300 text-xs">{h.name}</td>
                            <td className="text-right py-1.5 px-2 text-white">{h.shares}</td>
                            <td className="text-right py-1.5 px-2 text-gray-400">${h.costBasis.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              <button
                onClick={handleSaveAll}
                className="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Save & Encrypt All Accounts
              </button>
            </div>
          )}
        </div>
      )}

      {/* Existing Accounts */}
      {accounts.length > 0 ? (
        <div className="space-y-4">
          {accounts.map((acct) => (
            <div key={acct.id} className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-white">{acct.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    acct.accountType === '401k' ? 'bg-blue-500/15 text-blue-400' :
                    acct.accountType === 'roth_ira' ? 'bg-purple-500/15 text-purple-400' :
                    acct.accountType === 'hsa' ? 'bg-cyan-500/15 text-cyan-400' :
                    acct.accountType === 'traditional_ira' ? 'bg-indigo-500/15 text-indigo-400' :
                    'bg-amber-500/15 text-amber-400'
                  }`}>
                    {acct.accountType === '401k' ? '401(k)' :
                     acct.accountType === 'roth_ira' ? 'Roth IRA' :
                     acct.accountType === 'traditional_ira' ? 'Traditional IRA' :
                     acct.accountType === 'hsa' ? 'HSA' :
                     acct.accountType === 'taxable' ? 'Taxable' : acct.accountType}
                  </span>
                  <span className="text-[10px] text-gray-600">
                    {['401k', 'roth_ira', 'hsa', 'traditional_ira'].includes(acct.accountType) ? '→ Retirement' : '→ Investing & Day Trading'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Encrypted
                </div>
              </div>
              <div className="space-y-1">
                {acct.holdings.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-mono">{h.ticker}</span>
                      <span className="text-gray-500">{h.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400">
                      <span>{h.shares} shares</span>
                      {h.costBasis > 0 && <span>@ ${h.costBasis.toFixed(2)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-12 text-center">
          <p className="text-gray-400 mb-4">No accounts yet. Import a CSV from your brokerage to get started.</p>
          <div className="flex items-center justify-center gap-3">
            <button
              disabled
              className="bg-[#1e293b] text-gray-500 px-6 py-2.5 rounded-xl font-medium cursor-not-allowed border border-[#334155]"
            >
              Connect Brokerage <span className="ml-1 text-[10px] bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded">Soon</span>
            </button>
            <button
              onClick={() => setShowImport(true)}
              className="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
            >
              Import CSV
            </button>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      {accounts.length > 0 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
          <h4 className="text-sm font-semibold text-red-400 mb-2">Danger Zone</h4>
          <p className="text-xs text-gray-400 mb-3">
            This will permanently delete all your encrypted account data. This action cannot be undone.
          </p>
          <button
            onClick={handleDeleteAll}
            className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg text-xs font-medium transition-colors"
          >
            Delete All Account Data
          </button>
        </div>
      )}
    </div>
  );
}
