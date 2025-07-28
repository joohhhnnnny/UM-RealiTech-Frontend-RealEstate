import { RiLineChartLine } from 'react-icons/ri';

function Analytics() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Business Analytics</h2>
      
      <div className="alert alert-info">
        <RiLineChartLine className="w-6 h-6" />
        <div>
          <h3 className="font-bold">Advanced Analytics Dashboard</h3>
          <div className="text-sm">Comprehensive business intelligence and market analysis tools.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-lg border border-base-200 p-6">
          <h3 className="text-lg font-bold mb-4">Revenue Trends</h3>
          <div className="h-64 bg-base-200 rounded-lg flex items-center justify-center">
            <span className="text-base-content/50">Revenue Chart Placeholder</span>
          </div>
        </div>
        <div className="card bg-base-100 shadow-lg border border-base-200 p-6">
          <h3 className="text-lg font-bold mb-4">Market Performance</h3>
          <div className="h-64 bg-base-200 rounded-lg flex items-center justify-center">
            <span className="text-base-content/50">Performance Chart Placeholder</span>
          </div>
        </div>
        <div className="card bg-base-100 shadow-lg border border-base-200 p-6">
          <h3 className="text-lg font-bold mb-4">Sales Velocity</h3>
          <div className="h-64 bg-base-200 rounded-lg flex items-center justify-center">
            <span className="text-base-content/50">Velocity Chart Placeholder</span>
          </div>
        </div>
        <div className="card bg-base-100 shadow-lg border border-base-200 p-6">
          <h3 className="text-lg font-bold mb-4">Buyer Journey Analytics</h3>
          <div className="h-64 bg-base-200 rounded-lg flex items-center justify-center">
            <span className="text-base-content/50">Journey Chart Placeholder</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;