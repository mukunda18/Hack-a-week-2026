import { getGlobalStatsForToday } from '../lib/db';
import Map from './components/map/Map';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const stats = await getGlobalStatsForToday();

  const formatMoney = (amount) => {
    const num = parseFloat(amount) || 0;
    if (num >= 1000) {
      return `Rs ${(num / 1000).toFixed(1)}k`;
    }
    return `Rs ${Math.round(num)}`;
  };

  return (
    <main className="flex-1 relative bg-gray-50 flex flex-col">
      <div className="w-full h-[600px] relative z-0">
        <Map />

        <div className="absolute top-6 left-6 z-[400] bg-white/90 backdrop-blur rounded-xl shadow-xl p-6 max-w-md border border-gray-100 hidden md:block">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            GhusMeter
          </h1>
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
            Real-time visualization of delay and bribery incidents across Nepal.
            The <span className="text-red-600 font-bold">red circles</span> indicate severity based on report frequency, bribery amounts and delay.
          </p>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-red-50 p-2 rounded-lg border border-red-100 text-center">
              <div className="text-[10px] text-red-600 uppercase font-semibold mb-1">Reports Today</div>
              <div className="text-xl font-bold text-red-700">{stats.total_reports}</div>
            </div>
            <div className="bg-orange-50 p-2 rounded-lg border border-orange-100 text-center">
              <div className="text-[10px] text-orange-600 uppercase font-semibold mb-1">Avg Bribe</div>
              <div className="text-xl font-bold text-orange-700">{formatMoney(stats.avg_bribe)}</div>
            </div>
            <div className="bg-amber-50 p-2 rounded-lg border border-amber-100 text-center">
              <div className="text-[10px] text-amber-600 uppercase font-semibold mb-1">Avg Delay</div>
              <div className="text-xl font-bold text-amber-700">{Math.round(parseFloat(stats.avg_delay) || 0)} days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features / Info Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Report?</h2>
            <p className="text-gray-600">
              Your anonymous reports help visualize systemic issues, creating pressure for transparency and accountability in public services.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-2xl">
                🛡️
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">100% Anonymous</h3>
              <p className="text-gray-600 text-sm">
                We use advanced hashing to protect your identity. No personal data is stored, ensuring your safety while you speak up.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4 text-2xl">
                📍
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Location Mapping</h3>
              <p className="text-gray-600 text-sm">
                Visualizing corruption hotspots helps authorities and media identify which offices need immediate attention and reform.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 text-2xl">
                ⚡
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Real Impact</h3>
              <p className="text-gray-600 text-sm">
                Aggregated data powers reports and dashboards that hold public servants accountable for delays and bribery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
