// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import DashboardLayout from "../../layouts/DashboardLayout";

function AgentDashboard() {
  return (
    <DashboardLayout userRole="agent">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-base-100 p-4"
      >
        <div className="container mx-auto">
          {/* Stats Overview */}
          <div className="stats shadow bg-primary text-primary-content w-full">
            <div className="stat">
              <div className="stat-title">Total Listings</div>
              <div className="stat-value">15</div>
              <div className="stat-desc">Active Properties</div>
            </div>
            <div className="stat">
              <div className="stat-title">Pending Sales</div>
              <div className="stat-value">3</div>
              <div className="stat-desc">In Progress</div>
            </div>
            <div className="stat">
              <div className="stat-title">Client Inquiries</div>
              <div className="stat-value">24</div>
              <div className="stat-desc">Last 30 days</div>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {/* Recent Listings */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">
                  <i className="fas fa-home text-primary"></i>
                  Recent Listings
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>123 Main St</span>
                    <span className="badge badge-primary">$450,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>456 Oak Ave</span>
                    <span className="badge badge-primary">$320,000</span>
                  </div>
                </div>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary btn-sm">View All</button>
                </div>
              </div>
            </div>

            {/* Appointments */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">
                  <i className="fas fa-calendar-alt text-primary"></i>
                  Today's Appointments
                </h2>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>10:00 AM - Property Viewing</span>
                    <span className="badge">2 clients</span>
                  </li>
                  <li className="flex justify-between">
                    <span>2:00 PM - Client Meeting</span>
                    <span className="badge">1 client</span>
                  </li>
                </ul>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary btn-sm">Schedule</button>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">
                  <i className="fas fa-chart-line text-primary"></i>
                  Performance
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Closed Deals</span>
                    <span className="text-success">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Listings</span>
                    <span className="text-primary">15</span>
                  </div>
                </div>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary btn-sm">Full Report</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

export default AgentDashboard;