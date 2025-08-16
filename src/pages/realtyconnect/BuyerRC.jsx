import React, { useState, useMemo, memo, useCallback, useEffect } from 'react';
import { FaUserTie, FaStar, FaSpinner, FaCheckCircle, FaPhone, FaEnvelope, FaCalendarAlt } from 'react-icons/fa';
import { agentService } from '../../services/realtyConnectService';

// Try to import useAuth, but provide fallback if not available
let useAuth;
try {
  useAuth = require('../../contexts/AuthContext').useAuth;
} catch (error) {
  useAuth = () => ({ currentUser: null });
}

// Memoized Agent Card Component
const AgentCard = memo(({ agent, onViewProfile, onContactAgent, renderStars }) => (
  <div className="card bg-base-100 shadow-xl">
    <div className="card-body">
      <div className="flex items-center gap-4">
        <div className="avatar">
          <div className="w-16 h-16 rounded-full">
            <img src={agent.image || '/default-avatar.png'} alt={agent.name} loading="lazy" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="card-title">{agent.name}</h2>
            <FaCheckCircle className="text-success w-4 h-4" title="Verified Agent" />
          </div>
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
        <button 
          className="btn btn-primary"
          onClick={() => onContactAgent(agent)}
        >
          Contact Agent
        </button>
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
const AgentProfileModal = memo(({ selectedAgent, onClose, onScheduleMeeting, onContactAgent, renderStars, connectionLoading }) => {
  if (!selectedAgent) return null;

  return (
    <dialog className="modal modal-bottom sm:modal-middle" open>
      <div className="modal-box bg-base-100 max-w-3xl">
        <div className="flex items-start gap-6">
          <div className="avatar">
            <div className="w-24 h-24 rounded-full ring ring-purple-500 ring-offset-2">
              <img src={selectedAgent.image || '/default-avatar.png'} alt={selectedAgent.name} loading="lazy" />
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
                <FaEnvelope className="text-purple-500" />
                <span className="text-base-content/70">Email:</span>
                <span>{selectedAgent.email}</span>
              </p>
              <p className="flex items-center gap-2">
                <FaUserTie className="text-purple-500" />
                <span className="text-base-content/70">Agency:</span>
                <span>{selectedAgent.agency || 'RealiTech Realty'}</span>
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
            {selectedAgent.bio || `Professional real estate agent with proven expertise in ${selectedAgent.specialization?.toLowerCase()} properties. 
            Successfully closed ${selectedAgent.deals} deals, maintaining a ${selectedAgent.rating}/5 client satisfaction rating. 
            Specializes in providing comprehensive property solutions and exceptional client service.`}
          </p>
        </div>

        <div className="modal-action">
          <button 
            className="btn btn-primary gap-2"
            onClick={() => onScheduleMeeting(selectedAgent)}
            disabled={connectionLoading}
          >
            {connectionLoading ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaCalendarAlt />
            )}
            Schedule Meeting
          </button>
          <button 
            className="btn btn-secondary gap-2"
            onClick={() => onContactAgent(selectedAgent)}
            disabled={connectionLoading}
          >
            {connectionLoading ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaEnvelope />
            )}
            Contact Agent
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
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const { currentUser } = useAuth(); // Get current user from auth context

  // Load agents from Firebase
  useEffect(() => {
    const loadAgents = async () => {
      try {
        setLoading(true);
        // Subscribe to verified agents only
        const unsubscribe = agentService.subscribeToVerifiedAgents((verifiedAgents) => {
          setAgents(verifiedAgents);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (err) {
        console.error('Error loading agents:', err);
        setError('Failed to load agents');
        setLoading(false);
      }
    };

    loadAgents();
  }, []);

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

  const handleContactAgent = useCallback(async (agent) => {
    if (connectionLoading) return;
    
    setConnectionLoading(true);
    try {
      const buyerId = currentUser?.uid || 'demo-buyer-user';
      
      // Create a connection record in Firebase
      await agentService.createConnection({
        buyerId,
        agentId: agent.userId || agent.id,
        agentName: agent.name,
        agentEmail: agent.email,
        buyerName: currentUser?.displayName || 'Buyer User',
        buyerEmail: currentUser?.email || 'buyer@realitech.com',
        connectionType: 'contact',
        status: 'initiated',
        message: `${currentUser?.displayName || 'A buyer'} is interested in contacting you regarding real estate services.`,
        createdAt: new Date()
      });
      
      // Show success message with contact details
      alert(`✅ Connection request sent to ${agent.name}!\n\n` +
            `📧 Email: ${agent.email}\n` +
            `📱 You can now contact them directly.\n\n` +
            `The agent has been notified of your interest.`);
            
      console.log(`Buyer-Agent connection created: ${buyerId} -> ${agent.name}`);
    } catch (error) {
      console.error('Error creating connection:', error);
      alert(`❌ Failed to connect with ${agent.name}. Please try again.`);
    }
    setConnectionLoading(false);
  }, [currentUser, connectionLoading]);

  const handleScheduleMeeting = useCallback(async (agent) => {
    if (connectionLoading) return;
    
    setConnectionLoading(true);
    try {
      const buyerId = currentUser?.uid || 'demo-buyer-user';
      
      // Create a meeting request in Firebase
      await agentService.createConnection({
        buyerId,
        agentId: agent.userId || agent.id,
        agentName: agent.name,
        agentEmail: agent.email,
        buyerName: currentUser?.displayName || 'Buyer User',
        buyerEmail: currentUser?.email || 'buyer@realitech.com',
        connectionType: 'meeting',
        status: 'requested',
        message: `${currentUser?.displayName || 'A buyer'} would like to schedule a meeting with you to discuss real estate services.`,
        requestedDate: new Date(),
        createdAt: new Date()
      });
      
      // Show success message
      alert(`✅ Meeting request sent to ${agent.name}!\n\n` +
            `📅 Meeting request has been submitted\n` +
            `📧 Agent will contact you at: ${currentUser?.email || 'your email'}\n` +
            `⏰ They will reach out to schedule a convenient time.\n\n` +
            `You can also contact them directly at: ${agent.email}`);
            
      console.log(`Meeting request created: ${buyerId} -> ${agent.name}`);
      setSelectedAgent(null);
    } catch (error) {
      console.error('Error creating meeting request:', error);
      alert(`❌ Failed to schedule meeting with ${agent.name}. Please try again.`);
    }
    setConnectionLoading(false);
  }, [currentUser, connectionLoading]);

  // Search handler
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Filter handler
  const handleFilterChange = useCallback((e) => {
    setSelectedFilter(e.target.value);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="animate-spin text-4xl text-purple-500" />
        <span className="ml-2 text-lg">Loading agents...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
        <button 
          className="btn btn-sm btn-outline"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

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

      {/* Results count */}
      <div className="text-sm opacity-70">
        Showing {filteredAgents.length} of {agents.length} agents
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <AgentCard 
            key={agent.id} 
            agent={agent}
            onViewProfile={handleViewProfile}
            onContactAgent={handleContactAgent}
            renderStars={renderStars}
          />
        ))}
      </div>

      {/* No results message */}
      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg opacity-70">No agents found matching your criteria</p>
          <button 
            className="btn btn-outline mt-4"
            onClick={() => {
              setSearchQuery('');
              setSelectedFilter('all');
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Conditionally rendered modal */}
      {selectedAgent && (
        <AgentProfileModal 
          selectedAgent={selectedAgent}
          onClose={handleCloseModal}
          onScheduleMeeting={handleScheduleMeeting}
          onContactAgent={handleContactAgent}
          renderStars={renderStars}
          connectionLoading={connectionLoading}
        />
      )}
    </div>
  );
}

export default memo(BuyerRC);
