


import React, { useState, useEffect } from 'react';
import { FaUserTie, FaStar } from 'react-icons/fa';

function BuyerRC() {
  const [agents, setAgents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Simulated agents data - replace with actual API call
  useEffect(() => {
    const mockAgents = [
      {
        id: 1,
        name: 'Juan Santos',
        specialization: 'Residential',
        rating: 4.8,
        deals: 24,
        image: '/path/to/agent1.jpg'
      },
      // Add more mock agents as needed
    ];
    setAgents(mockAgents);
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
        {agents.map((agent) => (
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