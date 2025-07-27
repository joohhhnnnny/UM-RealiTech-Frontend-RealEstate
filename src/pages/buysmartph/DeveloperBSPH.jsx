import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  RiBuildingLine, 
  RiGroupLine, 
  RiBarChartBoxLine,
  RiSettings4Line,
  RiEyeLine,
  RiLineChartLine,
  RiMapPinLine,
} from 'react-icons/ri';

function DeveloperBSPH() {
  const [activeTab, setActiveTab] = useState('overview');
  
  const [projectStats] = useState({
    totalProjects: 12,
    activeProjects: 4,
    totalUnits: 2847,
    soldUnits: 1923,
    totalRevenue: "₱18.5B",
    averagePrice: "₱6.5M"
  });

  const [projects] = useState([
    {
      id: 1,
      name: "Viva Homes Townhouse",
      location: "Quezon City",
      totalUnits: 48,
      soldUnits: 32,
      avgPrice: "₱2.8M",
      status: "Active",
      completion: 75,
      launchDate: "2024-01-15",
      completionDate: "2025-06-30",
      image: "https://via.placeholder.com/300x200?text=Viva+Homes"
    },
    {
      id: 2,
      name: "Metro Heights Condominium",
      location: "Makati City",
      totalUnits: 156,
      soldUnits: 98,
      avgPrice: "₱8.2M",
      status: "Active",
      completion: 45,
      launchDate: "2024-03-01",
      completionDate: "2026-12-15",
      image: "https://via.placeholder.com/300x200?text=Metro+Heights"
    },
    {
      id: 3,
      name: "Garden Residences",
      location: "BGC, Taguig",
      totalUnits: 84,
      soldUnits: 67,
      avgPrice: "₱12.5M",
      status: "Pre-selling",
      completion: 20,
      launchDate: "2024-06-01",
      completionDate: "2027-03-30",
      image: "https://via.placeholder.com/300x200?text=Garden+Residences"
    }
  ]);

  const [buyerInsights] = useState([
    {
      segment: "First Time Buyers",
      percentage: 45,
      avgBudget: "₱3.2M",
      topLocation: "Quezon City",
      color: "text-blue-600",
      bgColor: "from-blue-500/10 to-blue-600/5",
      borderColor: "border-blue-500/20"
    },
    {
      segment: "OFW Buyers",
      percentage: 28,
      avgBudget: "₱5.8M",
      topLocation: "Makati City",
      color: "text-emerald-600",
      bgColor: "from-emerald-500/10 to-emerald-600/5",
      borderColor: "border-emerald-500/20"
    },
    {
      segment: "Investors",
      percentage: 18,
      avgBudget: "₱8.5M",
      topLocation: "BGC",
      color: "text-purple-600",
      bgColor: "from-purple-500/10 to-purple-600/5",
      borderColor: "border-purple-500/20"
    },
    {
      segment: "Upgraders",
      percentage: 9,
      avgBudget: "₱12.3M",
      topLocation: "Ortigas",
      color: "text-amber-600",
      bgColor: "from-amber-500/10 to-amber-600/5",
      borderColor: "border-amber-500/20"
    }
  ]);

  const tabContent = {
    overview: (
      <div className="space-y-6">
        {/* Developer Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="stat bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-blue-500/20">
            <div className="stat-title text-blue-600/70">Total Projects</div>
            <div className="stat-value text-2xl text-blue-600">{projectStats.totalProjects}</div>
            <div className="stat-desc text-blue-600/60">All time</div>
          </div>
          <div className="stat bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-emerald-500/20">
            <div className="stat-title text-emerald-600/70">Active Projects</div>
            <div className="stat-value text-2xl text-emerald-600">{projectStats.activeProjects}</div>
            <div className="stat-desc text-emerald-600/60">In development</div>
          </div>
          <div className="stat bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-purple-500/20">
            <div className="stat-title text-purple-600/70">Total Units</div>
            <div className="stat-value text-2xl text-purple-600">{projectStats.totalUnits.toLocaleString()}</div>
            <div className="stat-desc text-purple-600/60">All projects</div>
          </div>
          <div className="stat bg-gradient-to-br from-amber-500/10 to-amber-600/5 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-amber-500/20">
            <div className="stat-title text-amber-600/70">Units Sold</div>
            <div className="stat-value text-2xl text-amber-600">{projectStats.soldUnits.toLocaleString()}</div>
            <div className="stat-desc text-amber-600/60">{Math.round((projectStats.soldUnits/projectStats.totalUnits)*100)}% sold</div>
          </div>
          <div className="stat bg-gradient-to-br from-rose-500/10 to-rose-600/5 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-rose-500/20">
            <div className="stat-title text-rose-600/70">Total Revenue</div>
            <div className="stat-value text-xl text-rose-600">{projectStats.totalRevenue}</div>
            <div className="stat-desc text-rose-600/60">Gross sales</div>
          </div>
          <div className="stat bg-gradient-to-br from-teal-500/10 to-teal-600/5 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-teal-500/20">
            <div className="stat-title text-teal-600/70">Avg Unit Price</div>
            <div className="stat-value text-xl text-teal-600">{projectStats.averagePrice}</div>
            <div className="stat-desc text-teal-600/60">Market rate</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="btn btn-primary gap-2 h-16">
            <RiBuildingLine className="w-5 h-5" />
            <div className="text-left">
              <div className="font-semibold">New Project</div>
              <div className="text-xs opacity-70">Create project</div>
            </div>
          </button>
          <button className="btn btn-outline gap-2 h-16">
            <RiBarChartBoxLine className="w-5 h-5" />
            <div className="text-left">
              <div className="font-semibold">Sales Report</div>
              <div className="text-xs opacity-70">View analytics</div>
            </div>
          </button>
          <button className="btn btn-outline gap-2 h-16">
            <RiGroupLine className="w-5 h-5" />
            <div className="text-left">
              <div className="font-semibold">Buyer Insights</div>
              <div className="text-xs opacity-70">Market analysis</div>
            </div>
          </button>
          <button className="btn btn-outline gap-2 h-16">
            <RiSettings4Line className="w-5 h-5" />
            <div className="text-left">
              <div className="font-semibold">Project Settings</div>
              <div className="text-xs opacity-70">Manage projects</div>
            </div>
          </button>
        </div>

        {/* Recent Project Activities */}
        <div className="card bg-base-100 shadow-lg border border-base-200">
          <div className="card-body">
            <h3 className="text-xl font-bold mb-4">Recent Activities</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-success/5 rounded-lg border border-success/20">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">3 new buyers matched with Viva Homes Townhouse</p>
                  <p className="text-xs text-base-content/60">2 hours ago</p>
                </div>
                <div className="badge badge-success">+3</div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-blue/5 rounded-lg border border-blue/20">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">Metro Heights construction milestone reached</p>
                  <p className="text-xs text-base-content/60">1 day ago</p>
                </div>
                <div className="badge badge-info">45%</div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-warning/5 rounded-lg border border-warning/20">
                <div className="w-2 h-2 bg-warning rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">Garden Residences pre-selling launched</p>
                  <p className="text-xs text-base-content/60">3 days ago</p>
                </div>
                <div className="badge badge-warning">New</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    projects: (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Project Portfolio</h2>
          <div className="flex gap-2">
            <button className="btn btn-outline btn-sm">Filter</button>
            <button className="btn btn-primary btn-sm">
              <RiBuildingLine className="w-4 h-4 mr-2" />
              New Project
            </button>
          </div>
        </div>

        {/* Project Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card bg-base-100 shadow-lg border border-base-200 hover:shadow-xl transition-all duration-300"
            >
              <figure className="h-48 overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.name}
                  className="w-full h-full object-cover"
                />
              </figure>
              <div className="card-body p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{project.name}</h3>
                    <p className="text-sm text-base-content/70 flex items-center gap-1">
                      <RiMapPinLine className="w-4 h-4" />
                      {project.location}
                    </p>
                  </div>
                  <div className={`badge ${project.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                    {project.status}
                  </div>
                </div>

                {/* Project Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-base-200/50 rounded-lg">
                    <div className="text-lg font-bold">{project.totalUnits}</div>
                    <div className="text-xs text-base-content/70">Total Units</div>
                  </div>
                  <div className="text-center p-3 bg-base-200/50 rounded-lg">
                    <div className="text-lg font-bold">{project.soldUnits}</div>
                    <div className="text-xs text-base-content/70">Units Sold</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Construction Progress</span>
                    <span>{project.completion}%</span>
                  </div>
                  <div className="w-full h-2 bg-base-200 rounded-full">
                    <div 
                      className="h-2 bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${project.completion}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Avg Price:</span>
                    <span className="font-medium">{project.avgPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Sales Rate:</span>
                    <span className="font-medium">{Math.round((project.soldUnits/project.totalUnits)*100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Completion:</span>
                    <span className="font-medium">{project.completionDate}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button className="btn btn-primary btn-sm flex-1">
                    <RiEyeLine className="w-4 h-4" />
                    View Details
                  </button>
                  <button className="btn btn-outline btn-sm">
                    <RiSettings4Line className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    ),
    buyers: (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Buyer Insights & Analytics</h2>
        
        {/* Buyer Segments */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {buyerInsights.map((insight, index) => (
            <motion.div
              key={insight.segment}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`card bg-gradient-to-br ${insight.bgColor} shadow-lg border ${insight.borderColor}`}
            >
              <div className="card-body p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-bold ${insight.color}`}>{insight.segment}</h3>
                  <div className={`text-2xl font-bold ${insight.color}`}>{insight.percentage}%</div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Avg Budget:</span>
                    <span className="font-medium">{insight.avgBudget}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-base-content/70">Top Location:</span>
                    <span className="font-medium">{insight.topLocation}</span>
                  </div>
                </div>

                {/* Progress bar showing segment percentage */}
                <div className="mt-4">
                  <div className="w-full h-2 bg-base-200/50 rounded-full">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${insight.color.replace('text-', 'bg-')}`}
                      style={{ width: `${insight.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card bg-base-100 shadow-lg border border-base-200 p-6">
            <h3 className="text-lg font-bold mb-4">Buyer Preferences Trend</h3>
            <div className="h-64 bg-base-200 rounded-lg flex items-center justify-center">
              <span className="text-base-content/50">Chart: Buyer Preferences Over Time</span>
            </div>
          </div>
          <div className="card bg-base-100 shadow-lg border border-base-200 p-6">
            <h3 className="text-lg font-bold mb-4">Price Sensitivity Analysis</h3>
            <div className="h-64 bg-base-200 rounded-lg flex items-center justify-center">
              <span className="text-base-content/50">Chart: Price vs Demand Correlation</span>
            </div>
          </div>
        </div>
      </div>
    ),
    analytics: (
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
    )
  };

  return (
    <div className="space-y-8">
      {/* Developer Navigation Tabs */}
      <div className="tabs tabs-boxed bg-base-200 p-1">
        <a 
          className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <RiBarChartBoxLine className="w-4 h-4 mr-2" />
          Overview
        </a>
        <a 
          className={`tab ${activeTab === 'projects' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          <RiBuildingLine className="w-4 h-4 mr-2" />
          Projects
        </a>
        <a 
          className={`tab ${activeTab === 'buyers' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('buyers')}
        >
          <RiGroupLine className="w-4 h-4 mr-2" />
          Buyer Insights
        </a>
        <a 
          className={`tab ${activeTab === 'analytics' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <RiLineChartLine className="w-4 h-4 mr-2" />
          Analytics
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

export default DeveloperBSPH;