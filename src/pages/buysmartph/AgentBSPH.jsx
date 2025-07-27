import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  RiUserStarLine, 
  RiTeamLine, 
  RiBarChartBoxLine,
  RiNotificationLine,
  RiMessageLine,
  RiCalendarLine,
  RiMapPinLine,
  RiPhoneLine,
  RiMailLine,
  RiCheckboxCircleLine,
  RiCalculatorLine,
  RiFileTextLine
} from 'react-icons/ri';
import listingsData from '../../listings.json';

function AgentBSPH() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clientRequests, setClientRequests] = useState([
    {
      id: 1,
      name: "Michael Anderson",
      type: "First Time Buyer",
      budget: "₱3M - ₱5M",
      location: "Quezon City",
      status: "Profile Complete",
      match: "85%",
      lastActive: "2 hours ago",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael&backgroundColor=b6e3f4"
    },
    {
      id: 2,
      name: "Sarah Martinez",
      type: "OFW",
      budget: "₱5M - ₱10M",
      location: "Makati City",
      status: "Document Review",
      match: "92%",
      lastActive: "1 day ago",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=c8f7d4"
    },
    {
      id: 3,
      name: "Roberto Cruz",
      type: "Investor",
      budget: "₱10M+",
      location: "BGC",
      status: "Viewing Scheduled",
      match: "78%",
      lastActive: "3 hours ago",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto&backgroundColor=ffd93d"
    }
  ]);

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

  const tabContent = {
    dashboard: (
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
    ),
    clients: (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Client Management</h2>
          <div className="flex gap-2">
            <button className="btn btn-outline btn-sm">Filter</button>
            <button className="btn btn-primary btn-sm">Add New Client</button>
          </div>
        </div>

        {/* Client Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientRequests.map((client) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card bg-base-100 shadow-lg border border-base-200 hover:shadow-xl transition-all duration-300"
            >
              <div className="card-body p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-12 rounded-full">
                        <img src={client.avatar} alt={client.name} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{client.name}</h3>
                      <p className="text-sm text-base-content/70">{client.type}</p>
                    </div>
                  </div>
                  <div className="badge badge-success">
                    {client.match} Match
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-base-content/70">Budget:</span>
                    <span className="font-medium">{client.budget}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-base-content/70">Location:</span>
                    <span className="font-medium">{client.location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-base-content/70">Status:</span>
                    <span className="badge badge-outline badge-sm">{client.status}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="btn btn-primary btn-sm flex-1">
                    <RiMessageLine className="w-4 h-4" />
                    Message
                  </button>
                  <button className="btn btn-outline btn-sm">
                    <RiPhoneLine className="w-4 h-4" />
                  </button>
                  <button className="btn btn-outline btn-sm">
                    <RiMailLine className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-base-content/60 mt-2">
                  Last active: {client.lastActive}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    ),
    analytics: (
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
    ),
    tools: (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Agent Tools</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card bg-gradient-to-br from-blue-500/10 to-blue-600/5 shadow-lg border border-blue-500/20">
            <div className="card-body">
              <RiCalculatorLine className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-bold text-blue-600">Client Loan Calculator</h3>
              <p className="text-sm text-base-content/70 mb-4">Help clients calculate mortgage payments and affordability</p>
              <button className="btn btn-outline btn-blue btn-sm">Open Tool</button>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 shadow-lg border border-emerald-500/20">
            <div className="card-body">
              <RiFileTextLine className="w-8 h-8 text-emerald-600 mb-4" />
              <h3 className="text-lg font-bold text-emerald-600">Document Tracker</h3>
              <p className="text-sm text-base-content/70 mb-4">Track client document submission progress</p>
              <button className="btn btn-outline btn-emerald btn-sm">Open Tool</button>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500/10 to-purple-600/5 shadow-lg border border-purple-500/20">
            <div className="card-body">
              <RiCalendarLine className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="text-lg font-bold text-purple-600">Appointment Scheduler</h3>
              <p className="text-sm text-base-content/70 mb-4">Schedule property viewings and client meetings</p>
              <button className="btn btn-outline btn-purple btn-sm">Open Tool</button>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-amber-500/10 to-amber-600/5 shadow-lg border border-amber-500/20">
            <div className="card-body">
              <RiNotificationLine className="w-8 h-8 text-amber-600 mb-4" />
              <h3 className="text-lg font-bold text-amber-600">Client Notifications</h3>
              <p className="text-sm text-base-content/70 mb-4">Send automated updates to clients</p>
              <button className="btn btn-outline btn-amber btn-sm">Open Tool</button>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-rose-500/10 to-rose-600/5 shadow-lg border border-rose-500/20">
            <div className="card-body">
              <RiTeamLine className="w-8 h-8 text-rose-600 mb-4" />
              <h3 className="text-lg font-bold text-rose-600">Lead Management</h3>
              <p className="text-sm text-base-content/70 mb-4">Organize and prioritize client leads</p>
              <button className="btn btn-outline btn-rose btn-sm">Open Tool</button>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-teal-500/10 to-teal-600/5 shadow-lg border border-teal-500/20">
            <div className="card-body">
              <RiBarChartBoxLine className="w-8 h-8 text-teal-600 mb-4" />
              <h3 className="text-lg font-bold text-teal-600">Market Analytics</h3>
              <p className="text-sm text-base-content/70 mb-4">Access market trends and pricing data</p>
              <button className="btn btn-outline btn-teal btn-sm">Open Tool</button>
            </div>
          </div>
        </div>
      </div>
    )
  };

  return (
    <div className="space-y-8">
      {/* Agent Navigation Tabs */}
      <div className="tabs tabs-boxed bg-base-200 p-1">
        <a 
          className={`tab ${activeTab === 'dashboard' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <RiBarChartBoxLine className="w-4 h-4 mr-2" />
          Dashboard
        </a>
        <a 
          className={`tab ${activeTab === 'clients' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('clients')}
        >
          <RiTeamLine className="w-4 h-4 mr-2" />
          Clients
        </a>
        <a 
          className={`tab ${activeTab === 'analytics' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <RiBarChartBoxLine className="w-4 h-4 mr-2" />
          Analytics
        </a>
        <a 
          className={`tab ${activeTab === 'tools' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('tools')}
        >
          <RiUserStarLine className="w-4 h-4 mr-2" />
          Tools
        </a>
      </div>

      {/* Dynamic Content */}
      <motion.div 
        key={activeTab}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {tabContent[activeTab]}
      </motion.div>
    </div>
  );
}

export default AgentBSPH;