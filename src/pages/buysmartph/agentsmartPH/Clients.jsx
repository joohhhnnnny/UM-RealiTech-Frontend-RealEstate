import { useState } from 'react'; 
import { motion } from "framer-motion";
import { 
  RiTeamLine,
  RiMessageLine,
  RiPhoneLine,
  RiMailLine
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Client Management</h2>
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm">Filter</button>
          <button className="btn btn-primary btn-sm">Add New Client</button>
        </div>
      </div>

      {/* Client Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clientRequests.map((client) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card bg-base-100 shadow-lg border border-base-200 hover:shadow-xl transition-all duration-300"
          >
            <div className="card-body p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-12 rounded-full">
                      <img src={client.avatar} alt={client.name} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{client.name}</h3>
                    <p className="text-sm text-base-content/70">{client.type}</p>
                  </div>
                </div>
                <div className="badge badge-success">
                  {client.match} Match
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/70">Budget:</span>
                  <span className="font-medium">{client.budget}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/70">Location:</span>
                  <span className="font-medium">{client.location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/70">Status:</span>
                  <span className="badge badge-outline badge-sm">{client.status}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="btn btn-primary btn-sm flex-1">
                  <RiMessageLine className="w-4 h-4" />
                  Message
                </button>
                <button className="btn btn-outline btn-sm">
                  <RiPhoneLine className="w-4 h-4" />
                </button>
                <button className="btn btn-outline btn-sm">
                  <RiMailLine className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-base-content/60 mt-2">
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