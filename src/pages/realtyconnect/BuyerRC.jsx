import React, { useState, useMemo, memo, useCallback } from 'react';
import { FaUserTie, FaStar } from 'react-icons/fa';
import agentsData from '../../agents.json';

// Memoized Agent Card Component
const AgentCard = memo(({ agent, onViewProfile, renderStars }) => (
  <div className="card bg-base-100 shadow-xl">
    <div className="card-body">
      <div className="flex items-center gap-4">
        <div className="avatar">
          <div className="w-16 h-16 rounded-full">
            <img src={agent.image} alt={agent.name} loading="lazy" />
          </div>
        </div>
        <div>
          <h2 className="card-title">{agent.name}</h2>
          <p className="text-sm opacity-70">{agent.specialization} Specialist</p>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex items-center gap-2">
          {renderStars(agent.rating)}
          <span className="text-sm opacity-70">({agent.rating})</span>
        </div>
        <p className="mt-2">
          <span className="font-semibold">{agent.deals}</span> deals closed
        </p>
      </div>
      
      <div className="card-actions justify-end mt-4">
        <button className="btn btn-primary">Contact Agent</button>
        <button 
          className="btn btn-outline"
          onClick={() => onViewProfile(agent)}
        >
          View Profile
        </button>
      </div>
    </div>
  </div>
));

// Memoized Agent Profile Modal Component
const AgentProfileModal = memo(({ selectedAgent, onClose, renderStars }) => {
  if (!selectedAgent) return null;

  return (
    <dialog className="modal modal-bottom sm:modal-middle" open>
      <div className="modal-box bg-base-100 max-w-3xl">
        <div className="flex items-start gap-6">
          <div className="avatar">
            <div className="w-24 h-24 rounded-full ring ring-purple-500 ring-offset-2">
              <img src={selectedAgent.image} alt={selectedAgent.name} loading="lazy" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-purple-500">{selectedAgent.name}</h2>
            <p className="text-base-content/70">{selectedAgent.specialization} Specialist at {selectedAgent.agency}</p>
            <div className="flex items-center gap-2 mt-2">
              {renderStars(selectedAgent.rating)}
              <span className="text-sm opacity-70">({selectedAgent.rating})</span>
            </div>
          </div>
        </div>

        <div className="divider"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact Information</h3>
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <FaUserTie className="text-purple-500" />
                <span className="text-base-content/70">Email:</span>
                <span>{selectedAgent.email}</span>
              </p>
              <p className="flex items-center gap-2">
                <FaStar className="text-purple-500" />
                <span className="text-base-content/70">Experience:</span>
                <span>{selectedAgent.deals} deals closed</span>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Expertise</h3>
            <div className="flex flex-wrap gap-2">
              <span className="badge badge-purple badge-outline">{selectedAgent.specialization}</span>
              <span className="badge badge-purple badge-outline">Property Valuation</span>
              <span className="badge badge-purple badge-outline">Contract Negotiation</span>
              <span className="badge badge-purple badge-outline">Market Analysis</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-3">About</h3>
          <p className="text-base-content/70">
            Professional real estate agent with proven expertise in {selectedAgent.specialization.toLowerCase()} properties. 
            Successfully closed {selectedAgent.deals} deals, maintaining a {selectedAgent.rating}/5 client satisfaction rating. 
            Specializes in providing comprehensive property solutions and exceptional client service.
          </p>
        </div>

        <div className="modal-action">
          <button className="btn btn-primary gap-2">
            <FaUserTie />
            Schedule Meeting
          </button>
          <button 
            className="btn btn-ghost"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/20" onClick={onClose}></div>
    </dialog>
  );
});

function BuyerRC() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Optimized agent data processing
  const agents = useMemo(() => {
    return agentsData.map((agent, index) => {
      let image;
      
      if (index === 0) {
        image = "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4";
      } else {
        const professionalPhotos = [
          'https://images.unsplash.com/photo-1560250097-0b93528c311a',
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
          'https://images.unsplash.com/photo-1580489944761-15a19d654956',
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
          'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79',
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
          'https://randomuser.me/api/portraits/men/41.jpg',
          'https://randomuser.me/api/portraits/women/42.jpg',
          'https://randomuser.me/api/portraits/men/43.jpg',
          'https://randomuser.me/api/portraits/women/44.jpg'
        ];
        
        const uniqueIndex = index % professionalPhotos.length;
        image = professionalPhotos[uniqueIndex];
      }

      let specialization = ['Residential', 'Commercial', 'Industrial'][Math.floor(Math.random() * 3)];
      let rating = (Math.random() * (5 - 4) + 4).toFixed(1);
      let deals = Math.floor(Math.random() * (50 - 10) + 10);

      if (agent.name === 'Sarah Garcia') {
        specialization = 'Residential';
        rating = '4.8';
        deals = 32;
      }

      return {
        ...agent,
        specialization,
        rating,
        deals,
        image,
        ...(agent.name === 'Sarah Garcia' && {
          agency: 'RealiTech Realty',
          email: 'sarah@realitech.com'
        })
      };
    });
  }, [agentsData]);

  // Optimized filtered agents with early exit
  const filteredAgents = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    const filterLower = selectedFilter.toLowerCase();
    
    return agents.filter(agent => {
      // Check specialization first (cheaper operation)
      if (selectedFilter !== 'all' && 
          (agent.specialization || '').toLowerCase() !== filterLower) {
        return false;
      }
      
      // Only check search if needed
      return !searchQuery || (
        (agent.name || '').toLowerCase().includes(searchLower) ||
        (agent.email || '').toLowerCase().includes(searchLower) ||
        (agent.agency || '').toLowerCase().includes(searchLower)
      );
    });
  }, [agents, searchQuery, selectedFilter]);

  // Optimized star rendering with cached stars
  const renderStars = useCallback((rating) => {
    const stars = [];
    const filled = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={i < filled ? 'text-yellow-400' : 'text-gray-300'}
        />
      );
    }
    return stars;
  }, []);

  // Stable callbacks
  const handleViewProfile = useCallback((agent) => {
    setSelectedAgent(agent);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedAgent(null);
  }, []);

  // Search handler
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Filter handler
  const handleFilterChange = useCallback((e) => {
    setSelectedFilter(e.target.value);
  }, []);

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search agents..."
          className="input input-bordered w-full md:w-96"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <select
          className="select select-bordered w-full md:w-48"
          value={selectedFilter}
          onChange={handleFilterChange}
        >
          <option value="all">All Specializations</option>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
          <option value="industrial">Industrial</option>
        </select>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <AgentCard 
            key={agent.id} 
            agent={agent}
            onViewProfile={handleViewProfile}
            renderStars={renderStars}
          />
        ))}
      </div>

      {/* Conditionally rendered modal */}
      {selectedAgent && (
        <AgentProfileModal 
          selectedAgent={selectedAgent}
          onClose={handleCloseModal}
          renderStars={renderStars}
        />
      )}
    </div>
  );
}

export default memo(BuyerRC);