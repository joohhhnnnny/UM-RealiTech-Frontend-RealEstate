import React, { useState, useEffect } from 'react';
import { 
  RiHistoryLine,
  RiFilter3Line, 
  RiCalendarLine, 
  RiSearchLine,
  RiInformationLine
} from 'react-icons/ri';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  where, 
  Timestamp
} from 'firebase/firestore';
import { format } from 'date-fns';
import { db } from '../../config/Firebase';
import { useNavigate } from 'react-router-dom';

function ActivityLog() {
  const [timeFilter, setTimeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const auth = getAuth();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null); // Changed to state

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        setError('Please login to view activity logs');
        setLoading(false);
        navigate('/login');
      } else {
        setCurrentUser(user); // Set current user in state
        setError(null);
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!currentUser) return;

      try {
        const now = new Date();
        let timeFilterDate = new Date();
        
        // Determine the time filter date
        switch(timeFilter) {
          case '24h':
            timeFilterDate.setDate(now.getDate() - 1);
            break;
          case '7d':
            timeFilterDate.setDate(now.getDate() - 7);
            break;
          case '30d':
          case 'all':
            timeFilterDate.setDate(now.getDate() - 30);
            break;
        }

        // Create query to get only the current user's logs
        let q = query(
          collection(db, 'audit_logs'),
          where('userId', '==', currentUser.uid), // Filter by current user's ID
          where('timestamp', '>=', Timestamp.fromDate(timeFilterDate)),
          orderBy('timestamp', 'desc')
        );

        const querySnapshot = await getDocs(q);
        let logsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        }));

        // Apply type filter in memory if needed
        if (typeFilter !== 'all') {
          logsData = logsData.filter(log => 
            log.action?.toLowerCase() === typeFilter.toLowerCase()
          );
        }

        // Apply search filter in memory if needed
        if (searchQuery.trim()) {
          const searchLower = searchQuery.toLowerCase();
          logsData = logsData.filter(log => 
            (log.action?.toLowerCase().includes(searchLower)) ||
            (log.details?.userNumber?.toLowerCase()?.includes(searchLower))
          );
        }

        setLogs(logsData); 
        setError(null);
      } catch (err) {
        console.error('Error fetching logs:', err);
        setError('Failed to load activity logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [timeFilter, typeFilter, searchQuery, currentUser]);

  // Helper function to get badge style based on action type
  const getActivityBadge = (action) => {
    const actionUpper = action?.toUpperCase();
    
    switch(action?.toLowerCase()) {
      case 'login':
        return { class: 'badge-success', text: 'LOGIN' };
      case 'logout':
        return { class: 'badge-error', text: 'LOGOUT' };
      case 'create':
        return { class: 'badge-primary', text: 'CREATE' };
      case 'update':
        return { class: 'badge-warning', text: 'UPDATE' };
      case 'delete':
        return { class: 'badge-error', text: 'DELETE' };
      default:
        return { class: 'badge-neutral', text: actionUpper || 'UNKNOWN' };
    }
  };

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
                Track and monitor your system activities
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
                    placeholder="Search your activities..."
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
                <option value="all">Last 30 Days</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
              </select>

              {/* Type Filter */}
              <select
                className="select select-bordered w-full md:w-48"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Activities</option>
                <option value="login">Login Events</option>
                <option value="logout">Logout Events</option>
                <option value="update">Update Events</option>
                <option value="create">Create Events</option>
                <option value="delete">Delete Events</option>
              </select>
            </div>
          </div>
        </div>

        {/* Activity Log Content */}
        <div className="card bg-base-100 shadow-lg border border-base-200">
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Activity</th>
                    <th>Type</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8">
                        <span className="loading loading-spinner loading-lg"></span>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8">
                        <div className="alert alert-error">
                          <RiInformationLine className="text-xl" />
                          <span>{error}</span>
                        </div>
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8">
                        <div className="flex flex-col items-center gap-2 text-base-content/70">
                          <RiHistoryLine className="text-4xl" />
                          <p>No activities to display</p>
                          <p className="text-sm">Your activities will appear here</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    logs.map(log => (
                      <tr key={log.id}>
                        <td>{format(log.timestamp, 'PPpp')}</td>
                        <td>
                          <span className={`badge ${getActivityBadge(log.action).class}`}>
                            {getActivityBadge(log.action).text}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-primary">{log.userRole}</span>
                        </td>
                        <td>
                          <details className="dropdown dropdown-left">
                            <summary className="btn btn-xs btn-ghost">View Details</summary>
                            <div className="dropdown-content z-[1] menu p-4 shadow bg-base-200 rounded-box w-80">
                              <div className="text-xs space-y-2">
                                <div>
                                  <span className="font-semibold">Browser:</span> {log.userAgent}
                                </div>
                                <div>
                                  <span className="font-semibold">Platform:</span> {log.platform}
                                </div>
                                {log.details && (
                                  <div>
                                    <span className="font-semibold">Additional Details:</span>
                                    <pre className="mt-1 p-2 bg-base-300 rounded">
                                      {JSON.stringify(log.details, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          </details>
                        </td>
                      </tr>
                    ))
                  )}
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