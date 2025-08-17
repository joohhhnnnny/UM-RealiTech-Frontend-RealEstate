import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { RiUserLine } from "react-icons/ri";
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import lightLogo from '/src/assets/logo/logo-for-light.png';
import darkLogo from '/src/assets/logo/logo-for-dark.png';

function Navbar() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(prev => {
      const newTheme = !prev ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      return !prev;
    });
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setIsDark(savedTheme === 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Properties', path: '/properties' }
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 border-b backdrop-blur-md bg-base-100 border-base-200 shadow-sm"
    >
      
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* logo left side */}
          <Link to="/" className="flex-1">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <img 
                src={isDark ? darkLogo : lightLogo}
                alt="RealiTech Logo" 
                className='w-[150px] h-[48px] object-contain'
              />
            </motion.div>
          </Link>

          {/* links center */}
          <div className="hidden lg:flex flex-[2] justify-center ml-0 mr-33">
            <ul className="flex items-center space-x-30">
              {navItems.map((item) => (
                <motion.li 
                  key={item.name}
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Link 
                    to={item.path}
                    className="text-base-content hover:text-primary font-medium 
                             transition-colors duration-300 relative group"
                  >
                    {item.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary 
                                   transition-all duration-300 group-hover:w-full">
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* right side */}
          <div className="hidden lg:flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="btn btn-circle btn-ghost hover:bg-base-200 border border-base-300"
            >
              {isDark ? (
                <SunIcon className="w-5 h-5 text-yellow-500" />
              ) : (
                <MoonIcon className="w-5 h-5 text-base-content" />
              )}
            </motion.button>

            {/* Login Button - Redirect to LoginSignup page */}
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary rounded-full cursor-pointer shadow-md hover:shadow-lg transition-all duration-200"
              >
                <RiUserLine className="w-5 h-5" />
                <span className="font-medium">Login</span>
              </motion.button>
            </Link>
          </div>

          {/* Mobile Dropdown */}
          <div className="dropdown dropdown-end lg:hidden">
            <motion.label 
              whileTap={{ scale: 0.9 }}
              tabIndex={0} 
              className="btn btn-ghost btn-circle hover:bg-base-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-800'}`} fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.label>

            <ul tabIndex={0} className="menu dropdown-content mt-3 z-[1] p-4 shadow-2xl bg-base-100 rounded-box w-52 border border-base-300">
              {/* Dark Theme Toggle */}
              <li>
                <button 
                  onClick={toggleTheme}
                  className="flex items-center gap-3 text-base-content hover:text-primary hover:bg-base-200 rounded-lg transition-all duration-200"
                >
                  {isDark ? (
                    <>
                      <SunIcon className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium">Light Mode</span>
                    </>
                  ) : (
                    <>
                      <MoonIcon className="w-5 h-5 text-base-content" />
                      <span className="font-medium">Dark Mode</span>
                    </>
                  )}
                </button>
              </li>

              <div className="divider my-2"></div>

              {/* Menu Items */}
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.path}
                    className="text-base-content hover:text-primary hover:bg-base-200 rounded-lg transition-all duration-200 font-medium"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}

              <div className="divider my-2"></div>

              {/* Mobile Login Button */}
              <li>
                <Link 
                  to="/login"
                  className="btn btn-primary rounded-full cursor-pointer w-full flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <RiUserLine className="w-5 h-5" />
                  <span className="font-medium">Login</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

export default Navbar;