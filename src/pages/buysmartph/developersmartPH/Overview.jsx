import { 
  RiBuildingLine, 
  RiGroupLine, 
  RiBarChartBoxLine,
  RiSettings4Line,
  RiEyeLine
} from 'react-icons/ri';

function Overview({ projectStats }) {
  return (
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
  );
}

export default Overview;