import { motion } from "framer-motion";
import DashboardLayout from "../../layouts/DashboardLayout";
import { 
  RiHomeSmileLine, RiMoneyDollarCircleLine, RiStarSmileLine, 
  RiLineChartLine, RiAddLine, RiCheckboxCircleLine, 
  RiTimeLine, RiErrorWarningLine 
} from 'react-icons/ri';

function AgentDashboard() {
  const stats = [
    {
      title: "Active Listings",
      value: "15",
      subtitle: "Properties on market",
      icon: RiHomeSmileLine,
      trend: "+3 this week",
      color: "text-blue-500",
      bgGradient: "from-blue-500/20 to-blue-500/5"
    },
    {
      title: "Pending Commissions",
      value: "₱425,000",
      subtitle: "Expected earnings",
      icon: RiMoneyDollarCircleLine,
      trend: "+12% from last month",
      color: "text-emerald-500",
      bgGradient: "from-emerald-500/20 to-emerald-500/5"
    },
    {
      title: "Average Rating",
      value: "4.8",
      subtitle: "From 56 reviews",
      icon: RiStarSmileLine,
      trend: "+0.2 this month",
      color: "text-amber-500",
      bgGradient: "from-amber-500/20 to-amber-500/5"
    },
    {
      title: "Sales This Month",
      value: "8",
      subtitle: "Properties sold",
      icon: RiLineChartLine,
      trend: "+2 vs last month",
      color: "text-purple-500",
      bgGradient: "from-purple-500/20 to-purple-500/5"
    }
  ];

  const myListings = [
    {
      id: 1,
      title: "Modern Townhouse in Makati",
      price: "₱8,500,000",
      location: "Makati City, Metro Manila",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80",
      status: "processing",
      progress: 65,
      buyer: {
        name: "Michael Anderson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael&backgroundColor=b6e3f4",
      },
      steps: [
        { title: "Initial Payment", status: "completed", date: "July 15, 2025" },
        { title: "Document Verification", status: "completed", date: "July 18, 2025" },
        { title: "Bank Loan Processing", status: "current", date: "July 24, 2025" },
        { title: "Property Turnover", status: "pending", date: "Expected: August 15, 2025" }
      ]
    }
  ];

  return (
    <DashboardLayout userRole="agent">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-base-100 p-4" // Added ml-20 for sidebar space
      >
        <div className="container mx-auto max-w-[1400px] px-4"> {/* Added max-width and padding */}
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
                    Welcome back, Sarah Garcia 👋
                  </h2>
                  <h1 className="text-3xl font-bold text-primary-content">
                    Agent Dashboard
                  </h1>
                  <p className="text-sm text-primary-content/70 max-w-md">
                    Track your listings, commissions, and client interactions all in one place.
                  </p>
                </div>
                <div className="hidden lg:block">
                  <div className="stats bg-primary-content/10 text-primary-content">
                    <div className="stat place-items-center">
                      <div className="stat-title text-primary-content/80">Total</div>
                      <div className="stat-value text-2xl">32</div>
                      <div className="stat-desc text-primary-content/60">Properties Sold</div>
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

          {/* Updated Listings Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Property Listings</h2>
                <p className="text-base-content/60 mt-1">
                  Manage and track your property listings
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-primary gap-2 px-6"
              >
                <RiAddLine className="w-5 h-5" />
                Create Listing
              </motion.button>
            </div>

            {/* Active Listings */}
            {myListings.map((listing) => (
              <motion.div
                key={listing.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="card bg-base-100 shadow-lg overflow-hidden mb-6"
              >
                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-1/3 h-[200px] lg:h-auto relative">
                    <img 
                      src={listing.image} 
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="badge badge-primary">In Progress</span>
                    </div>
                  </div>

                  <div className="lg:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{listing.title}</h3>
                        <p className="text-base-content/60">{listing.location}</p>
                        <p className="text-lg font-semibold text-primary mt-2">{listing.price}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <img 
                            src={listing.buyer.avatar} 
                            alt={listing.buyer.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <p className="text-sm font-medium">{listing.buyer.name}</p>
                            <p className="text-xs text-base-content/60">Buyer</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full bg-base-200 rounded-full h-2 mb-4">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${listing.progress}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {listing.steps.map((step, index) => (
                        <div 
                          key={index}
                          className="flex items-start gap-3"
                        >
                          {step.status === 'completed' && (
                            <RiCheckboxCircleLine className="w-5 h-5 text-success mt-1" />
                          )}
                          {step.status === 'current' && (
                            <RiTimeLine className="w-5 h-5 text-primary mt-1" />
                          )}
                          {step.status === 'pending' && (
                            <RiErrorWarningLine className="w-5 h-5 text-base-content/30 mt-1" />
                          )}
                          <div>
                            <p className={`text-sm font-medium ${
                              step.status === 'pending' ? 'text-base-content/50' : ''
                            }`}>{step.title}</p>
                            <p className="text-xs text-base-content/60">{step.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
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

export default AgentDashboard;