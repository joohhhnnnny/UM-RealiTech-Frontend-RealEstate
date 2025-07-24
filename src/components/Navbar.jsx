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
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
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
      className="sticky top-0 z-50 border-b backdrop-blur-md bg-base-100/85 border-base-200"
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
                src="/src/assets/logo/2-Photoroom (1).png" 
                alt="RealiTech Logo" 
                className='w-[150px] h-[48px] object-contain'
              />
            </motion.div>
          </Link>


          {/* links center */}
          
          <div className="hidden lg:flex flex-[2] justify-center">
            <ul className="flex items-center space-x-8">
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
              className="btn btn-circle btn-ghost"
            >
              {isDark ? (
                <SunIcon className="w-5 h-5 text-amber-500" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </motion.button>

            <div className="dropdown dropdown-end">
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                <label
                  tabIndex={0}
                  className="btn btn-primary rounded-full cursor-pointer"
                >
                  <RiUserLine className="w-5 h-5" />
                  <span>Profile</span>
                </label>
              </motion.div>
              
              <ul tabIndex={0} className="dropdown-content menu mt-3 z-[1] p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-200">
                <li>
                  <Link to="/dashboard/buyer" className="flex items-center gap-2 text-base-content hover:bg-base-200 rounded-lg">
                    <i className="fas fa-user-tie"></i>
                    Buyer
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/agent" className="flex items-center gap-2 text-base-content hover:bg-base-200 rounded-lg">
                    <i className="fas fa-house-user"></i>
                    Agent
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/developer" className="flex items-center gap-2 text-base-content hover:bg-base-200 rounded-lg">
                    <i className="fas fa-building"></i>
                    Developer
                  </Link>
                </li>
              </ul>
            </div>
          </div>




           {/* Mobile Dropdown */}
          <div className="dropdown dropdown-end lg:hidden">
            <motion.label 
              whileTap={{ scale: 0.9 }}
              tabIndex={0} 
              className="btn btn-ghost btn-circle"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.label>

                <ul tabIndex={0} className="menu dropdown-content mt-3 z-[1] p-4 shadow-lg bg-base-100 rounded-box w-52">
                  {/* Dark Theme Toggle */}
                  <li>
                    <button 
                      onClick={toggleTheme}
                      className="flex items-center gap-2 text-base-content"
                    >
                      {isDark ? (
                        <>
                          <SunIcon className="w-5 h-5 text-amber-500" />
                          Light Mode
                        </>
                      ) : (
                        <>
                          <MoonIcon className="w-5 h-5" />
                          Dark Mode
                        </>
                      )}
                    </button>
                  </li>

                  <div className="divider my-1"></div>

                  {/* Menu Items */}
                  {navItems.map((item) => (
                    <li key={item.name}>
                      <Link 
                        to={item.path}
                        className="text-base-content hover:text-primary"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}

                  <li>
                    <Link 
                      className="btn btn-primary rounded-full mt-4" 
                      to="/login"
                    >
                      Profile
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
