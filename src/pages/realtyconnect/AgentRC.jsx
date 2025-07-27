
import React from 'react';
import { FaChartLine, FaMoneyBillWave, FaRegClock } from 'react-icons/fa';

function AgentRC() {
  const commissionData = [
    {
      client: 'Juan Santos',
      project: 'Lumina Homes Siging',
      saleAmount: '₱2,800,000',
      commission: '₱84,000',
      status: 'completed',
      releaseDate: '2024-11-15'
    },
    {
      client: 'Maria Cruz',
      project: 'Camella Cebu',
      saleAmount: '₱1,500,000',
      commission: '₱45,000',
      status: 'pending',
      releaseDate: '2024-12-30'
    },
    {
      client: 'Pedro Reyes',
      project: 'Vista Land QC',
      saleAmount: '₱1,800,000',
      commission: '₱54,000',
      status: 'in-process',
      releaseDate: '2024-11-30'
    }
  ];

  const stats = {
    activeListings: 24,
    pendingCommissions: '₱280K',
    releasedThisMonth: '₱420K',
    salesThisMonth: 12
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'badge badge-success';
      case 'pending':
        return 'badge badge-warning';
      case 'in-process':
        return 'badge badge-info';
      default:
        return 'badge';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Active Listings</div>
          <div className="stat-value">{stats.activeListings}</div>
          <div className="stat-desc text-success">+1 this week</div>
        </div>
        
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Pending Commissions</div>
          <div className="stat-value">{stats.pendingCommissions}</div>
          <div className="stat-desc">5 pending</div>
        </div>
        
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Released This Month</div>
          <div className="stat-value">{stats.releasedThisMonth}</div>
          <div className="stat-desc text-success">On time</div>
        </div>
        
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-title">Sales This Month</div>
          <div className="stat-value">{stats.salesThisMonth}</div>
          <div className="stat-desc">₱142M volume</div>
        </div>
      </div>

      {/* Commission Tracker */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Commission Tracker</h2>
          <p className="text-sm opacity-70">Track your commission payments and releases</p>
          
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Project</th>
                  <th>Sale Amount</th>
                  <th>Commission</th>
                  <th>Status</th>
                  <th>Release Date</th>
                </tr>
              </thead>
              <tbody>
                {commissionData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.client}</td>
                    <td>{item.project}</td>
                    <td>{item.saleAmount}</td>
                    <td>{item.commission}</td>
                    <td>
                      <span className={getStatusBadgeClass(item.status)}>
                        {item.status}
                      </span>
                    </td>
                    <td>{item.releaseDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentRC;