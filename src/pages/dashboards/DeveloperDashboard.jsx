// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import DashboardLayout from "../../layouts/DashboardLayout";

function DeveloperDashboard() {
  return (
    <DashboardLayout userRole="developer">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-base-100 p-4"
      >
        <div className="container mx-auto">
          {/* Projects Overview */}
          <div className="stats shadow bg-primary text-primary-content w-full">
            <div className="stat">
              <div className="stat-title">Active Projects</div>
              <div className="stat-value">4</div>
              <div className="stat-desc">Development Sites</div>
            </div>
            <div className="stat">
              <div className="stat-title">Units Under Construction</div>
              <div className="stat-value">127</div>
              <div className="stat-desc">Across all projects</div>
            </div>
            <div className="stat">
              <div className="stat-title">Pre-sales</div>
              <div className="stat-value">68%</div>
              <div className="stat-desc">Average across projects</div>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {/* Project Status */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">
                  <i className="fas fa-building text-primary"></i>
                  Project Status
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Skyline Towers</span>
                    <div className="badge badge-success">On Track</div>
                  </div>
                  <progress
                    className="progress progress-primary"
                    value="70"
                    max="100"
                  ></progress>
                  <div className="flex justify-between items-center">
                    <span>Harbor Views</span>
                    <div className="badge badge-warning">Delayed</div>
                  </div>
                  <progress
                    className="progress progress-warning"
                    value="45"
                    max="100"
                  ></progress>
                </div>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary btn-sm">
                    View All Projects
                  </button>
                </div>
              </div>
            </div>

            {/* Construction Updates */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">
                  <i className="fas fa-hard-hat text-primary"></i>
                  Construction Updates
                </h2>
                <div className="space-y-2">
                  <div className="alert alert-info">
                    <span>Foundation complete for Building A</span>
                  </div>
                  <div className="alert alert-success">
                    <span>Roofing started on Building B</span>
                  </div>
                </div>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary btn-sm">All Updates</button>
                </div>
              </div>
            </div>

            {/* Sales Overview */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">
                  <i className="fas fa-chart-pie text-primary"></i>
                  Sales Overview
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Units</span>
                    <span>250</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pre-sold</span>
                    <span className="text-success">170</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available</span>
                    <span className="text-primary">80</span>
                  </div>
                </div>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary btn-sm">
                    Sales Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

export default DeveloperDashboard;