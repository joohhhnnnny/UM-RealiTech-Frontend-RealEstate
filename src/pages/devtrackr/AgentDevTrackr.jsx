import { useState } from 'react';
import { 
  RiContactsLine,
  RiEyeLine
} from 'react-icons/ri';


function AgentDevTrackr() {
  const [activeTab, setActiveTab] = useState('clients');

  const clientProjects = [
    {
      id: 1,
      clientName: "Maria Rodriguez",
      clientEmail: "maria.r@email.com",
      projectName: "Horizon Residences",
      unit: "Unit 12A",
      developer: "Premier Development Corp",
      progress: 76,
      status: "On Track",
      lastContact: "July 24, 2025",
      concerns: 1,
      priority: "medium",
      image: "https://pueblodeoro.com/wp-content/uploads/2017/12/Sakura-1.jpg",
      nextAction: "Schedule site visit",
      commission: "₱480,000",
      commissionStatus: "50% paid"
    },
    {
      id: 2,
      clientName: "John Smith",
      clientEmail: "john.smith@email.com",
      projectName: "Sky Gardens Tower",
      unit: "Unit 25B",
      developer: "Urban Living Inc",
      progress: 92,
      status: "Ahead of Schedule",
      lastContact: "July 23, 2025",
      concerns: 0,
      priority: "low",
      image: "https://abu-dhabi.realestate/wp-content/uploads/2021/08/Sky-Gardens-013.jpg",
      nextAction: "Prepare turnover docs",
      commission: "₱320,000",
      commissionStatus: "75% paid"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Agent Dashboard Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Agent Dashboard</h2>
        <div className="stats bg-base-200 shadow">
          <div className="stat">
            <div className="stat-title">Active Clients</div>
            <div className="stat-value text-primary">24</div>
          </div>
          <div className="stat">
            <div className="stat-title">This Month Sales</div>
            <div className="stat-value text-secondary">₱12.4M</div>
          </div>
          <div className="stat">
            <div className="stat-title">Pending Issues</div>
            <div className="stat-value text-warning">3</div>
          </div>
        </div>
      </div>

      {/* Client Projects */}
      <div>
        <h3 className="text-xl font-bold mb-4">Client Portfolio</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {clientProjects.map((project) => (
            <div key={project.id} className="card bg-base-200 shadow-xl">
              <figure className="h-32">
                <img src={project.image} alt={project.projectName} className="w-full h-full object-cover" />
              </figure>
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{project.clientName}</h3>
                    <p className="text-sm text-base-content/70">{project.clientEmail}</p>
                    <p className="text-sm text-primary font-medium">{project.projectName} - {project.unit}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className={`badge ${project.priority === 'high' ? 'badge-error' : project.priority === 'medium' ? 'badge-warning' : 'badge-success'}`}>
                      {project.priority} priority
                    </div>
                    {project.concerns > 0 && (
                      <div className="badge badge-warning badge-sm">{project.concerns} concern(s)</div>
                    )}
                  </div>
                </div>

                <div className="divider my-2"></div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress:</span>
                    <span className="font-bold text-primary">{project.progress}%</span>
                  </div>
                  <progress className="progress progress-primary w-full" value={project.progress} max="100"></progress>
                  
                  <div className="flex justify-between text-sm">
                    <span>Commission:</span>
                    <span className="font-bold text-success">{project.commission}</span>
                  </div>
                  <div className="text-xs text-base-content/70">{project.commissionStatus}</div>
                </div>

                <div className="bg-base-100 p-3 rounded-lg mt-4">
                  <p className="text-sm"><strong>Next Action:</strong> {project.nextAction}</p>
                  <p className="text-xs text-base-content/70 mt-1">Last Contact: {project.lastContact}</p>
                </div>

                <div className="flex gap-2 mt-4">
                  <button className="btn btn-sm btn-primary flex-1">
                    <RiContactsLine className="w-4 h-4" />
                    Contact
                  </button>
                  <button className="btn btn-sm btn-ghost">
                    <RiEyeLine className="w-4 h-4" />
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AgentDevTrackr;