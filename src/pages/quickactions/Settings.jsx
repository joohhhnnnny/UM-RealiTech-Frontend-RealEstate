import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  RiUserLine, 
  RiBellLine, 
  RiLockPasswordLine, 
  RiGlobalLine, 
  RiPaletteLine,
  RiShieldLine,
  RiNotificationLine,
  RiCheckLine
} from 'react-icons/ri';
import DashboardLayout from '../../layouts/DashboardLayout';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    updates: false,
    marketing: false
  });

  const settingsTabs = [
    { id: 'profile', label: 'Profile Settings', icon: RiUserLine },
    { id: 'notifications', label: 'Notifications', icon: RiBellLine },
    { id: 'security', label: 'Security', icon: RiLockPasswordLine },
    { id: 'appearance', label: 'Appearance', icon: RiPaletteLine },
    { id: 'language', label: 'Language', icon: RiGlobalLine },
  ];

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-base-100 p-6"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Settings Navigation */}
            <div className="w-full md:w-64">
              <div className="card bg-base-100 shadow-lg border border-base-200">
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-4">Settings</h2>
                  <div className="flex flex-col gap-2">
                    {settingsTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`btn btn-ghost justify-start gap-3 ${
                          activeTab === tab.id ? 'bg-primary/10 text-primary' : ''
                        }`}
                      >
                        <tab.icon className="w-5 h-5" />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Content */}
            <div className="flex-1">
              <div className="card bg-base-100 shadow-lg border border-base-200">
                <div className="p-6">
                  {activeTab === 'profile' && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold mb-6">Profile Settings</h3>
                      
                      <div className="flex items-center gap-4 mb-8">
                        <div className="avatar">
                          <div className="w-24 h-24 rounded-full">
                            <img src="https://ui-avatars.com/api/?name=John+Doe" alt="Profile" />
                          </div>
                        </div>
                        <button className="btn btn-outline">Change Avatar</button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-control">
                          <label className="label">Full Name</label>
                          <input type="text" className="input input-bordered" defaultValue="John Doe" />
                        </div>
                        <div className="form-control">
                          <label className="label">Email</label>
                          <input type="email" className="input input-bordered" defaultValue="john@example.com" />
                        </div>
                        <div className="form-control">
                          <label className="label">Phone</label>
                          <input type="tel" className="input input-bordered" defaultValue="+1 234 567 890" />
                        </div>
                        <div className="form-control">
                          <label className="label">Location</label>
                          <input type="text" className="input input-bordered" defaultValue="New York, USA" />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'notifications' && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold mb-6">Notification Preferences</h3>
                      
                      <div className="space-y-4">
                        {Object.entries(notifications).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                            <div>
                              <h4 className="font-semibold capitalize">{key} Notifications</h4>
                              <p className="text-sm text-base-content/70">Receive notifications via {key}</p>
                            </div>
                            <input 
                              type="checkbox" 
                              className="toggle toggle-primary" 
                              checked={value}
                              onChange={() => setNotifications(prev => ({...prev, [key]: !prev[key]}))}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'security' && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold mb-6">Security Settings</h3>
                      
                      <div className="space-y-5">
                        <div className="form-control">
                          <label className="label">Current Password</label>
                          <input 
                            type="password" 
                            className="input input-bordered pl-4" // Added pl-4 for padding-left
                            style={{ marginLeft: '3.4rem' }} // Added margin-left
                          />
                        </div>
                        <div className="form-control">
                          <label className="label">New Password</label>
                          <input 
                            type="password" 
                            className="input input-bordered pl-4"
                            style={{ marginLeft: '4.8rem' }}
                          />
                        </div>
                        <div className="form-control">
                          <label className="label">Confirm New Password</label>
                          <input 
                            type="password" 
                            className="input input-bordered pl-4"
                            style={{ marginLeft: '1rem' }}
                          />
                        </div>
                        <button className="btn btn-primary mt-4 ml-4">Update Password</button> {/* Added ml-4 to align with inputs */}
                      </div>

                      <div className="divider"></div>

                      <div className="space-y-4">
                        <h4 className="font-semibold">Two-Factor Authentication</h4>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-base-content/70">Add an extra layer of security</p>
                          </div>
                          <input type="checkbox" className="toggle toggle-primary" />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'appearance' && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold mb-6">Appearance Settings</h3>
                      
                      <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                        <div>
                          <h4 className="font-semibold">Dark Mode</h4>
                          <p className="text-sm text-base-content/70">Toggle dark mode theme</p>
                        </div>
                        <input 
                          type="checkbox" 
                          className="toggle toggle-primary" 
                          checked={isDarkMode}
                          onChange={() => setIsDarkMode(!isDarkMode)}
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'language' && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold mb-6">Language Settings</h3>
                      
                      <div className="form-control">
                        <label className="label">Select Language</label>
                        <select 
                          className="select select-bordered w-full max-w-xs pl-4" 
                          style={{ marginLeft: '1rem' }}
                        >
                          <option>English</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>German</option>
                          <option>Chinese</option>
                          <option>Japanese</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Save Button */}
                  <div className="mt-8 flex justify-end">
                    <button className="btn btn-primary gap-2">
                      <RiCheckLine className="w-5 h-5" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Settings;