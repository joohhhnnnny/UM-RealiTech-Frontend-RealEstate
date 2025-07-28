


import React, { useState, useEffect } from 'react';
import { FaUserTie, FaStar } from 'react-icons/fa';
import agentsData from '../../agents.json';

function BuyerRC() {
  const [agents, setAgents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    // Transform the agents data to include additional properties
    const enhancedAgents = agentsData.map((agent, index) => {
      let image;
      
      // Assign Sarah Garcia's avatar to the first agent in the list
      if (index === 0) {
        image = "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4";
      } else {
        // For other agents, use unique professional photos
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
        
        // Use index to ensure each agent gets a unique photo
        const uniqueIndex = index % professionalPhotos.length;
        image = professionalPhotos[uniqueIndex];
      }

      // Special treatment for Sarah Garcia
      let specialization = ['Residential', 'Commercial', 'Industrial'][Math.floor(Math.random() * 3)];
      let rating = (Math.random() * (5 - 4) + 4).toFixed(1);
      let deals = Math.floor(Math.random() * (50 - 10) + 10);

      if (agent.name === 'Sarah Garcia') {
        specialization = 'Residential';
        rating = '4.8';
        deals = 32; // Match with the AgentDashboard stats
      }

      return {
        ...agent,
        specialization,
        rating,
        deals,
        image,
        // Add additional info for Sarah Garcia
        ...(agent.name === 'Sarah Garcia' && {
          agency: 'RealiTech Realty',
          email: 'sarah@realitech.com'
        })
      };
    });
    setAgents(enhancedAgents);
  }, []);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search agents..."
          className="input input-bordered w-full md:w-96"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="select select-bordered w-full md:w-48"
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
        >
          <option value="all">All Specializations</option>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
          <option value="industrial">Industrial</option>
        </select>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents
          .filter(agent => 
            (selectedFilter === 'all' || agent.specialization.toLowerCase() === selectedFilter) &&
            (agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             agent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
             agent.agency.toLowerCase().includes(searchQuery.toLowerCase()))
          )
          .map((agent) => (
          <div key={agent.id} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-4">
                <div className="avatar">
                  <div className="w-16 h-16 rounded-full">
                    <img src={agent.image} alt={agent.name} />
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
                <button className="btn btn-outline">View Profile</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BuyerRC;