'use client';

import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';

export default function RetirementPage() {
  const [age, setAge] = useState(28);
  const [retirementAge, setRetirementAge] = useState(60);
  const [currentSavings, setCurrentSavings] = useState(63050);
  const [monthlyContribution, setMonthlyContribution] = useState(1500);
  const [expectedReturn, setExpectedReturn] = useState(9);

  // Calculate projections
  const yearsToRetirement = retirementAge - age;
  const monthlyReturn = expectedReturn / 100 / 12;
  const totalMonths = yearsToRetirement * 12;

  let projectedValue = currentSavings;
  const yearlySnapshots: { year: number; age: number; value: number }[] = [];

  for (let month = 1; month <= totalMonths; month++) {
    projectedValue = projectedValue * (1 + monthlyReturn) + monthlyContribution;
    if (month % 12 === 0) {
      yearlySnapshots.push({
        year: month / 12,
        age: age + month / 12,
        value: projectedValue,
      });
    }
  }

  const monthlyRetirementIncome4Pct = (projectedValue * 0.04) / 12;
  const monthlyRetirementIncome3_5Pct = (projectedValue * 0.035) / 12;
  const totalContributed = currentSavings + monthlyContribution * totalMonths;
  const totalGrowth = projectedValue - totalContributed;

  // Max bar value for chart
  const maxValue = yearlySnapshots.length > 0 ? yearlySnapshots[yearlySnapshots.length - 1].value : currentSavings;

  // Account breakdown
  const accounts = [
    {
      name: '401(k)',
      balance: 47250,
      annualLimit: 23500,
      contributed2024: 8500,
      holding: 'FXAIX (S&P 500)',
      taxType: 'Pre-tax (tax-deferred)',
      note: 'Contributions reduce your taxable income now. You pay taxes when you withdraw in retirement.',
    },
    {
      name: 'Roth IRA',
      balance: 15800,
      annualLimit: 7000,
      contributed2024: 3500,
      holding: 'QQQM (Nasdaq 100)',
      taxType: 'After-tax (tax-free growth)',
      note: 'You already paid taxes on this money. All growth and withdrawals in retirement are 100% tax-free.',
    },
  ];

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Retirement Planning</h1>
        <p className="text-gray-400 mt-1">Track your retirement accounts, contributions, and projections</p>
      </div>

      {/* Account Overview */}
      <div className="grid md:grid-cols-2 gap-4">
        {accounts.map((acct) => (
          <div key={acct.name} className="bg-[#111827] border border-[#1e293b] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{acct.name}</h3>
              <span className={`text-xs px-2 py-1 rounded ${
                acct.name === '401(k)' ? 'bg-blue-500/15 text-blue-400' : 'bg-purple-500/15 text-purple-400'
              }`}>
                {acct.taxType}
              </span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{formatCurrency(acct.balance)}</p>
            <p className="text-sm text-gray-400 mb-4">Holding: {acct.holding}</p>

            {/* Contribution Progress */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-400">2026 Contributions</span>
                <span className="text-gray-300">
                  {formatCurrency(acct.contributed2024)} / {formatCurrency(acct.annualLimit)}
                </span>
              </div>
              <div className="w-full bg-[#1e293b] rounded-full h-2.5">
                <div
                  className={`rounded-full h-2.5 transition-all ${
                    acct.name === '401(k)' ? 'bg-blue-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${(acct.contributed2024 / acct.annualLimit) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(acct.annualLimit - acct.contributed2024)} remaining this year
              </p>
            </div>

            <div className="p-3 bg-[#1e293b] rounded-lg">
              <p className="text-xs text-gray-400">{acct.note}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Projection Calculator */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Retirement Projection Calculator</h3>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Current Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Target Retirement Age</label>
              <input
                type="number"
                value={retirementAge}
                onChange={(e) => setRetirementAge(Number(e.target.value))}
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Current Total Savings</label>
              <input
                type="number"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(Number(e.target.value))}
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Monthly Contribution</label>
              <input
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Expected Annual Return (%)</label>
              <input
                type="number"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(Number(e.target.value))}
                step={0.5}
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                S&P 500 historical average: ~10%. Conservative estimate: 7%. Your current portfolio: ~9%.
              </p>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-green-500/10 to-cyan-500/10 border border-green-500/20 rounded-xl p-6">
              <p className="text-sm text-gray-400 mb-1">Projected Value at Retirement</p>
              <p className="text-4xl font-bold text-green-400">{formatCurrency(projectedValue)}</p>
              <p className="text-sm text-gray-400 mt-2">In {yearsToRetirement} years (age {retirementAge})</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1e293b] rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Monthly Income (4% Rule)</p>
                <p className="text-xl font-bold text-white">{formatCurrency(monthlyRetirementIncome4Pct)}</p>
                <p className="text-xs text-gray-500 mt-1">per month in retirement</p>
              </div>
              <div className="bg-[#1e293b] rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Monthly Income (3.5% Safe)</p>
                <p className="text-xl font-bold text-white">{formatCurrency(monthlyRetirementIncome3_5Pct)}</p>
                <p className="text-xs text-gray-500 mt-1">per month in retirement</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1e293b] rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Total You Contribute</p>
                <p className="text-lg font-bold text-white">{formatCurrency(totalContributed)}</p>
              </div>
              <div className="bg-[#1e293b] rounded-lg p-4">
                <p className="text-xs text-gray-400 mb-1">Total Growth (Compound Interest)</p>
                <p className="text-lg font-bold text-green-400">{formatCurrency(totalGrowth)}</p>
              </div>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-xs text-blue-300">
                The 4% rule says you can withdraw 4% of your portfolio per year in retirement and likely never run out of money over a 30-year retirement. 3.5% is even more conservative and safer.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Chart (Bar Chart) */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Projected Growth Over Time</h3>
        <div className="space-y-2">
          {yearlySnapshots
            .filter((_, i) => i % Math.max(1, Math.floor(yearlySnapshots.length / 15)) === 0 || i === yearlySnapshots.length - 1)
            .map((snap) => (
              <div key={snap.year} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-16 text-right">Age {snap.age}</span>
                <div className="flex-1 bg-[#1e293b] rounded-full h-6 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-600 to-cyan-600 rounded-full h-6 transition-all flex items-center justify-end pr-2"
                    style={{ width: `${Math.max(5, (snap.value / maxValue) * 100)}%` }}
                  >
                    <span className="text-[10px] text-white font-medium whitespace-nowrap">
                      {formatCurrency(snap.value)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Glide Path Recommendation */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Age-Based Allocation Recommendation</h3>
        <p className="text-sm text-gray-400 mb-4">
          A common rule of thumb is to hold your age in bonds and the rest in stocks. Here is what that looks like for you:
        </p>
        <div className="space-y-4">
          {[
            { ageLabel: `Now (Age ${age})`, stocks: 100 - age, bonds: age },
            { ageLabel: `Age ${age + 10}`, stocks: 100 - (age + 10), bonds: age + 10 },
            { ageLabel: `Age ${age + 20}`, stocks: 100 - (age + 20), bonds: age + 20 },
            { ageLabel: `Retirement (Age ${retirementAge})`, stocks: 100 - retirementAge, bonds: retirementAge },
          ].map((phase) => (
            <div key={phase.ageLabel}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-300">{phase.ageLabel}</span>
                <span className="text-gray-400">{phase.stocks}% Stocks / {phase.bonds}% Bonds</span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden">
                <div className="bg-green-500" style={{ width: `${phase.stocks}%` }} />
                <div className="bg-blue-500" style={{ width: `${phase.bonds}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-xs text-amber-300">
            Note: You are currently 100% in stocks across all accounts with no bond allocation. At age {age}, this is aggressive but acceptable if you can handle the volatility. As you get closer to retirement, consider gradually adding bonds.
          </p>
        </div>
      </div>

      {/* 401k vs Roth IRA comparison */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">401(k) vs Roth IRA: Which to Prioritize?</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e293b]">
                <th className="text-left text-gray-500 py-2 px-3">Feature</th>
                <th className="text-center text-blue-400 py-2 px-3">401(k)</th>
                <th className="text-center text-purple-400 py-2 px-3">Roth IRA</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-[#1e293b]/50">
                <td className="py-2 px-3 text-gray-400">Tax benefit</td>
                <td className="text-center py-2 px-3">Tax break now</td>
                <td className="text-center py-2 px-3">Tax-free later</td>
              </tr>
              <tr className="border-b border-[#1e293b]/50">
                <td className="py-2 px-3 text-gray-400">2026 Limit</td>
                <td className="text-center py-2 px-3">$23,500</td>
                <td className="text-center py-2 px-3">$7,000</td>
              </tr>
              <tr className="border-b border-[#1e293b]/50">
                <td className="py-2 px-3 text-gray-400">Employer match</td>
                <td className="text-center py-2 px-3 text-green-400">Yes (free money)</td>
                <td className="text-center py-2 px-3 text-gray-500">No</td>
              </tr>
              <tr className="border-b border-[#1e293b]/50">
                <td className="py-2 px-3 text-gray-400">Withdraw early?</td>
                <td className="text-center py-2 px-3 text-red-400">10% penalty</td>
                <td className="text-center py-2 px-3 text-green-400">Contributions anytime</td>
              </tr>
              <tr className="border-b border-[#1e293b]/50">
                <td className="py-2 px-3 text-gray-400">Tax in retirement</td>
                <td className="text-center py-2 px-3 text-red-400">Pay full income tax</td>
                <td className="text-center py-2 px-3 text-green-400">$0 tax</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-gray-400">Best if you think</td>
                <td className="text-center py-2 px-3">Tax rate lower later</td>
                <td className="text-center py-2 px-3">Tax rate higher later</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-xs text-green-300">
            Best strategy: First, contribute enough to your 401k to get the full employer match (that is free money). Then max out your Roth IRA ($7,000). Then go back and contribute more to your 401k if you can.
          </p>
        </div>
      </div>

      <div className="text-center py-4">
        <p className="text-xs text-gray-600">
          Projections are estimates based on consistent returns. Actual results will vary. Not financial advice.
        </p>
      </div>
    </div>
  );
}
