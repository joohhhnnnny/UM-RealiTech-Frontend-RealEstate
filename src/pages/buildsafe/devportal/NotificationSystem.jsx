import React, { useState, useEffect, useCallback } from 'react';
import {
  RiNotificationLine,
  RiTimeLine,
  RiFileTextLine,
  RiMoneyDollarCircleLine,
  RiCheckboxCircleLine,
  RiAlertLine,
  RiCloseLine,
  RiEyeLine,
  RiDeleteBinLine,
  RiBellLine
} from 'react-icons/ri';

function NotificationSystem({ 
  notifications, 
  setNotifications, 
  userRole = 'buyer'  // buyer, developer, agent
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [filter, setFilter] = useState('all'); // all, milestone, document, escrow
  
  // Auto-generate notifications for demo purposes
  useEffect(() => {
    const generateDemoNotifications = () => {
      const demoNotifications = [
        {
          id: 'demo-1',
          type: 'milestone',
          title: 'Milestone Completed',
          message: 'Foundation work has been completed and verified',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          read: false,
          project: 'Horizon Residences',
          priority: 'high',
          actionUrl: '/buildsafe?tab=timeline'
        },
        {
          id: 'demo-2',
          type: 'document',
          title: 'Document Ready',
          message: 'Your contract amendment is ready for download',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          read: false,
          project: 'Vista Heights',
          priority: 'medium',
          actionUrl: '/buildsafe?tab=documents'
        },
        {
          id: 'demo-3',
          type: 'escrow',
          title: 'Payment Released',
          message: 'Milestone payment of ₱500,000 has been released to developer',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          read: true,
          project: 'Palm Gardens',
          priority: 'medium',
          actionUrl: '/buildsafe?tab=escrow'
        },
        {
          id: 'demo-4',
          type: 'milestone',
          title: 'Construction Update',
          message: 'New photos uploaded for roofing milestone',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          read: true,
          project: 'Horizon Residences',
          priority: 'low',
          actionUrl: '/buildsafe?tab=timeline'
        }
      ];
      
      // Only set demo notifications if no notifications exist
      if (notifications.length === 0) {
        setNotifications(demoNotifications);
      }
    };

    generateDemoNotifications();
  }, [notifications.length, setNotifications]);

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly generate new notifications (10% chance every 30 seconds)
      if (Math.random() < 0.1) {
        const notificationTypes = ['milestone', 'document', 'escrow'];
        const projects = ['Horizon Residences', 'Vista Heights', 'Palm Gardens'];
        const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        const randomProject = projects[Math.floor(Math.random() * projects.length)];
        
        const newNotifications = {
          milestone: {
            title: 'Construction Progress',
            message: 'New milestone update available with photos',
            priority: 'medium',
            actionUrl: '/buildsafe?tab=timeline'
          },
          document: {
            title: 'Document Update',
            message: 'New document has been processed and is ready',
            priority: 'high',
            actionUrl: '/buildsafe?tab=documents'
          },
          escrow: {
            title: 'Payment Update',
            message: 'Milestone payment is pending verification',
            priority: 'medium',
            actionUrl: '/buildsafe?tab=escrow'
          }
        };
        
        const notification = {
          id: `realtime-${Date.now()}`,
          type: randomType,
          ...newNotifications[randomType],
          timestamp: new Date().toISOString(),
          read: false,
          project: randomProject
        };
        
        setNotifications(prev => [notification, ...prev]);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [setNotifications]);

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'milestone': return RiTimeLine;
      case 'document': return RiFileTextLine;
      case 'escrow': return RiMoneyDollarCircleLine;
      case 'alert': return RiAlertLine;
      default: return RiNotificationLine;
    }
  };

  // Get notification color
  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return 'text-error';
    switch(type) {
      case 'milestone': return 'text-primary';
      case 'document': return 'text-info';
      case 'escrow': return 'text-warning';
      default: return 'text-base-content';
    }
  };

  // Mark notification as read
  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, [setNotifications]);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, [setNotifications]);

  // Delete notification
  const deleteNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, [setNotifications]);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, [setNotifications]);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' || notification.type === filter
  );

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <div className="dropdown dropdown-end">
        <div className="indicator">
          {unreadCount > 0 && (
            <span className="indicator-item badge badge-error badge-sm animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          <button 
            className="btn btn-ghost btn-circle hover:bg-primary/10 transition-colors"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <RiBellLine className={`text-xl ${unreadCount > 0 ? 'text-primary animate-bounce' : ''}`} />
          </button>
        </div>
        
        {showNotifications && (
          <div className="dropdown-content menu p-0 shadow-xl bg-base-100 rounded-box w-80 mt-2 border border-base-300 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-base-300 bg-base-200 rounded-t-box">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg">Notifications</h3>
                <button 
                  className="btn btn-ghost btn-xs"
                  onClick={() => setShowNotifications(false)}
                >
                  <RiCloseLine />
                </button>
              </div>
              
              {/* Filters */}
              <div className="tabs tabs-boxed tabs-xs">
                {['all', 'milestone', 'document', 'escrow'].map(filterType => (
                  <button
                    key={filterType}
                    className={`tab tab-xs ${filter === filterType ? 'tab-active' : ''}`}
                    onClick={() => setFilter(filterType)}
                  >
                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  </button>
                ))}
              </div>
              
              {/* Actions */}
              {notifications.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {unreadCount > 0 && (
                    <button 
                      className="btn btn-xs btn-primary"
                      onClick={markAllAsRead}
                    >
                      Mark All Read
                    </button>
                  )}
                  <button 
                    className="btn btn-xs btn-ghost"
                    onClick={clearAll}
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
            
            {/* Notifications List */}
            <div className="overflow-y-auto max-h-64">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map(notification => {
                  const IconComponent = getNotificationIcon(notification.type);
                  const iconColor = getNotificationColor(notification.type, notification.priority);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-base-200 hover:bg-base-50 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <IconComponent className={`text-lg mt-1 ${iconColor}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-sm font-medium truncate ${!notification.read ? 'font-bold' : ''}`}>
                              {notification.title}
                            </h4>
                            <span className="text-xs text-base-content/50 ml-2 whitespace-nowrap">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-base-content/70 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          {notification.project && (
                            <div className="badge badge-outline badge-xs">
                              {notification.project}
                            </div>
                          )}
                        </div>
                        <div className="dropdown dropdown-left">
                          <button className="btn btn-ghost btn-xs">•••</button>
                          <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32">
                            <li>
                              <button onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}>
                                <RiEyeLine className="w-3 h-3" />
                                {notification.read ? 'Read' : 'Mark Read'}
                              </button>
                            </li>
                            <li>
                              <button 
                                className="text-error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                              >
                                <RiDeleteBinLine className="w-3 h-3" />
                                Delete
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-base-content/50">
                  <RiNotificationLine className="mx-auto text-4xl mb-2 opacity-50" />
                  <p className="text-sm">
                    {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
                  </p>
                </div>
              )}
            </div>
            
            {/* Footer */}
            {filteredNotifications.length > 5 && (
              <div className="p-3 border-t border-base-300 bg-base-200 rounded-b-box">
                <button 
                  className="btn btn-sm btn-ghost w-full"
                  onClick={() => {
                    // Navigate to full notifications page
                    window.location.href = '/notifications';
                  }}
                >
                  View All Notifications
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast Notifications for New Updates */}
      {notifications
        .filter(n => !n.read && Date.now() - new Date(n.timestamp).getTime() < 5000) // Last 5 seconds
        .slice(0, 3) // Show max 3 toasts
        .map(notification => {
          const IconComponent = getNotificationIcon(notification.type);
          return (
            <div key={`toast-${notification.id}`} className="toast toast-top toast-end z-50">
              <div className="alert alert-info shadow-lg animate-fade-in">
                <div className="flex items-center gap-2">
                  <IconComponent className="text-lg" />
                  <div>
                    <h4 className="font-bold text-sm">{notification.title}</h4>
                    <p className="text-xs">{notification.message}</p>
                  </div>
                </div>
                <button 
                  className="btn btn-ghost btn-xs"
                  onClick={() => markAsRead(notification.id)}
                >
                  <RiCloseLine />
                </button>
              </div>
            </div>
          );
        })}
    </div>
  );
}

export default NotificationSystem;
