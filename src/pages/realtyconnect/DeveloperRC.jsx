
import React from 'react';
import { FaBuilding, FaUsers, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';

function DeveloperRC() {
  const stats = {
    activeProjects: 8,
    contractValue: '₱2.1B',
    activeClients: 156,
    deliveryRate: '94%'
  };

  const contracts = [
    {
      project: 'Lumina Homes Taguig',
      buyer: 'Juan Santos',
      totalAmount: '₱2,800,000',
      paid: '₱1,400,000',
      remainingAmount: '₱700,000',
      progress: 50
    },
    {
      project: 'Camella Cebu',
      buyer: 'Maria Cruz',
      totalAmount: '₱1,500,000',
      paid: '₱975,000',
      remainingAmount: '₱875,000',
      progress: 25
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-figure text-primary">
            <FaBuilding className="w-6 h-6" />
          </div>
          <div className="stat-title">Active Projects</div>
          <div className="stat-value">{stats.activeProjects}</div>
          <div className="stat-desc">4 tech/design team</div>
        </div>

        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-figure text-primary">
            <FaMoneyBillWave className="w-6 h-6" />
          </div>
          <div className="stat-title">Contract Value</div>
          <div className="stat-value">{stats.contractValue}</div>
          <div className="stat-desc">₱42M received</div>
        </div>

        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-figure text-primary">
            <FaUsers className="w-6 h-6" />
          </div>
          <div className="stat-title">Active Buyers</div>
          <div className="stat-value">{stats.activeClients}</div>
          <div className="stat-desc">34 final sold</div>
        </div>

        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-figure text-primary">
            <FaChartLine className="w-6 h-6" />
          </div>
          <div className="stat-title">On-Time Delivery</div>
          <div className="stat-value">{stats.deliveryRate}</div>
          <div className="stat-desc">Excellence record</div>
        </div>
      </div>

      {/* Smart Contract Manager */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Smart Contract Manager</h2>
          <p className="text-sm opacity-70">Automated payment releases based on construction indicators</p>

          {contracts.map((contract, index) => (
            <div key={index} className="card bg-base-200 my-4">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{contract.project}</h3>
                    <p className="text-sm">Buyer: {contract.buyer}</p>
                  </div>
                  <button className="btn btn-sm btn-success">Active</button>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-sm opacity-70">Total Amount</p>
                    <p className="font-semibold">{contract.totalAmount}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70">Amount Paid</p>
                    <p className="font-semibold">{contract.paid}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-70">Remaining</p>
                    <p className="font-semibold">{contract.remainingAmount}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Payment Progress</span>
                    <span className="text-sm font-bold">{contract.progress}%</span>
                  </div>
                  <progress
                    className="progress progress-primary w-full"
                    value={contract.progress}
                    max="100"
                  ></progress>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DeveloperRC;