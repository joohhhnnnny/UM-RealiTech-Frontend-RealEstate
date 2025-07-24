// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import DashboardLayout from "../../layouts/DashboardLayout";

function BuyerDashboard() {
  return (
    <DashboardLayout userRole="buyer">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-base-100 p-4"
      >
        <div className="container mx-auto">
          {/* Welcome Section */}
          <div className="stats shadow bg-primary text-primary-content w-full">
            <div className="stat">
              <div className="stat-title text-primary-content/80">
                Welcome Back
              </div>
              <div className="stat-value">Buyer Dashboard</div>
              <div className="stat-desc text-primary-content/70">
                Browse and track your favorite properties
              </div>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {/* Saved Properties Card */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">
                  <i className="fas fa-heart text-primary"></i>
                  Saved Properties
                </h2>
                <p>You have 5 saved properties</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary btn-sm">View All</button>
                </div>
              </div>
            </div>

            {/* Property Viewings */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">
                  <i className="fas fa-calendar text-primary"></i>
                  Upcoming Viewings
                </h2>
                <p>2 scheduled viewings this week</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary btn-sm">Schedule More</button>
                </div>
              </div>
            </div>

            {/* Search History */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">
                  <i className="fas fa-search text-primary"></i>
                  Recent Searches
                </h2>
                <p>View your recent property searches</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary btn-sm">View History</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

export default BuyerDashboard;