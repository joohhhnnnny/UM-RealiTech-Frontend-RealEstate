import { useState } from 'react'; 
import { motion } from "framer-motion";
import { RiBarChartBoxLine } from 'react-icons/ri';

function Dashboard() {
  const [agentStats] = useState({
    totalClients: 24,
    activeLeads: 8,
    monthlyCommission: "₱485,000",
    conversionRate: "18%",
    avgDealSize: "₱6.2M",
    responseTime: "12 min"
  });

  const [recentActivities] = useState([
    {
      id: 1,
      type: "client_matched",
      message: "New client Michael Anderson matched with Viva Homes",
      time: "2 hours ago"
    },
    {
      id: 2,
      type: "document_submitted",
      message: "Sarah Martinez submitted financial documents",
      time: "4 hours ago"
    },
    {
      id: 3,
      type: "viewing_scheduled",
      message: "Property viewing scheduled with Roberto Cruz",
      time: "1 day ago"
    }
  ]);

  return (
    <div className="space-y-6">
      {/* Agent Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="stat bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-blue-500/20">
          <div className="stat-title text-blue-600/70">Total Clients</div>
          <div className="stat-value text-2xl text-blue-600">{agentStats.totalClients}</div>
          <div className="stat-desc text-blue-600/60">+3 this month</div>
        </div>
        <div className="stat bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-emerald-500/20">
          <div className="stat-title text-emerald-600/70">Active Leads</div>
          <div className="stat-value text-2xl text-emerald-600">{agentStats.activeLeads}</div>
          <div className="stat-desc text-emerald-600/60">High priority</div>
        </div>
        <div className="stat bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-purple-500/20">
          <div className="stat-title text-purple-600/70">Monthly Commission</div>
          <div className="stat-value text-xl text-purple-600">{agentStats.monthlyCommission}</div>
          <div className="stat-desc text-purple-600/60">+15% vs last month</div>
        </div>
        <div className="stat bg-gradient-to-br from-amber-500/10 to-amber-600/5 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-amber-500/20">
          <div className="stat-title text-amber-600/70">Conversion Rate</div>
          <div className="stat-value text-2xl text-amber-600">{agentStats.conversionRate}</div>
          <div className="stat-desc text-amber-600/60">Above average</div>
        </div>
        <div className="stat bg-gradient-to-br from-rose-500/10 to-rose-600/5 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-rose-500/20">
          <div className="stat-title text-rose-600/70">Avg Deal Size</div>
          <div className="stat-value text-xl text-rose-600">{agentStats.avgDealSize}</div>
          <div className="stat-desc text-rose-600/60">Premium segment</div>
        </div>
        <div className="stat bg-gradient-to-br from-teal-500/10 to-teal-600/5 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-teal-500/20">
          <div className="stat-title text-teal-600/70">Response Time</div>
          <div className="stat-value text-2xl text-teal-600">{agentStats.responseTime}</div>
          <div className="stat-desc text-teal-600/60">Excellent</div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="card bg-base-100 shadow-lg border border-base-200">
        <div className="card-body">
          <h3 className="text-xl font-bold mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 bg-base-50 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-base-content/60">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;