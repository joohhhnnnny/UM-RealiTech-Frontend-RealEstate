import { motion } from "framer-motion";
import DashboardLayout from "../../layouts/DashboardLayout";
import { 
  RiBuildingLine,
  RiHome4Line,
  RiTimeLine,
  RiTeamLine,
  RiAlertLine
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

  const projects = [
    {
      title: "Modern Townhouse in Makati",
      location: "Makati City, Metro Manila",
      price: "₱8,500,000",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80",
      status: "In Progress",
      progress: 65,
      agent: {
        name: "Sarah Garcia",
        rating: "4.8",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4"
      },
      updates: [
        {
          title: "Initial Payment",
          date: "July 15, 2025",
          status: "completed"
        },
        {
          title: "Document Verification",
          date: "July 18, 2025",
          status: "completed"
        },
        {
          title: "Bank Loan Processing",
          date: "July 24, 2025",
          status: "in-progress"
        },
        {
          title: "Property Turnover",
          date: "Expected: August 15, 2025",
          status: "pending"
        }
      ]
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

          {/* Projects Section */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">My Projects</h2>
              <button className="btn btn-primary">View All Projects</button>
            </div>
            
            {projects.map((project) => (
              <div key={project.title} className="card bg-base-100 shadow-lg overflow-hidden mb-6">
                <div className="flex flex-col lg:flex-row">
                  {/* Project Image */}
                  <div className="lg:w-1/3 h-[200px] lg:h-auto relative">
                    <img 
                      alt={project.title} 
                      className="w-full h-full object-cover" 
                      src={project.image}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="badge badge-primary">{project.status}</span>
                    </div>
                  </div>
                  
                  {/* Project Details */}
                  <div className="lg:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{project.title}</h3>
                        <p className="text-base-content/60">{project.location}</p>
                        <p className="text-lg font-semibold text-primary mt-2">{project.price}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <img 
                            alt={project.agent.name} 
                            className="w-8 h-8 rounded-full" 
                            src={project.agent.avatar}
                          />
                          <div>
                            <p className="text-sm font-medium">{project.agent.name}</p>
                            <p className="text-xs text-base-content/60">Agent • ⭐ {project.agent.rating}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-base-200 rounded-full h-2 mb-4">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    
                    {/* Property Updates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {project.updates.map((update, index) => (
                        <div key={index} className="flex items-start gap-3">
                          {update.status === "completed" ? (
                            <svg 
                              stroke="currentColor" 
                              fill="currentColor" 
                              strokeWidth="0" 
                              viewBox="0 0 24 24" 
                              className="w-5 h-5 text-success mt-1" 
                              height="1em" 
                              width="1em" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11.0026 16L6.75999 11.7574L8.17421 10.3431L11.0026 13.1716L16.6595 7.51472L18.0737 8.92893L11.0026 16Z"></path>
                            </svg>
                          ) : update.status === "in-progress" ? (
                            <svg 
                              stroke="currentColor" 
                              fill="currentColor" 
                              strokeWidth="0" 
                              viewBox="0 0 24 24" 
                              className="w-5 h-5 text-primary mt-1" 
                              height="1em" 
                              width="1em" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM13 12H17V14H11V7H13V12Z"></path>
                            </svg>
                          ) : (
                            <svg 
                              stroke="currentColor" 
                              fill="currentColor" 
                              strokeWidth="0" 
                              viewBox="0 0 24 24" 
                              className="w-5 h-5 text-base-content/30 mt-1" 
                              height="1em" 
                              width="1em" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z"></path>
                            </svg>
                          )}
                          <div>
                            <p className={`text-sm font-medium ${
                              update.status === "pending" ? "text-base-content/50" : ""
                            }`}>
                              {update.title}
                            </p>
                            <p className="text-xs text-base-content/60">{update.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

export default DeveloperDashboard;