import Link from 'next/link';

export default function DashboardRedirect() {
  return (
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold text-white mb-4">Portfolio Overview</h1>
      <p className="text-gray-400 mb-8">Choose a mode to dive into your portfolio analytics</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href="/investing" className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-medium transition-colors">
          Long-Term Investing
        </Link>
        <Link href="/day-trading" className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-xl font-medium transition-colors">
          Day Trading Signals
        </Link>
        <Link href="/retirement" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-colors">
          Retirement Planning
        </Link>
      </div>
    </div>
  );
}
