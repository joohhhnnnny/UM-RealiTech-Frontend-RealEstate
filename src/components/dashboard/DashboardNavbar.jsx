// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';
import {
  RiUserLine, RiLogoutBoxLine, RiNotification3Line,
  RiMessage2Line, RiDashboardLine, RiVerifiedBadgeFill
} from 'react-icons/ri';

function DashboardNavbar({ userRole }) {
  // Add avatar URLs using DiceBear API
  const michaelAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael&backgroundColor=b6e3f4";
  const johnAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=John&backgroundColor=d1d4f9";

  return (
    <div className="navbar h-16 bg-base-100/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-base-200">
      <div className="container mx-auto px-4 flex justify-between items-center w-full">
        
        {/* LEFT - Logo */}
        <Link to="/" className="flex-1">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img 
              src="/src/assets/logo/2-Photoroom (1).png" 
              alt="RealiTech Logo" 
              className='w-[150px] h-[48px] object-contain'
            />
          </motion.div>
        </Link>

        {/* CENTER - Navigation */}
        <div className="hidden lg:flex">
          <Link to="/dashboard" className="btn btn-ghost btn-sm gap-2 text-base font-medium">
            <RiDashboardLine className="w-5 h-5" />
            Overview
          </Link>
        </div>

        {/* RIGHT - Notifications, Messages, Profile */}
        <div className="flex items-center gap-4">

          {/* Notifications */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
              <div className="indicator">
                <RiNotification3Line className="h-5 w-5" />
                <span className="badge badge-xs badge-primary indicator-item">2</span>
              </div>
            </label>
            <div tabIndex={0} className="mt-3 z-[1] card card-compact dropdown-content w-80 bg-base-100 shadow-xl border border-base-200">
              <div className="card-body">
                <h3 className="font-bold text-lg mb-2">Notifications</h3>
                <ul className="space-y-2">
                  <li className="p-3 hover:bg-base-200 rounded-lg cursor-pointer transition">
                    <p className="font-medium">New message from agent</p>
                    <span className="text-xs text-base-content/60">2 minutes ago</span>
                  </li>
                  <li className="p-3 hover:bg-base-200 rounded-lg cursor-pointer transition">
                    <p className="font-medium">Property update</p>
                    <span className="text-xs text-base-content/60">1 hour ago</span>
                  </li>
                </ul>
                <button className="btn btn-primary btn-sm mt-3 w-full">View All</button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
              <div className="indicator">
                <RiMessage2Line className="h-5 w-5" />
                <span className="badge badge-xs badge-primary indicator-item">3</span>
              </div>
            </label>
            <div tabIndex={0} className="mt-3 z-[1] card card-compact dropdown-content w-80 bg-base-100 shadow-xl border border-base-200">
              <div className="card-body">
                <h3 className="font-bold text-lg mb-2">Messages</h3>
                <ul className="space-y-2">
                  {/* Update Messages avatar */}
                  <li className="p-3 hover:bg-base-200 rounded-lg cursor-pointer transition">
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                          <img src={johnAvatar} alt="John Doe" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">John Doe</p>
                        <span className="text-xs text-base-content/60">Hey, is the property still...</span>
                      </div>
                    </div>
                  </li>
                </ul>
                <button className="btn btn-primary btn-sm mt-3 w-full">Open Messages</button>
              </div>
            </div>
          </div>

          {/* Profile */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost px-3 py-1 rounded-full flex items-center gap-3 cursor-pointer">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold">Michael Anderson</span>
                  <RiVerifiedBadgeFill className="text-primary w-4 h-4" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-primary badge-sm capitalize">{userRole}</span>
                  <span className="text-xs text-base-content/70">• Online</span>
                </div>
              </div>
              {/* Update Profile avatar */}
              <div className="avatar">
                <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src={michaelAvatar} alt="Michael Anderson" />
                </div>
              </div>
            </label>
            <ul tabIndex={0} className="dropdown-content menu menu-sm mt-4 w-64 p-2 shadow-xl bg-base-100 rounded-box border border-base-200">
              {/* Update Profile dropdown avatar */}
              <div className="px-4 py-3 border-b border-base-200 flex items-center gap-3">
                <div className="avatar">
                  <div className="w-8 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1">
                    <img src={michaelAvatar} alt="Michael Anderson" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold">Michael Anderson</p>
                  <p className="text-sm text-base-content/70">{userRole}@realitech.com</p>
                </div>
              </div>
              <li>
                <Link to="/dashboard/settings" className="flex items-center gap-2 py-3 hover:bg-base-200">
                  <RiUserLine className="w-4 h-4" />
                  Profile Settings
                </Link>
              </li>
              <div className="divider my-0"></div>
              <li>
                <Link to="/" className="flex items-center gap-2 py-3 text-error hover:bg-error/10">
                  <RiLogoutBoxLine className="w-4 h-4" />
                  Logout
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardNavbar;