import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import ActivityLoggerService from '../../services/ActivityLoggerService';
import DashboardNavbar from '../../components/Sidebar';
import FirebaseIndexStatus from '../../components/FirebaseIndexStatus';
import {
  RiBarChartBoxLine,
  RiShieldKeyholeLine,
  RiHomeLine,
  RiUserLine,
  RiFileTextLine,
  RiSearchLine,
  RiNavigationLine,
  RiFileList3Line,
  RiErrorWarningLine,
  RiCalendarLine,
  RiPieChartLine,
  RiArrowUpLine
} from 'react-icons/ri';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ActivityLog Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen bg-base-100">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="bg-error/10 border border-error/20 rounded-lg p-6 text-center shadow-sm">
              <RiErrorWarningLine className="text-error text-3xl mb-4 mx-auto" />
              <h3 className="text-xl font-semibold text-base-content mb-3">Something went wrong</h3>
              <p className="text-base-content/70 mb-4">
                The Activity Log component encountered an unexpected error. This might be due to a configuration issue.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => this.setState({ hasError: false, error: null })}
                  className="btn btn-error hover:scale-105 transition-transform mr-2"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="btn btn-ghost hover:bg-base-200"
                >
                  Refresh Page
                </button>
              </div>
              {import.meta.env.DEV && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-error font-medium">
                    Technical Details (Development Mode)
                  </summary>
                  <pre className="mt-2 p-4 bg-error/10 rounded text-sm text-base-content overflow-auto border border-error/20">
                    {this.state.error?.toString()}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ActivityLog = () => {
  // Hook will now always be available since AuthProvider wraps the app
  const { currentUser, loading: authLoading } = useAuth();
  
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState('7'); // days
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(true); // Sidebar state

  // Watch for theme changes to ensure components adapt properly
  React.useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          // Force re-render when theme changes
          setActivities(prev => [...prev]); // This triggers a re-render
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  // Activity categories - Simplified to core business activities
  const categories = useMemo(() => [
    { value: 'all', label: 'All Activities', icon: RiBarChartBoxLine },
    { value: 'authentication', label: 'Login/Logout', icon: RiShieldKeyholeLine },
    { value: 'property_management', label: 'Property Listings', icon: RiHomeLine },
    { value: 'application_management', label: 'Applications', icon: RiUserLine }
  ], []);

  // Fetch activities using the new ActivityLoggerService
  const fetchActivities = React.useCallback(async () => {
    if (!currentUser) return;
    
    setActivitiesLoading(true);
    setError(null);
    
    try {
      const activities = await ActivityLoggerService.getUserActivities(currentUser.uid, {
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        days: parseInt(dateRange),
        limit: 100
      });

      // Add category icons to activities
      const activitiesWithIcons = activities.map(activity => {
        const category = categories.find(cat => cat.value === activity.category);
        return {
          ...activity,
          categoryLabel: category?.label || activity.category,
          categoryIcon: category?.icon || RiBarChartBoxLine
        };
      });

      setActivities(activitiesWithIcons);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activity log. Please try again.');
    } finally {
      setActivitiesLoading(false);
    }
  }, [currentUser, dateRange, selectedCategory, categories]);

  // Check for authentication context issues
  React.useEffect(() => {
    if (currentUser === undefined || authLoading) {
      // Still loading auth state
      setActivitiesLoading(true);
      return;
    }
    
    if (!currentUser) {
      // User is not logged in
      setActivitiesLoading(false);
      return;
    }
    
    // User is logged in, fetch activities
    fetchActivities();
  }, [currentUser, authLoading, fetchActivities]);

  // Filter activities based on category and search term
  const filteredActivities = useMemo(() => {
    let filtered = activities;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(activity => activity.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(activity => 
        activity.action?.toLowerCase().includes(term) ||
        activity.details?.title?.toLowerCase().includes(term) ||
        activity.details?.query?.toLowerCase().includes(term) ||
        activity.details?.formType?.toLowerCase().includes(term) ||
        JSON.stringify(activity.details).toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [activities, selectedCategory, searchTerm]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const stats = {
      total: activities.length,
      today: 0,
      byCategory: {}
    };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    categories.forEach(cat => {
      if (cat.value !== 'all') {
        stats.byCategory[cat.value] = 0;
      }
    });
    
    activities.forEach(activity => {
      // Count today's activities
      const activityDate = new Date(activity.timestamp);
      activityDate.setHours(0, 0, 0, 0);
      
      if (activityDate.getTime() === today.getTime()) {
        stats.today++;
      }
      
      // Count by category
      if (activity.category && Object.prototype.hasOwnProperty.call(stats.byCategory, activity.category)) {
        stats.byCategory[activity.category]++;
      }
    });
    
    return stats;
  }, [activities, categories]);

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'MMM dd, yyyy HH:mm:ss');
    } catch {
      return 'Invalid date';
    }
  };

  // Get action color with theme compatibility
  const getActionColor = (action) => {
    const colorMap = {
      login: 'text-success bg-success/10 border border-success/20',
      logout: 'text-warning bg-warning/10 border border-warning/20',
      create: 'text-primary bg-primary/10 border border-primary/20',
      update: 'text-info bg-info/10 border border-info/20',
      delete: 'text-error bg-error/10 border border-error/20',
      search: 'text-secondary bg-secondary/10 border border-secondary/20',
      upload: 'text-accent bg-accent/10 border border-accent/20',
      navigation: 'text-base-content/70 bg-base-200 border border-base-300',
      error: 'text-error bg-error/20 border border-error/30'
    };
    
    return colorMap[action] || 'text-base-content/70 bg-base-200 border border-base-300';
  };

  // Format activity details for core business activities
  const formatDetails = (activity) => {
    const details = activity.details || {};
    
    switch (activity.category) {
      case 'authentication':
        return details.loginMethod ? `Login via ${details.loginMethod}` : 'Authentication activity';
      
      case 'property_management':
        if (activity.activityType === 'create') {
          return details.title ? `Added property: "${details.title}"` : 'New property listing created';
        } else if (activity.activityType === 'update') {
          return details.title ? `Updated property: "${details.title}"` : 'Property listing updated';
        } else if (activity.activityType === 'delete') {
          return details.title ? `Removed property: "${details.title}"` : 'Property listing deleted';
        }
        return details.description || 'Property activity';
      
      case 'application_management':
        if (activity.activityType === 'create') {
          return details.propertyTitle ? `Applied for: "${details.propertyTitle}"` : 'New application submitted';
        } else if (activity.activityType === 'update') {
          return details.propertyTitle ? `Updated application for: "${details.propertyTitle}"` : 'Application updated';
        } else if (activity.activityType === 'delete') {
          return details.propertyTitle ? `Cancelled application for: "${details.propertyTitle}"` : 'Application cancelled';
        }
        return details.description || 'Application activity';
      
      default:
        return details.description || activity.details?.action || 'Activity performed';
    }
  };

  // Show loading state while checking authentication or if auth is still loading
  if (authLoading || (currentUser === undefined)) {
    return (
      <div className="flex min-h-screen bg-base-100">
        <DashboardNavbar userRole="buyer" isOpen={isOpen} setIsOpen={setIsOpen} />
        <main className={`flex-1 transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-20'}`}>
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="bg-base-100 border border-base-200 rounded-lg p-6 text-center shadow-sm">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <h3 className="text-lg font-semibold text-base-content mb-2">Loading Authentication</h3>
              <p className="text-base-content/70">Checking your authentication status...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show login required message
  if (!currentUser) {
    return (
      <div className="flex min-h-screen bg-base-100">
        <DashboardNavbar userRole="buyer" isOpen={isOpen} setIsOpen={setIsOpen} />
        <main className={`flex-1 transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-20'}`}>
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-6 text-center shadow-sm">
              <RiShieldKeyholeLine className="text-warning text-xl mb-2 mx-auto" />
              <h3 className="text-lg font-semibold text-base-content mb-2">Authentication Required</h3>
              <p className="text-base-content/70">Please log in to view your activity log.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-base-100">
      <DashboardNavbar userRole="buyer" isOpen={isOpen} setIsOpen={setIsOpen} />
      
      <main className={`flex-1 transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-base-content mb-2">Activity Log</h1>
                <p className="text-base-content/70">Track your account activity and system interactions</p>
              </div>
              <button
                onClick={fetchActivities}
                disabled={activitiesLoading}
                className="btn btn-outline btn-primary btn-sm gap-2"
              >
                <RiArrowUpLine className={activitiesLoading ? 'animate-spin' : ''} />
                {activitiesLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Statistics Cards - Simplified */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-base-100 rounded-lg shadow-sm border border-base-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/70">Total Activities</p>
                  <p className="text-2xl font-bold text-base-content">{statistics.total}</p>
                </div>
                <RiBarChartBoxLine className="text-2xl text-primary" />
              </div>
            </div>
            
            <div className="bg-base-100 rounded-lg shadow-sm border border-base-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/70">Today</p>
                  <p className="text-2xl font-bold text-primary">{statistics.today}</p>
                </div>
                <RiCalendarLine className="text-2xl text-info" />
              </div>
            </div>
            
            <div className="bg-base-100 rounded-lg shadow-sm border border-base-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/70">Property Actions</p>
                  <p className="text-2xl font-bold text-success">{statistics.byCategory.property_management || 0}</p>
                </div>
                <RiHomeLine className="text-2xl text-success" />
              </div>
            </div>
            
            <div className="bg-base-100 rounded-lg shadow-sm border border-base-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/70">Applications</p>
                  <p className="text-2xl font-bold text-secondary">{statistics.byCategory.application_management || 0}</p>
                </div>
                <RiUserLine className="text-2xl text-secondary" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-base-100 rounded-lg shadow-sm border border-base-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Category Filter */}
              <div className="flex-1">
                <label htmlFor="category" className="block text-sm font-medium text-base-content mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="select select-bordered w-full bg-base-100 border-base-300 text-base-content focus:border-primary"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div className="flex-1">
                <label htmlFor="dateRange" className="block text-sm font-medium text-base-content mb-2">
                  Time Period
                </label>
                <select
                  id="dateRange"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="select select-bordered w-full bg-base-100 border-base-300 text-base-content focus:border-primary"
                >
                  <option value="1">Last 24 hours</option>
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
              </div>

              {/* Search */}
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-base-content mb-2">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input input-bordered w-full bg-base-100 border-base-300 text-base-content placeholder:text-base-content/50 focus:border-primary"
                />
              </div>

              {/* Refresh Button */}
              <div className="flex items-end">
                <button
                  onClick={fetchActivities}
                  disabled={activitiesLoading}
                  className="btn btn-primary hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {activitiesLoading ? '🔄' : '↻'} Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Activity List */}
          <div className="bg-base-100 rounded-lg shadow-sm border border-base-200 overflow-hidden">
            {activitiesLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-base-content/70">Loading activities...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <RiErrorWarningLine className="text-error text-2xl mb-2 mx-auto" />
                <h3 className="text-lg font-semibold text-base-content mb-2">Error Loading Activities</h3>
                <p className="text-base-content/70 mb-4">{error}</p>
                <div className="space-y-2">
                  <button
                    onClick={fetchActivities}
                    className="btn btn-error hover:scale-105 transition-transform mr-2"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="btn btn-ghost hover:bg-base-200"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="p-8 text-center">
                <RiFileList3Line className="text-base-content/40 text-4xl mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-base-content mb-2">No Activities Found</h3>
                <p className="text-base-content/70 mb-4">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'No activities match your current filters.' 
                    : 'No activities recorded yet. Start using the platform to see your activity history.'}
                </p>
                {(searchTerm || selectedCategory !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                    className="btn btn-ghost hover:bg-base-200"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-base-200">
                <div className="p-4 bg-base-200/50 border-b border-base-200">
                  <h3 className="text-lg font-semibold text-base-content">
                    Recent Activities ({filteredActivities.length})
                  </h3>
                </div>
                
                <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-base-100">
                  {filteredActivities.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-base-200/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <activity.categoryIcon className="text-lg text-base-content/70" />
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(activity.action)}`}>
                              {activity.action?.toUpperCase() || 'ACTIVITY'}
                            </span>
                            <span className="text-sm text-base-content/70">{activity.categoryLabel}</span>
                          </div>
                          
                          <p className="text-sm text-base-content mb-1">
                            {formatDetails(activity)}
                          </p>
                          
                          <p className="text-xs text-base-content/50">
                            {formatTimestamp(activity.timestamp)}
                          </p>
                        </div>
                        
                        {activity.category === 'system_error' && (
                          <div className="ml-4">
                            <span className="badge badge-error badge-sm">
                              Error
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Footer Info */}
          <div className="mt-6 text-center text-sm text-base-content/50">
            <p>Activity data is stored securely and only visible to you. Data retention: 90 days.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

// Enhanced export with Error Boundary as default
const ActivityLogWithErrorBoundary = () => (
  <ErrorBoundary>
    <ActivityLog />
  </ErrorBoundary>
);

export default ActivityLogWithErrorBoundary;
export { ActivityLog };