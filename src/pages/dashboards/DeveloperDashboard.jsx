import { motion } from "framer-motion";
import DashboardLayout from "../../layouts/DashboardLayout";
import { 
  RiBuildingLine,
  RiHome4Line,
  RiTimeLine,
  RiTeamLine
} from 'react-icons/ri';

function DeveloperDashboard() {
  const stats = [
    {
      title: "Active Projects",
      value: "4",
      subtitle: "Development Sites",
      icon: RiBuildingLine,
      trend: "+1 this quarter",
      color: "text-blue-500",
      bgGradient: "from-blue-500/20 to-blue-500/5"
    },
    {
      title: "Units Sold",
      value: "170",
      subtitle: "Out of 250 units",
      icon: RiHome4Line,
      trend: "+12 this month",
      color: "text-emerald-500",
      bgGradient: "from-emerald-500/20 to-emerald-500/5"
    },
    {
      title: "On-time Delivery",
      value: "92%",
      subtitle: "Project milestones",
      icon: RiTimeLine,
      trend: "+5% vs last quarter",
      color: "text-amber-500",
      bgGradient: "from-amber-500/20 to-amber-500/5"
    },
    {
      title: "Active Buyers",
      value: "156",
      subtitle: "Across all projects",
      icon: RiTeamLine,
      trend: "+23 this month",
      color: "text-purple-500",
      bgGradient: "from-purple-500/20 to-purple-500/5"
    }
  ];

  return (
    <DashboardLayout userRole="developer">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-base-100 p-4"
      >
        <div className="container mx-auto max-w-[1400px] px-4">

          {/* Welcome Section */}
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="card bg-gradient-to-r from-primary/90 to-primary shadow-lg overflow-hidden backdrop-blur-xl"
          >
            <div className="card-body p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="text-lg font-medium text-primary-content/80">
                    Welcome back, Alex Martinez 👋
                  </h2>
                  <h1 className="text-3xl font-bold text-primary-content">
                    Developer Dashboard
                  </h1>
                  <p className="text-sm text-primary-content/70 max-w-md">
                    Monitor your development projects, sales progress, and construction milestones.
                  </p>
                </div>
                <div className="hidden lg:block">
                  <div className="stats bg-primary-content/10 text-primary-content">
                    <div className="stat place-items-center">
                      <div className="stat-title text-primary-content/80">Total Value</div>
                      <div className="stat-value text-2xl">₱2.4B</div>
                      <div className="stat-desc text-primary-content/60">Portfolio Worth</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {stats.map((stat) => (
              <motion.div
                key={stat.title}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className={`card bg-gradient-to-br ${stat.bgGradient} backdrop-blur-xl shadow-lg`}
              >
                <div className="card-body p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-base-content/70 text-sm font-medium">
                        {stat.title}
                      </p>
                      <h3 className={`text-2xl font-bold mt-2 ${stat.color}`}>
                        {stat.value}
                      </h3>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgGradient}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-base-content/60">
                      {stat.subtitle}
                    </p>
                    <p className="text-xs text-success mt-1">
                      {stat.trend}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ...rest of your dashboard content... */}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

export default DeveloperDashboard;