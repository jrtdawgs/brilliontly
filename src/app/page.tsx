import Link from 'next/link';
import { BrilliontlyLogo, BrilliontlyWordmark } from '@/components/ui/BrilliontlyLogo';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-4 border-b border-[#1e293b]">
        <BrilliontlyWordmark />
        <div className="flex items-center gap-6">
          <Link href="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">
            Contact
          </Link>
          <Link
            href="/investing"
            className="bg-green-600 hover:bg-green-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Launch App
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-3 pb-8 text-center">
        {/* Logo */}
        <div className="mb-3 flex flex-col items-center">
          <BrilliontlyLogo size={72} />
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent mt-2">
            Brilliontly
          </h1>
        </div>
        <p className="text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto mb-6 leading-relaxed">
          Brilliantly make millions with Brilliontly.{' '}
          <span className="text-gray-400">
            RSI signals. Capitulation detection. VIX tracking. Drawdown analysis.
            The same metrics the pros use.
          </span>
        </p>
        <div className="flex items-center justify-center gap-5">
          <Link
            href="/investing"
            className="bg-green-600 hover:bg-green-500 text-white px-10 py-4 rounded-xl text-lg font-semibold transition-colors shadow-lg shadow-green-600/25"
          >
            Get Started Free
          </Link>
          <Link
            href="/day-trading"
            className="border border-[#334155] hover:border-gray-500 text-white px-10 py-4 rounded-xl text-lg font-medium transition-colors"
          >
            View Signals
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Three Modes. One Platform.
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/investing" className="group">
            <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-8 h-full hover:border-green-500/50 transition-all group-hover:shadow-lg group-hover:shadow-green-500/5">
              <div className="w-12 h-12 bg-green-500/15 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13l4-4 4 4 4-8 4 4" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Long-Term Investing</h3>
              <p className="text-gray-400 text-base leading-relaxed">
                Portfolio analytics, Sharpe ratio, alpha, beta, correlation matrix, rebalancing signals, and capitulation buy alerts.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['Sharpe Ratio', 'Max Drawdown', 'Correlation', 'RSI Signals'].map((tag) => (
                  <span key={tag} className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded">{tag}</span>
                ))}
              </div>
            </div>
          </Link>

          <Link href="/day-trading" className="group">
            <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-8 h-full hover:border-amber-500/50 transition-all group-hover:shadow-lg group-hover:shadow-amber-500/5">
              <div className="w-12 h-12 bg-amber-500/15 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h7l-2 8 10-12h-7l2-8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Day Trading</h3>
              <p className="text-gray-400 text-base leading-relaxed">
                Real-time RSI, volume spikes, moving average crossovers, VIX fear signals, and capitulation detection.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['RSI', 'Volume Spikes', 'VIX Alerts', 'MA Crossovers'].map((tag) => (
                  <span key={tag} className="text-xs bg-amber-500/10 text-amber-400 px-2 py-1 rounded">{tag}</span>
                ))}
              </div>
            </div>
          </Link>

          <Link href="/retirement" className="group">
            <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-8 h-full hover:border-blue-500/50 transition-all group-hover:shadow-lg group-hover:shadow-blue-500/5">
              <div className="w-12 h-12 bg-blue-500/15 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Retirement Planning</h3>
              <p className="text-gray-400 text-base leading-relaxed">
                Projection calculators, contribution tracking, 401k vs Roth analysis, safe withdrawal rates, and glide path recommendations.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['Projections', '401k Tracking', 'Roth IRA', '4% Rule'].map((tag) => (
                  <span key={tag} className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded">{tag}</span>
                ))}
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Metrics Showcase */}
      <section className="max-w-6xl mx-auto px-6 py-12 border-t border-[#1e293b]">
        <h2 className="text-4xl font-bold text-white text-center mb-4">
          Advanced Metrics Made Simple
        </h2>
        <p className="text-gray-400 text-center text-lg max-w-xl mx-auto mb-12">
          Every metric comes with a plain English explanation. No finance degree required.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Sharpe Ratio', value: '1.42', color: 'text-green-400' },
            { label: 'RSI', value: '34.2', color: 'text-amber-400' },
            { label: 'Max Drawdown', value: '-12.3%', color: 'text-amber-400' },
            { label: 'Beta', value: '1.18', color: 'text-blue-400' },
            { label: 'Alpha', value: '+3.2%', color: 'text-green-400' },
            { label: 'VIX', value: '18.5', color: 'text-cyan-400' },
            { label: 'Volatility', value: '16.8%', color: 'text-amber-400' },
            { label: 'Sortino', value: '1.87', color: 'text-green-400' },
          ].map((m) => (
            <div key={m.label} className="bg-[#111827] border border-[#1e293b] rounded-xl p-5 text-center">
              <div className="text-sm text-gray-500 mb-1">{m.label}</div>
              <div className={`text-3xl font-bold ${m.color}`}>{m.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Assets Tracked */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-[#1e293b]">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          Signals for Every Asset Class
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            'SPY', 'QQQ', 'NVDA', 'AAPL', 'MSFT', 'TSLA', 'GOOG', 'AMZN', 'META',
            'SOXL', 'TQQQ', 'BITX', 'ETHU',
            'BTC', 'ETH',
            'GLD', 'SLV',
            'VIX', 'TLT', 'DXY',
            'VOO', 'VTI', 'SCHD', 'IWM',
          ].map((ticker) => (
            <span
              key={ticker}
              className="text-xs bg-[#111827] border border-[#1e293b] text-gray-300 px-3 py-1.5 rounded-lg font-mono"
            >
              {ticker}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Stop Investing Blind</h2>
        <p className="text-gray-400 mb-8">
          Get the analytics edge that institutional investors have always had. Completely free.
        </p>
        <Link
          href="/investing"
          className="inline-block bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500 text-white px-10 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg"
        >
          Launch Brilliontly
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e293b] px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-gray-500">Brilliontly - For informational purposes only. Not financial advice.</span>
          <div className="flex items-center gap-6">
            <Link href="/contact" className="text-sm text-gray-500 hover:text-white transition-colors">Contact</Link>
            <span className="text-sm text-gray-600">Built by Joshua Torres</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
