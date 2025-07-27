import { RiBarChartBoxLine } from 'react-icons/ri';

function Analytics() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Performance Analytics</h2>
      
      <div className="alert alert-info">
        <RiBarChartBoxLine className="w-6 h-6" />
        <div>
          <h3 className="font-bold">Analytics Dashboard</h3>
          <div className="text-sm">Detailed performance metrics and client insights coming soon.</div>
        </div>
      </div>

      {/* Placeholder charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-lg border border-base-200 p-6">
          <h3 className="text-lg font-bold mb-4">Monthly Performance</h3>
          <div className="h-64 bg-base-200 rounded-lg flex items-center justify-center">
            <span className="text-base-content/50">Chart Placeholder</span>
          </div>
        </div>
        <div className="card bg-base-100 shadow-lg border border-base-200 p-6">
          <h3 className="text-lg font-bold mb-4">Client Conversion Funnel</h3>
          <div className="h-64 bg-base-200 rounded-lg flex items-center justify-center">
            <span className="text-base-content/50">Chart Placeholder</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;