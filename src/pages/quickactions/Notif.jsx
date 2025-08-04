import { useState, useEffect } from 'react';
import { RiCheckDoubleLine, RiMailLine, RiMailOpenLine, RiStarLine, RiBookmarkLine, RiTimeLine } from 'react-icons/ri';
import DashboardNavbar from '../../components/Sidebar';

const Notif = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [isOpen, setIsOpen] = useState(true); // for sidebar state

  // Watch for theme changes to ensure components adapt properly
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          // Force re-render when theme changes by updating a dummy state
          setActiveTab(prev => prev); // This triggers a re-render
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  // Dummy notification data
  const notifications = [
    {
      id: 1,
      title: "New Property Listed",
      message: "A new property matching your preferences has been listed in Makati City.",
      time: "2 minutes ago",
      isUnread: true,
      isImportant: true,
      isSaved: false,
      icon: "🏢"
    },
    {
      id: 2,
      title: "Price Drop Alert",
      message: "A property you're watching has dropped in price by 15%.",
      time: "1 hour ago",
      isUnread: true,
      isImportant: false,
      isSaved: true,
      icon: "💰"
    },
    {
      id: 3,
      title: "Document Verification",
      message: "Your submitted documents have been verified successfully.",
      time: "2 hours ago",
      isUnread: false,
      isImportant: true,
      isSaved: true,
      icon: "📄"
    },
    {
      id: 4,
      title: "Meeting Reminder",
      message: "Virtual property viewing scheduled for tomorrow at 2 PM.",
      time: "5 hours ago",
      isUnread: true,
      isImportant: false,
      isSaved: false,
      icon: "📅"
    }
  ];

  const filteredNotifications = notifications.filter(notif => {
    switch(activeTab) {
      case 'unread':
        return notif.isUnread;
      case 'important':
        return notif.isImportant;
      case 'saved':
        return notif.isSaved;
      default:
        return true;
    }
  });

  return (
    <div className="flex min-h-screen bg-base-100">
      <DashboardNavbar 
        userRole="buyer" // You might want to pass this as a prop or get from context
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
      
      <main className={`flex-1 p-4 transition-all duration-300 bg-base-100 ${isOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="container mx-auto max-w-4xl">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-base-content">Notifications</h1>
            <button className="btn btn-ghost btn-sm gap-2 hover:bg-base-200">
              <RiCheckDoubleLine className="w-5 h-5" />
              Mark all as read
            </button>
          </div>

          {/* Tabs Section */}
          <div className="tabs tabs-boxed bg-base-200/80 backdrop-blur-sm p-1 mb-6 border border-base-300/20">
            <button 
              className={`tab flex-1 transition-all duration-200 ${
                activeTab === 'all' 
                  ? 'tab-active bg-base-100 text-base-content shadow-sm' 
                  : 'text-base-content/70 hover:text-base-content hover:bg-base-300/30'
              }`}
              onClick={() => setActiveTab('all')}
            >
              <RiMailLine className="w-4 h-4 mr-2" />
              All
            </button>
            <button 
              className={`tab flex-1 transition-all duration-200 ${
                activeTab === 'unread' 
                  ? 'tab-active bg-base-100 text-base-content shadow-sm' 
                  : 'text-base-content/70 hover:text-base-content hover:bg-base-300/30'
              }`}
              onClick={() => setActiveTab('unread')}
            >
              <RiMailOpenLine className="w-4 h-4 mr-2" />
              Unread
            </button>
            <button 
              className={`tab flex-1 transition-all duration-200 ${
                activeTab === 'important' 
                  ? 'tab-active bg-base-100 text-base-content shadow-sm' 
                  : 'text-base-content/70 hover:text-base-content hover:bg-base-300/30'
              }`}
              onClick={() => setActiveTab('important')}
            >
              <RiStarLine className="w-4 h-4 mr-2" />
              Important
            </button>
            <button 
              className={`tab flex-1 transition-all duration-200 ${
                activeTab === 'saved' 
                  ? 'tab-active bg-base-100 text-base-content shadow-sm' 
                  : 'text-base-content/70 hover:text-base-content hover:bg-base-300/30'
              }`}
              onClick={() => setActiveTab('saved')}
            >
              <RiBookmarkLine className="w-4 h-4 mr-2" />
              Saved
            </button>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-base-200/50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <RiMailLine className="w-8 h-8 text-base-content/40" />
                </div>
                <h3 className="text-lg font-semibold text-base-content mb-2">No notifications</h3>
                <p className="text-base-content/60 text-sm">
                  {activeTab === 'all' && 'You have no notifications at the moment.'}
                  {activeTab === 'unread' && 'All caught up! No unread notifications.'}
                  {activeTab === 'important' && 'No important notifications found.'}
                  {activeTab === 'saved' && 'No saved notifications found.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-all duration-200 hover:shadow-md backdrop-blur-sm ${
                    notif.isUnread 
                      ? 'bg-base-200/80 border-base-300/60 hover:bg-base-200 hover:border-primary/20' 
                      : 'bg-base-100/80 border-base-200/60 hover:bg-base-100 hover:border-base-300/40'
                  }`}
                >
                  <div className="text-2xl filter drop-shadow-sm">{notif.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base-content">{notif.title}</h3>
                      {notif.isUnread && (
                        <span className="badge badge-primary badge-sm animate-pulse">New</span>
                      )}
                      {notif.isImportant && (
                        <RiStarLine className="w-4 h-4 text-warning drop-shadow-sm" />
                      )}
                      {notif.isSaved && (
                        <RiBookmarkLine className="w-4 h-4 text-info drop-shadow-sm" />
                      )}
                    </div>
                    <p className="text-base-content/70 text-sm leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-base-content/50">
                      <RiTimeLine className="w-4 h-4 flex-shrink-0" />
                      {notif.time}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notif;