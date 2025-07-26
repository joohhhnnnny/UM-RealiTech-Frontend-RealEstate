import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useLocation, Navigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { 
  RiTeamLine,
  RiUserStarLine,
  RiBarChartBoxLine,
  RiCalendarCheckLine,
  RiCheckboxCircleLine,
  RiSearchLine,
  RiFilterLine,
  RiMailLine,
  RiPhoneLine,
  RiGlobalLine,
  RiBuildingLine,
  RiStarFill,
  RiStarLine,
  RiMapPinLine,
  RiVerifiedBadgeFill
} from 'react-icons/ri';
import agentsData from '../../agents.json';
import developersData from '../../developers.json';

function RealtyConnect() {
  const location = useLocation();
  const userRole = location.state?.userRole || "buyer";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [sortBy, setSortBy] = useState("rating");

  // Helper functions
  const renderStars = useCallback((rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<RiStarFill key={i} className="w-4 h-4 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<RiStarFill key={i} className="w-4 h-4 text-yellow-400 opacity-50" />);
      } else {
        stars.push(<RiStarLine key={i} className="w-4 h-4 text-yellow-400" />);
      }
    }
    return stars;
  }, []);

  const calculateStats = useCallback((profiles) => {
    if (!profiles.length) return { totalTransactions: 0, averageRating: '0.0' };
    
    const totalTransactions = profiles.reduce((sum, profile) => 
      sum + (profile.type === 'agent' ? profile.transactions : profile.projects), 0
    );
    const averageRating = (profiles.reduce((sum, profile) => 
      sum + parseFloat(profile.rating), 0) / profiles.length).toFixed(1);
    
    return { totalTransactions, averageRating };
  }, []);

  // Combine and format profiles
  useEffect(() => {
    const agentProfiles = agentsData.map((agent, index) => ({
      ...agent,
      type: 'agent',
      rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3-5
      transactions: Math.floor(Math.random() * 50) + 10, // Random transactions
      specialties: ['Residential', 'Commercial', 'Luxury'].sort(() => Math.random() - 0.5).slice(0, 2),
      verified: Math.random() > 0.3, // 70% chance of being verified
      image: `https://randomuser.me/api/portraits/${index % 2 ? 'women' : 'men'}/${index + 1}.jpg`
    }));

    const developerProfiles = developersData.map((developer, index) => ({
      ...developer,
      type: 'developer',
      rating: (Math.random() * 1 + 4).toFixed(1), // Random rating between 4-5
      projects: Math.floor(Math.random() * 20) + 5, // Random number of projects
      specialties: ['High-rise', 'Townships', 'Condominiums', 'Commercial'].sort(() => Math.random() - 0.5).slice(0, 2),
      verified: true, // All developers are verified
      image: `https://images.unsplash.com/photo-${[
        '1560250097-0b93528c311a', // professional looking people
        '1573496359142-b8d87734a5a2',
        '1573497019940-1c28c88b4f3e',
        '1559989709-054e6ee97772',
        '1556157382-97eda2f9e067'
      ][index]}?auto=format&fit=crop&w=150&h=150&q=80`
    }));

    const allProfiles = [...agentProfiles, ...developerProfiles];
    
    // Filter and sort profiles
    let filtered = allProfiles;
    
    if (selectedType !== "all") {
      filtered = filtered.filter(profile => profile.type === selectedType);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(profile =>
        profile.name.toLowerCase().includes(query) ||
        profile.specialties.some(s => s.toLowerCase().includes(query)) ||
        (profile.agency && profile.agency.toLowerCase().includes(query))
      );
    }

    // Sort profiles
    switch (sortBy) {
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "transactions":
        filtered.sort((a, b) => (b.transactions || b.projects) - (a.transactions || a.projects));
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    setFilteredProfiles(filtered);
  }, [searchQuery, selectedType, sortBy]);



  return (
    <DashboardLayout userRole={userRole}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-base-100 p-4"
      >
        <div className="container mx-auto max-w-[1400px] px-4">
          {/* Hero Section */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="card bg-gradient-to-r from-purple-500/90 to-purple-600 shadow-lg overflow-hidden backdrop-blur-xl mb-8"
          >
            <div className="card-body p-8">
              <div className="flex items-center gap-4 mb-4">
                <RiTeamLine className="w-8 h-8 text-primary-content" />
                <h1 className="text-3xl font-bold text-primary-content">RealtyConnect</h1>
              </div>
              <p className="text-xl text-primary-content/90 max-w-2xl">
                Connect with top real estate professionals and grow your network
              </p>
            </div>
          </motion.div>

          {/* Search and Filter Section */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="flex-1">
              <div className="join w-full">
                <div className="join-item flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search by name, specialty, or agency..."
                    className="input input-bordered w-full pr-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <RiSearchLine className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/50" />
                </div>
                <select 
                  className="select select-bordered join-item w-40"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="all">All Profiles</option>
                  <option value="agent">Agents Only</option>
                  <option value="developer">Developers Only</option>
                </select>
                <select 
                  className="select select-bordered join-item w-40"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="rating">Top Rated</option>
                  <option value="transactions">Most Active</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Profile Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <AnimatePresence>
              {filteredProfiles.map((profile) => (
                <motion.div
                  key={profile.id}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="card bg-base-100 shadow-lg border border-base-200 hover:border-primary/20 transition-colors"
                >
                  <div className="card-body p-6">
                    <div className="flex items-start gap-4">
                      <div className="avatar">
                        <div className="w-16 h-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                          <img 
                            src={profile.image} 
                            alt={profile.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`;
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold">{profile.name}</h3>
                          {profile.verified && (
                            <RiVerifiedBadgeFill className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-base-content/70 mt-1">
                          <RiBuildingLine className="w-4 h-4" />
                          <span>{profile.type === 'agent' ? profile.agency : 'Developer'}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center">
                            {renderStars(parseFloat(profile.rating))}
                            <span className="ml-1 text-sm font-medium">{profile.rating}</span>
                          </div>
                          <span className="text-sm text-base-content/60">
                            • {profile.type === 'agent' ? 
                              `${profile.transactions} transactions` : 
                              `${profile.projects} projects`}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {profile.specialties.map((specialty, index) => (
                            <span 
                              key={index}
                              className="badge badge-sm badge-outline"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="divider my-4"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <a 
                        href={`mailto:${profile.email}`}
                        className="btn btn-sm btn-outline gap-2"
                      >
                        <RiMailLine className="w-4 h-4" />
                        Contact
                      </a>
                      <a 
                        href={profile.website || `tel:${profile.phone}`}
                        className="btn btn-sm btn-primary gap-2"
                      >
                        {profile.website ? (
                          <><RiGlobalLine className="w-4 h-4" />Website</>
                        ) : (
                          <><RiPhoneLine className="w-4 h-4" />Call</>
                        )}
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Stats Section */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="card bg-base-100 shadow-lg border border-base-200"
          >
            <div className="card-body p-6">
              <h2 className="text-2xl font-bold mb-6">Network Overview</h2>
              <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
                <div className="stat">
                  <div className="stat-title">Active Professionals</div>
                  <div className="stat-value text-purple-500">{filteredProfiles.length}</div>
                  <div className="stat-desc">
                    {selectedType === "all" ? "Agents & Developers" : 
                     selectedType === "agent" ? "Real Estate Agents" : "Property Developers"}
                  </div>
                </div>
                <div className="stat">
                  <div className="stat-title">Average Rating</div>
                  <div className="stat-value text-yellow-500">
                    {calculateStats(filteredProfiles).averageRating}
                  </div>
                  <div className="stat-desc">Based on client feedback</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Total Activities</div>
                  <div className="stat-value text-emerald-500">
                    {calculateStats(filteredProfiles).totalTransactions}
                  </div>
                  <div className="stat-desc">Transactions & Projects</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

export default RealtyConnect;