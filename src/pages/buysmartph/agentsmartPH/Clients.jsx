import { useState } from 'react'; 
import { motion } from "framer-motion";
import { 
  RiTeamLine,
  RiMessageLine,
  RiPhoneLine,
  RiMailLine,
  RiFilterLine,
  RiUserAddLine
} from 'react-icons/ri';

function Clients() {
  const [clientRequests] = useState([
    {
      id: 1,
      name: "Michael Anderson",
      type: "First Time Buyer",
      budget: "₱3M - ₱5M",
      location: "Quezon City",
      status: "Profile Complete",
      match: "85%",
      lastActive: "2 hours ago",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael&backgroundColor=b6e3f4"
    },
    {
      id: 2,
      name: "Sarah Martinez",
      type: "OFW",
      budget: "₱5M - ₱10M",
      location: "Makati City",
      status: "Document Review",
      match: "92%",
      lastActive: "1 day ago",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=c8f7d4"
    },
    {
      id: 3,
      name: "Roberto Cruz",
      type: "Investor",
      budget: "₱10M+",
      location: "BGC",
      status: "Viewing Scheduled",
      match: "78%",
      lastActive: "3 hours ago",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto&backgroundColor=ffd93d"
    }
  ]);

  return (
    <div className="space-y-8 p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <RiTeamLine className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Client Management</h2>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-outline btn-sm gap-2">
            <RiFilterLine className="w-4 h-4" />
            Filter
          </button>
          <button className="btn btn-primary btn-sm gap-2">
            <RiUserAddLine className="w-4 h-4" />
            Add New Client
          </button>
        </div>
      </div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clientRequests.map((client) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card bg-base-100 shadow-lg border border-base-200 hover:shadow-xl transition-all duration-300"
          >
            <div className="card-body p-6">
              {/* Client Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="avatar">
                    <div className="w-14 h-14 rounded-full ring-2 ring-primary/10">
                      <img src={client.avatar} alt={client.name} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{client.name}</h3>
                    <p className="text-sm text-base-content/70">{client.type}</p>
                  </div>
                </div>
                <div className="badge badge-success badge-lg">
                  {client.match}
                </div>
              </div>

              {/* Client Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-base-content/70">Budget</span>
                  <span className="font-medium">{client.budget}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-base-content/70">Location</span>
                  <span className="font-medium">{client.location}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-base-content/70">Status</span>
                  <span className="badge badge-outline badge-sm">{client.status}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mb-3">
                <button className="btn btn-primary btn-sm flex-1 gap-2">
                  <RiMessageLine className="w-4 h-4" />
                  Message
                </button>
                <div className="flex gap-2">
                  <button className="btn btn-outline btn-sm btn-square">
                    <RiPhoneLine className="w-4 h-4" />
                  </button>
                  <button className="btn btn-outline btn-sm btn-square">
                    <RiMailLine className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Last Active Status */}
              <div className="text-xs text-base-content/60 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                Last active: {client.lastActive}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Clients;