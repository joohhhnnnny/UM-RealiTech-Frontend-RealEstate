
import React, { useState } from 'react';
import { 
  RiHistoryLine, 
  RiFilter3Line, 
  RiCalendarLine, 
  RiSearchLine,
  RiInformationLine
} from 'react-icons/ri';
import DashboardLayout from '../../layouts/DashboardLayout';

function ActivityLog() {
  const [timeFilter, setTimeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-base-100 p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <RiHistoryLine className="text-primary" />
              Activity Log
            </h1>
            <p className="text-base-content/70 mt-2">
              Track and monitor system activities and user interactions
            </p>
          </div>

          <div className="flex gap-2">
            <div className="badge badge-neutral gap-2">
              <RiInformationLine />
              Retention: 30 days
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="card bg-base-100 shadow-lg border border-base-200 mb-6">
        <div className="card-body">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="form-control flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search activities..."
                  className="input input-bordered w-full pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <RiSearchLine className="text-base-content/50 text-lg" />
                </div>
              </div>
            </div>

            {/* Time Filter */}
            <select
              className="select select-bordered w-full md:w-48"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>

            {/* Type Filter */}
            <select
              className="select select-bordered w-full md:w-48"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Activities</option>
              <option value="login">Login Events</option>
              <option value="transaction">Transactions</option>
              <option value="document">Document Updates</option>
              <option value="profile">Profile Changes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity Log Content */}
      <div className="card bg-base-100 shadow-lg border border-base-200">
        <div className="card-body">
          {/* Table Header */}
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Activity</th>
                  <th>Type</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {/* Placeholder for no data state */}
                <tr>
                  <td colSpan="5" className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-base-content/70">
                      <RiHistoryLine className="text-4xl" />
                      <p>No activities to display</p>
                      <p className="text-sm">Activities will appear here as they occur</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ActivityLog;