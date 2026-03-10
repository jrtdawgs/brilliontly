'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Holding {
  ticker: string;
  name: string;
  shares: number;
  costBasis: number;
  targetAllocation: number;
  assetType: string;
}

interface AccountForm {
  accountType: string;
  name: string;
  holdings: Holding[];
}

interface BrokerageHolding {
  accountId: string;
  accountName: string;
  ticker: string;
  name: string;
  units: number;
  price: number;
  averagePrice: number;
  openPnl: number;
}

interface BrokerageAccount {
  id: string;
  name: string;
  number: string;
  institutionName: string;
  type: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<{ id: string; accountType: string; name: string; holdings: Holding[] }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importPreview, setImportPreview] = useState<Holding[] | null>(null);
  const [importBrokerage, setImportBrokerage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Brokerage connection state
  const [snaptradeConfigured, setSnaptradeConfigured] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [brokerageAccounts, setBrokerageAccounts] = useState<BrokerageAccount[]>([]);
  const [brokerageHoldings, setBrokerageHoldings] = useState<BrokerageHolding[]>([]);
  const [loadingHoldings, setLoadingHoldings] = useState(false);

  // Check if SnapTrade is configured
  useEffect(() => {
    fetch('/api/v1/brokerage/connect')
      .then(res => res.json())
      .then(data => {
        if (data.success) setSnaptradeConfigured(data.configured);
      })
      .catch(() => {});
  }, []);

  // Load brokerage holdings if we have a stored secret
  const loadBrokerageHoldings = useCallback(async () => {
    const userSecret = localStorage.getItem('snaptrade_user_secret');
    if (!userSecret) return;

    setLoadingHoldings(true);
    try {
      const res = await fetch(`/api/v1/brokerage/holdings?userSecret=${encodeURIComponent(userSecret)}`);
      const data = await res.json();
      if (data.success) {
        setBrokerageAccounts(data.data.accounts);
        setBrokerageHoldings(data.data.holdings);
      }
    } catch {
      // Silent fail - user may not have connected yet
    } finally {
      setLoadingHoldings(false);
    }
  }, []);

  useEffect(() => {
    loadBrokerageHoldings();
  }, [loadBrokerageHoldings]);

  // Connect brokerage
  const handleConnectBrokerage = async () => {
    setConnecting(true);
    setError('');
    try {
      const res = await fetch('/api/v1/brokerage/connect', { method: 'POST' });
      const data = await res.json();

      if (data.success && data.data.redirectUrl) {
        // Store the user secret for future API calls
        localStorage.setItem('snaptrade_user_secret', data.data.userSecret);
        // Open SnapTrade connection portal in new window
        window.open(data.data.redirectUrl, '_blank', 'width=500,height=700');
        setSuccess('Connection portal opened. After linking your account, click "Refresh Holdings" to see your data.');
      } else {
        setError(data.error || 'Failed to create connection');
      }
    } catch {
      setError('Failed to connect to brokerage service.');
    } finally {
      setConnecting(false);
    }
  };

  const [form, setForm] = useState<AccountForm>({
    accountType: '401k',
    name: '',
    holdings: [{ ticker: '', name: '', shares: 0, costBasis: 0, targetAllocation: 0, assetType: 'etf' }],
  });

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/v1/accounts');
      const data = await res.json();
      if (data.success) setAccounts(data.data);
    } catch {
      // Not logged in or error
    }
  };

  // Fetch on mount
  useState(() => { fetchAccounts(); });

  const addHolding = () => {
    setForm({
      ...form,
      holdings: [...form.holdings, { ticker: '', name: '', shares: 0, costBasis: 0, targetAllocation: 0, assetType: 'etf' }],
    });
  };

  const removeHolding = (index: number) => {
    setForm({
      ...form,
      holdings: form.holdings.filter((_, i) => i !== index),
    });
  };

  const updateHolding = (index: number, field: keyof Holding, value: string | number) => {
    const updated = [...form.holdings];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, holdings: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/v1/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Account created and encrypted successfully.');
        setShowForm(false);
        setForm({
          accountType: '401k',
          name: '',
          holdings: [{ ticker: '', name: '', shares: 0, costBasis: 0, targetAllocation: 0, assetType: 'etf' }],
        });
        fetchAccounts();
      } else {
        setError(data.error);
      }
    } catch {
      setError('Failed to create account. Make sure you are logged in.');
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();

    try {
      const res = await fetch('/api/v1/accounts/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText: text }),
      });
      const data = await res.json();

      if (data.success) {
        setImportPreview(data.data.holdings);
        setImportBrokerage(data.data.brokerage);
      } else {
        setError(data.errors?.join(', ') || 'Failed to parse CSV');
      }
    } catch {
      setError('Failed to process CSV file.');
    }

    // Clear file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImportSave = async (accountType: string, name: string) => {
    if (!importPreview) return;

    try {
      const res = await fetch('/api/v1/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountType, name, holdings: importPreview }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Account imported and encrypted successfully.');
        setImportPreview(null);
        setShowImport(false);
        fetchAccounts();
      } else {
        setError(data.error);
      }
    } catch {
      setError('Failed to save imported data.');
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete ALL your account data? This cannot be undone.')) return;

    try {
      const res = await fetch('/api/v1/accounts', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message);
        setAccounts([]);
      }
    } catch {
      setError('Failed to delete accounts.');
    }
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Accounts</h1>
          <p className="text-gray-400 mt-1">Manage your investment accounts. All data is AES-256 encrypted.</p>
        </div>
        <div className="flex items-center gap-2">
          {snaptradeConfigured && (
            <button
              onClick={handleConnectBrokerage}
              disabled={connecting}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {connecting ? 'Connecting...' : 'Connect Brokerage'}
            </button>
          )}
          <button
            onClick={() => { setShowForm(true); setShowImport(false); }}
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Add Account
          </button>
          <button
            onClick={() => { setShowImport(true); setShowForm(false); }}
            className="border border-[#334155] hover:border-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
          <p className="text-xs text-green-400/70">All account data is encrypted with AES-256-GCM before storage. Your brokerage credentials are never stored.</p>
        </div>
      </div>

      {/* Connect Brokerage Section */}
      {snaptradeConfigured && (
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/15 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Connect Your Brokerage</h3>
                <p className="text-xs text-gray-400">Link Fidelity, Robinhood, or other brokerages to auto-import holdings</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {brokerageAccounts.length > 0 && (
                <button
                  onClick={loadBrokerageHoldings}
                  disabled={loadingHoldings}
                  className="text-xs bg-[#1e293b] text-gray-300 px-3 py-1.5 rounded-lg hover:bg-[#334155] transition-colors disabled:opacity-50"
                >
                  {loadingHoldings ? 'Loading...' : 'Refresh Holdings'}
                </button>
              )}
              <button
                onClick={handleConnectBrokerage}
                disabled={connecting}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {connecting ? 'Connecting...' : brokerageAccounts.length > 0 ? 'Add Another Account' : 'Connect Account'}
              </button>
            </div>
          </div>

          {/* Supported Brokerages */}
          {brokerageAccounts.length === 0 && !loadingHoldings && (
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#1e293b]">
              <span className="text-xs text-gray-500">Supported:</span>
              {['Fidelity', 'Robinhood', 'Schwab', 'TD Ameritrade', 'E*Trade', 'Interactive Brokers'].map((name) => (
                <span key={name} className="text-xs text-gray-400 bg-[#1e293b] px-2 py-1 rounded">
                  {name}
                </span>
              ))}
            </div>
          )}

          {/* Loading state */}
          {loadingHoldings && (
            <div className="text-center py-6">
              <div className="animate-pulse text-blue-400 text-sm font-medium">Loading your brokerage data...</div>
            </div>
          )}

          {/* Connected Accounts */}
          {brokerageAccounts.length > 0 && (
            <div className="mt-4 space-y-4">
              {brokerageAccounts.map((acct) => (
                <div key={acct.id} className="bg-[#0d1117] border border-[#1e293b] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                        <span className="text-blue-400 text-xs font-bold">{acct.institutionName?.[0] || 'B'}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">{acct.name || acct.institutionName}</h4>
                        <span className="text-xs text-gray-500">{acct.institutionName} &middot; {acct.type} &middot; ****{acct.number?.slice(-4)}</span>
                      </div>
                    </div>
                    <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded">Connected</span>
                  </div>

                  {/* Holdings for this account */}
                  {brokerageHoldings.filter(h => h.accountId === acct.id).length > 0 && (
                    <div className="space-y-1">
                      {brokerageHoldings
                        .filter(h => h.accountId === acct.id)
                        .map((h, i) => (
                          <div key={i} className="flex items-center justify-between text-sm py-1.5 border-t border-[#1e293b]/50 first:border-t-0">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-mono text-xs">{h.ticker}</span>
                              <span className="text-gray-500 text-xs">{h.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-gray-400 text-xs">{h.units} shares</span>
                              <span className="text-white text-xs font-mono">
                                ${(h.units * h.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                              {h.openPnl !== 0 && (
                                <span className={`text-xs font-mono ${h.openPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {h.openPnl >= 0 ? '+' : ''}{h.openPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
          <p className="text-sm text-gray-400 mb-4">
            Export your holdings from Fidelity, Schwab, Robinhood, or Vanguard as a CSV file and upload it here.
            The raw file is processed in memory only and never saved.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-600 file:text-white hover:file:bg-green-500 file:cursor-pointer"
          />

          {importPreview && (
            <div className="mt-6 space-y-4">
              <p className="text-sm text-gray-300">
                Detected brokerage: <span className="text-green-400 font-medium capitalize">{importBrokerage}</span>
                {' | '}{importPreview.length} holdings found
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1e293b]">
                      <th className="text-left text-gray-500 py-2 px-2">Ticker</th>
                      <th className="text-left text-gray-500 py-2 px-2">Name</th>
                      <th className="text-right text-gray-500 py-2 px-2">Shares</th>
                      <th className="text-right text-gray-500 py-2 px-2">Cost Basis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importPreview.map((h, i) => (
                      <tr key={i} className="border-b border-[#1e293b]/50">
                        <td className="py-2 px-2 text-white font-mono">{h.ticker}</td>
                        <td className="py-2 px-2 text-gray-300">{h.name}</td>
                        <td className="text-right py-2 px-2 text-white">{h.shares}</td>
                        <td className="text-right py-2 px-2 text-gray-400">${h.costBasis.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleImportSave('taxable', 'Imported Account')}
                  className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Save as Taxable Account
                </button>
                <button
                  onClick={() => handleImportSave('401k', 'Imported 401(k)')}
                  className="border border-[#334155] hover:border-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Save as 401(k)
                </button>
                <button
                  onClick={() => handleImportSave('roth_ira', 'Imported Roth IRA')}
                  className="border border-[#334155] hover:border-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Save as Roth IRA
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Add Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 fade-in space-y-5">
          <h3 className="text-lg font-semibold text-white">Add Account Manually</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Account Type</label>
              <select
                value={form.accountType}
                onChange={(e) => setForm({ ...form, accountType: e.target.value })}
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500"
              >
                <option value="401k">401(k)</option>
                <option value="roth_ira">Roth IRA</option>
                <option value="taxable">Taxable Brokerage</option>
                <option value="hsa">HSA</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Account Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="My 401(k)"
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>
          </div>

          {/* Holdings */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm text-gray-400">Holdings</label>
              <button type="button" onClick={addHolding} className="text-xs text-green-400 hover:text-green-300">
                + Add Holding
              </button>
            </div>
            <div className="space-y-3">
              {form.holdings.map((h, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-3">
                    {i === 0 && <label className="block text-xs text-gray-500 mb-1">Ticker</label>}
                    <input
                      type="text"
                      value={h.ticker}
                      onChange={(e) => updateHolding(i, 'ticker', e.target.value.toUpperCase())}
                      placeholder="SPY"
                      required
                      className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-white text-sm font-mono placeholder-gray-500 focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <div className="col-span-3">
                    {i === 0 && <label className="block text-xs text-gray-500 mb-1">Name</label>}
                    <input
                      type="text"
                      value={h.name}
                      onChange={(e) => updateHolding(i, 'name', e.target.value)}
                      placeholder="S&P 500 ETF"
                      className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <div className="col-span-2">
                    {i === 0 && <label className="block text-xs text-gray-500 mb-1">Shares</label>}
                    <input
                      type="number"
                      value={h.shares || ''}
                      onChange={(e) => updateHolding(i, 'shares', parseFloat(e.target.value) || 0)}
                      placeholder="10"
                      step="any"
                      required
                      className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <div className="col-span-3">
                    {i === 0 && <label className="block text-xs text-gray-500 mb-1">Cost Basis ($)</label>}
                    <input
                      type="number"
                      value={h.costBasis || ''}
                      onChange={(e) => updateHolding(i, 'costBasis', parseFloat(e.target.value) || 0)}
                      placeholder="450.00"
                      step="any"
                      className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <div className="col-span-1">
                    {i > 0 && (
                      <button type="button" onClick={() => removeHolding(i)} className="text-red-400 hover:text-red-300 p-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
            >
              Save & Encrypt
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="border border-[#334155] hover:border-gray-500 text-gray-300 px-6 py-2.5 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
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
                    'bg-amber-500/15 text-amber-400'
                  }`}>
                    {acct.accountType === '401k' ? '401(k)' :
                     acct.accountType === 'roth_ira' ? 'Roth IRA' :
                     acct.accountType === 'taxable' ? 'Taxable' : acct.accountType}
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
          <p className="text-gray-400 mb-4">No accounts yet. Add your first investment account to get started.</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
          >
            Add Your First Account
          </button>
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
