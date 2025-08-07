import React, { useState, useEffect, useCallback } from 'react';
import { FaChartLine, FaMoneyBillWave, FaRegClock, FaSpinner, FaPlus } from 'react-icons/fa';
import { commissionService } from '../../services/realtyConnectService';

// Try to import useAuth, but provide fallback if not available
let useAuth;
try {
  useAuth = require('../../contexts/AuthContext').useAuth;
} catch (error) {
  useAuth = () => ({ currentUser: null });
}

function AgentRC() {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const { currentUser } = useAuth(); // Get current user from auth context

  const [stats, setStats] = useState({
    activeListings: 0,
    pendingCommissions: '₱0',
    releasedThisMonth: '₱0',
    salesThisMonth: 0
  });

  // Load commissions from Firebase
  useEffect(() => {
    // Use a default user ID for demonstration if no user is authenticated
    const userId = currentUser?.uid || 'demo-agent-user';

    const loadCommissions = async () => {
      try {
        setLoading(true);
        // Subscribe to real-time updates
        const unsubscribe = commissionService.subscribeToCommissions(
          userId, 
          (commissionsData) => {
            setCommissions(commissionsData);
            calculateStats(commissionsData);
            setLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (err) {
        console.error('Error loading commissions:', err);
        setError('Failed to load commissions');
        setLoading(false);
      }
    };

    loadCommissions();
  }, [currentUser]);

  // Calculate stats from commissions data
  const calculateStats = useCallback((commissionsData) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthCommissions = commissionsData.filter(commission => {
      const commissionDate = commission.createdAt?.toDate() || new Date();
      return commissionDate.getMonth() === currentMonth && 
             commissionDate.getFullYear() === currentYear;
    });

    const pendingAmount = commissionsData
      .filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + parseFloat(c.commissionAmount || 0), 0);

    const releasedAmount = commissionsData
      .filter(c => c.status === 'completed' && 
        c.releaseDate && 
        new Date(c.releaseDate).getMonth() === currentMonth)
      .reduce((sum, c) => sum + parseFloat(c.commissionAmount || 0), 0);

    setStats({
      activeListings: commissionsData.filter(c => c.status === 'in-process').length,
      pendingCommissions: `₱${pendingAmount.toLocaleString()}`,
      releasedThisMonth: `₱${releasedAmount.toLocaleString()}`,
      salesThisMonth: thisMonthCommissions.length
    });
  }, []);

  // Handle status update
  const handleStatusUpdate = useCallback(async (commissionId, newStatus) => {
    try {
      await commissionService.updateCommissionStatus(commissionId, newStatus);
    } catch (error) {
      console.error('Error updating commission status:', error);
      alert('Failed to update commission status');
    }
  }, []);

  // Add new commission
  const handleAddCommission = useCallback(async (commissionData) => {
    try {
      const userId = currentUser?.uid || 'demo-agent-user';
      await commissionService.addCommission({
        ...commissionData,
        agentId: userId,
        status: 'pending'
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding commission:', error);
      alert('Failed to add commission');
    }
  }, [currentUser]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="animate-spin text-4xl text-purple-500" />
        <span className="ml-2 text-lg">Loading commissions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
        <button 
          className="btn btn-sm btn-outline"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-figure text-primary">
            <FaChartLine className="w-6 h-6" />
          </div>
          <div className="stat-title">Active Listings</div>
          <div className="stat-value">{stats.activeListings}</div>
          <div className="stat-desc text-success">In progress</div>
        </div>
        
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-figure text-warning">
            <FaRegClock className="w-6 h-6" />
          </div>
          <div className="stat-title">Pending Commissions</div>
          <div className="stat-value text-sm">{stats.pendingCommissions}</div>
          <div className="stat-desc">Awaiting release</div>
        </div>
        
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-figure text-success">
            <FaMoneyBillWave className="w-6 h-6" />
          </div>
          <div className="stat-title">Released This Month</div>
          <div className="stat-value text-sm">{stats.releasedThisMonth}</div>
          <div className="stat-desc text-success">Paid out</div>
        </div>
        
        <div className="stat bg-base-100 rounded-box shadow">
          <div className="stat-figure text-info">
            <FaChartLine className="w-6 h-6" />
          </div>
          <div className="stat-title">Sales This Month</div>
          <div className="stat-value">{stats.salesThisMonth}</div>
          <div className="stat-desc">Transactions</div>
        </div>
      </div>

      {/* Commission Tracker */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="card-title">Commission Tracker</h2>
              <p className="text-sm opacity-70">Track your commission payments and releases</p>
            </div>
            <button 
              className="btn btn-primary gap-2"
              onClick={() => setShowAddModal(true)}
            >
              <FaPlus />
              Add Commission
            </button>
          </div>
          
          {commissions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg opacity-70">No commissions found</p>
              <p className="text-sm opacity-50">Add your first commission to get started</p>
            </div>
          ) : (
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((item) => (
                    <tr key={item.id}>
                      <td>{item.client}</td>
                      <td>{item.project}</td>
                      <td>₱{parseFloat(item.saleAmount || 0).toLocaleString()}</td>
                      <td>₱{parseFloat(item.commissionAmount || 0).toLocaleString()}</td>
                      <td>
                        <span className={getStatusBadgeClass(item.status)}>
                          {item.status}
                        </span>
                      </td>
                      <td>{item.releaseDate || 'TBD'}</td>
                      <td>
                        <div className="dropdown">
                          <label tabIndex={0} className="btn btn-ghost btn-xs">
                            Actions
                          </label>
                          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                            {item.status === 'pending' && (
                              <li>
                                <button onClick={() => handleStatusUpdate(item.id, 'in-process')}>
                                  Mark In Process
                                </button>
                              </li>
                            )}
                            {item.status === 'in-process' && (
                              <li>
                                <button onClick={() => handleStatusUpdate(item.id, 'completed')}>
                                  Mark Completed
                                </button>
                              </li>
                            )}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Commission Modal */}
      {showAddModal && (
        <AddCommissionModal 
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddCommission}
        />
      )}
    </div>
  );
}

// Add Commission Modal Component
function AddCommissionModal({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    client: '',
    project: '',
    saleAmount: '',
    commissionAmount: '',
    releaseDate: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <dialog className="modal modal-bottom sm:modal-middle" open>
      <div className="modal-box">
        <h3 className="font-bold text-lg">Add New Commission</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="label">Client Name</label>
            <input 
              type="text" 
              name="client"
              className="input input-bordered w-full" 
              value={formData.client}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div>
            <label className="label">Project</label>
            <input 
              type="text" 
              name="project"
              className="input input-bordered w-full" 
              value={formData.project}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div>
            <label className="label">Sale Amount</label>
            <input 
              type="number" 
              name="saleAmount"
              className="input input-bordered w-full" 
              value={formData.saleAmount}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div>
            <label className="label">Commission Amount</label>
            <input 
              type="number" 
              name="commissionAmount"
              className="input input-bordered w-full" 
              value={formData.commissionAmount}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div>
            <label className="label">Expected Release Date</label>
            <input 
              type="date" 
              name="releaseDate"
              className="input input-bordered w-full" 
              value={formData.releaseDate}
              onChange={handleChange}
            />
          </div>
          
          <div className="modal-action">
            <button type="submit" className="btn btn-primary">Add Commission</button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/20" onClick={onClose}></div>
    </dialog>
  );
}

export default AgentRC;
