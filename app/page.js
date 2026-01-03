import { getGlobalStatsForToday } from '../lib/db';
import Map from './components/map/Map';
import StatsCard from './components/common/StatsCard';
import FeatureCard from './components/common/FeatureCard';

export const revalidate = 60;

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
            <StatsCard
              title="Reports Today"
              value={stats.total_reports}
              color="red"
            />
            <StatsCard
              title="Avg Bribe"
              value={formatMoney(stats.avg_bribe)}
              color="orange"
            />
            <StatsCard
              title="Avg Delay"
              value={`${Math.round(parseFloat(stats.avg_delay) || 0)} days`}
              color="amber"
            />
          </div>
        </div>
      </div>

      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Report?</h2>
            <p className="text-gray-600">
              Your anonymous reports help visualize systemic issues, creating pressure for transparency and accountability in public services.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🛡️"
              title="100% Anonymous"
              description="We use advanced hashing to protect your identity. No personal data is stored, ensuring your safety while you speak up."
            />
            <FeatureCard
              icon="📍"
              title="Location Mapping"
              description="Visualizing corruption hotspots helps authorities and media identify which offices need immediate attention and reform."
            />
            <FeatureCard
              icon="⚡"
              title="Real Impact"
              description="Aggregated data powers reports and dashboards that hold public servants accountable for delays and bribery."
            />
          </div>
        </div>
      </div>
    </main>
  );
}
