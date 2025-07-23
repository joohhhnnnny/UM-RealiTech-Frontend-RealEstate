// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { RiUserLine } from "react-icons/ri";
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

function Navbar() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    // Save preference to localStorage
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  };

  // Load saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setIsDark(savedTheme === 'dark');
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 border-b transition-colors duration-300 backdrop-blur-md"
      style={{ 
        backgroundColor: 'var(--nav-bg)',
        borderColor: 'var(--border-color)'
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* logo left side*/}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex-1"
          >
            <img 
              src="/src/assets/logo/2-Photoroom (1).png" 
              alt="RealiTech Logo" 
              className='w-[150px] h-[48px] object-contain'
            />
          </motion.div>

          {/* links center */}
          <div className="hidden lg:flex flex-[2] justify-center">
            <ul className="flex items-center space-x-8">
              {['Home', 'About Us', 'Properties'].map((item) => (
                <motion.li 
                  key={item}
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <a 
                    href={`#${item.replace(' ', '')}`}
                    className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-300 relative group"
                  >
                    {item}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                  </a>
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
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-300"
            >
              {isDark ? (
                <SunIcon className="w-5 h-5 text-amber-500" />
              ) : (
                <MoonIcon className="w-5 h-5 text-gray-600" />
              )}
            </motion.button>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/login"
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-300 shadow-md hover:shadow-lg"
              >
                <RiUserLine className="w-5 h-5" />
                <span>Profile</span>
              </Link>
            </motion.div>
          </div>

          {/* Mobile Dropdown */}
          <div className="dropdown dropdown-end lg:hidden">
            <motion.label 
              whileTap={{ scale: 0.9 }}
              tabIndex={0} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.label>

            <ul tabIndex={0} className="menu dropdown-content mt-3 z-[1] p-4 shadow-lg bg-white rounded-xl w-52 border border-gray-100">
              {['Home', 'About Us', 'Solution'].map((item) => (
                <motion.li
                  key={item}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <a href={`#${item.replace(' ', '')}`} className="py-2 text-gray-600 hover:text-blue-600">
                    {item}
                  </a>
                </motion.li>
              ))}
              <motion.li whileHover={{ x: 4 }}>
                <Link 
                  className="mt-4 bg-blue-600 text-white rounded-full py-2 px-4 text-center hover:bg-blue-700 transition-colors duration-300" 
                  to="/login"
                >
                  Login/Register
                </Link>
              </motion.li>
            </ul>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

export default Navbar;
