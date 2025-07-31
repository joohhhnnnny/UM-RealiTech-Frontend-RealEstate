import { useState } from 'react';
import { RiCheckDoubleLine, RiMailLine, RiMailOpenLine, RiStarLine, RiBookmarkLine, RiTimeLine } from 'react-icons/ri';
import DashboardNavbar from '../../components/DashboardNavbar';

const Notif = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [isOpen, setIsOpen] = useState(true); // for sidebar state

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
    <div className="flex">
      <DashboardNavbar 
        userRole="buyer" // You might want to pass this as a prop or get from context
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
      
      <main className={`flex-1 p-4 transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="container mx-auto max-w-4xl">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <button className="btn btn-ghost btn-sm gap-2">
              <RiCheckDoubleLine className="w-5 h-5" />
              Mark all as read
            </button>
          </div>

          {/* Tabs Section */}
          <div className="tabs tabs-boxed bg-base-200 p-1 mb-6">
            <button 
              className={`tab flex-1 ${activeTab === 'all' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <RiMailLine className="w-4 h-4 mr-2" />
              All
            </button>
            <button 
              className={`tab flex-1 ${activeTab === 'unread' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('unread')}
            >
              <RiMailOpenLine className="w-4 h-4 mr-2" />
              Unread
            </button>
            <button 
              className={`tab flex-1 ${activeTab === 'important' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('important')}
            >
              <RiStarLine className="w-4 h-4 mr-2" />
              Important
            </button>
            <button 
              className={`tab flex-1 ${activeTab === 'saved' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              <RiBookmarkLine className="w-4 h-4 mr-2" />
              Saved
            </button>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.map((notif) => (
              <div 
                key={notif.id}
                className={`flex items-start gap-4 p-4 rounded-lg border ${
                  notif.isUnread ? 'bg-base-200 border-base-300' : 'bg-base-100 border-base-200'
                }`}
              >
                <div className="text-2xl">{notif.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{notif.title}</h3>
                    {notif.isUnread && (
                      <span className="badge badge-primary badge-sm">New</span>
                    )}
                    {notif.isImportant && (
                      <RiStarLine className="w-4 h-4 text-warning" />
                    )}
                    {notif.isSaved && (
                      <RiBookmarkLine className="w-4 h-4 text-info" />
                    )}
                  </div>
                  <p className="text-base-content/70 text-sm">{notif.message}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-base-content/50">
                    <RiTimeLine className="w-4 h-4" />
                    {notif.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notif;