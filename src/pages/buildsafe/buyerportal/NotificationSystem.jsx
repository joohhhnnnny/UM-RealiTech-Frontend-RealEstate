import React, { useState, useEffect } from 'react';
import {
  RiNotificationLine,
  RiBellLine,
  RiTimeLine,
  RiFileTextLine,
  RiCheckboxCircleLine,
  RiAlertLine,
  RiCloseLine,
  RiMarkPenLine
} from 'react-icons/ri';

function NotificationSystem({ notifications, setNotifications, userRole = 'buyer' }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [filter, setFilter] = useState('all'); // all, milestone, document, payment
  const [showToast, setShowToast] = useState(null);

  // Generate sample notifications for buyer if none exist
  useEffect(() => {
    if (notifications.length === 0 && userRole === 'buyer') {
      const sampleNotifications = [
        {
          id: 'notif-1',
          type: 'milestone',
          message: 'Foundation milestone has been completed and verified!',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
          project: 'Sunset Residences',
          milestone: 'Foundation Complete'
        },
        {
          id: 'notif-2',
          type: 'document',
          message: 'Your contract amendment is ready for download',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          read: false,
          project: 'Sunset Residences'
        },
        {
          id: 'notif-3',
          type: 'milestone',
          message: 'New construction photos uploaded for Structural Framework',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          project: 'Sunset Residences',
          milestone: 'Structural Framework'
        },
        {
          id: 'notif-4',
          type: 'payment',
          message: 'Payment of ₱500,000 has been released for Foundation milestone',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          read: true,
          project: 'Sunset Residences'
        }
      ];
      setNotifications(sampleNotifications);
    }
  }, [notifications.length, userRole, setNotifications]);

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'milestone': return RiTimeLine;
      case 'document': return RiFileTextLine;
      case 'payment': return RiCheckboxCircleLine;
      default: return RiNotificationLine;
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type, read) => {
    if (!read) {
      switch(type) {
        case 'milestone': return 'text-success';
        case 'document': return 'text-info';
        case 'payment': return 'text-warning';
        default: return 'text-primary';
      }
    }
    return 'text-base-content/50';
  };

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return time.toLocaleDateString();
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notif => 
    filter === 'all' || notif.type === filter
  );

  // Get unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setShowDropdown(false);
  };

  // Delete notification
  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  return (
    <>
      {/* Notification Bell */}
      <div className="dropdown dropdown-end">
        <div 
          tabIndex={0} 
          role="button" 
          className="btn btn-ghost btn-circle"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="indicator">
            <RiBellLine className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="badge badge-sm badge-error indicator-item">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        </div>
        
        {showDropdown && (
          <div className="dropdown-content z-[1] card card-compact w-80 p-2 shadow-xl bg-base-100 border">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Notifications</h3>
                <button 
                  className="btn btn-sm btn-ghost"
                  onClick={() => setShowDropdown(false)}
                >
                  <RiCloseLine />
                </button>
              </div>
              
              {/* Filter tabs */}
              <div className="tabs tabs-boxed tabs-sm mb-4">
                <a 
                  className={`tab ${filter === 'all' ? 'tab-active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All
                </a>
                <a 
                  className={`tab ${filter === 'milestone' ? 'tab-active' : ''}`}
                  onClick={() => setFilter('milestone')}
                >
                  Timeline
                </a>
                <a 
                  className={`tab ${filter === 'document' ? 'tab-active' : ''}`}
                  onClick={() => setFilter('document')}
                >
                  Documents
                </a>
                <a 
                  className={`tab ${filter === 'payment' ? 'tab-active' : ''}`}
                  onClick={() => setFilter('payment')}
                >
                  Payments
                </a>
              </div>

              {/* Notifications list */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map(notif => {
                    const IconComponent = getNotificationIcon(notif.type);
                    return (
                      <div 
                        key={notif.id} 
                        className={`p-3 rounded-lg cursor-pointer hover:bg-base-200 ${
                          !notif.read ? 'bg-base-200 border-l-4 border-l-primary' : 'bg-base-100'
                        }`}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <div className="flex items-start gap-3">
                          <IconComponent 
                            className={`mt-1 ${getNotificationColor(notif.type, notif.read)}`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${!notif.read ? 'font-medium' : ''}`}>
                              {notif.message}
                            </p>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-xs text-base-content/50">
                                {notif.project}
                              </p>
                              <p className="text-xs text-base-content/50">
                                {formatTimeAgo(notif.timestamp)}
                              </p>
                            </div>
                          </div>
                          {!notif.read && (
                            <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-base-content/50">
                    <RiNotificationLine className="mx-auto text-4xl mb-2" />
                    <p>No notifications yet</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {unreadCount > 0 && (
                <div className="pt-4 border-t">
                  <button 
                    className="btn btn-sm btn-primary w-full"
                    onClick={markAllAsRead}
                  >
                    <RiMarkPenLine className="w-4 h-4" />
                    Mark All as Read
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="toast toast-top toast-end z-50">
          <div className="alert alert-info">
            <div className="flex-1">
              <div className="text-sm font-medium">{showToast.message}</div>
              <div className="text-xs text-base-content/70">{showToast.project}</div>
            </div>
            <button 
              className="btn btn-sm btn-ghost"
              onClick={() => setShowToast(null)}
            >
              <RiCloseLine />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default NotificationSystem;
