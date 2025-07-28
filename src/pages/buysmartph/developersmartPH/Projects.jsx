import { motion } from "framer-motion";
import { RiBuildingLine, RiMapPinLine, RiEyeLine, RiSettings4Line } from 'react-icons/ri';

function Projects() {
  // Static project data (no props required)
  const projects = [
    {
      id: 1,
      name: "Viva Homes Townhouse",
      location: "Quezon City",
      totalUnits: 48,
      soldUnits: 32,
      avgPrice: "₱2.8M",
      status: "Active",
      completion: 75,
      launchDate: "2024-01-15",
      completionDate: "2025-06-30",
      image: "https://via.placeholder.com/300x200?text=Viva+Homes"
    },
    {
      id: 2,
      name: "Metro Heights Condominium",
      location: "Makati City",
      totalUnits: 156,
      soldUnits: 98,
      avgPrice: "₱8.2M",
      status: "Active",
      completion: 45,
      launchDate: "2024-03-01",
      completionDate: "2026-12-15",
      image: "https://via.placeholder.com/300x200?text=Metro+Heights"
    },
    {
      id: 3,
      name: "Garden Residences",
      location: "BGC, Taguig",
      totalUnits: 84,
      soldUnits: 67,
      avgPrice: "₱12.5M",
      status: "Pre-selling",
      completion: 20,
      launchDate: "2024-06-01",
      completionDate: "2027-03-30",
      image: "https://via.placeholder.com/300x200?text=Garden+Residences"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Project Portfolio</h2>
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm">Filter</button>
          <button className="btn btn-primary btn-sm">
            <RiBuildingLine className="w-4 h-4 mr-2" />
            New Project
          </button>
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card bg-base-100 shadow-lg border border-base-200 hover:shadow-xl transition-all duration-300"
          >
            {/* Project Image */}
            <figure className="h-48 overflow-hidden">
              <img 
                src={project.image} 
                alt={project.name}
                className="w-full h-full object-cover"
              />
            </figure>

            {/* Project Details */}
            <div className="card-body p-6">
              {/* Title + Status */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">{project.name}</h3>
                  <p className="text-sm text-base-content/70 flex items-center gap-1">
                    <RiMapPinLine className="w-4 h-4" />
                    {project.location}
                  </p>
                </div>
                <div className={`badge ${project.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                  {project.status}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-base-200/50 rounded-lg">
                  <div className="text-lg font-bold">{project.totalUnits}</div>
                  <div className="text-xs text-base-content/70">Total Units</div>
                </div>
                <div className="text-center p-3 bg-base-200/50 rounded-lg">
                  <div className="text-lg font-bold">{project.soldUnits}</div>
                  <div className="text-xs text-base-content/70">Units Sold</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Construction Progress</span>
                  <span>{project.completion}%</span>
                </div>
                <div className="w-full h-2 bg-base-200 rounded-full">
                  <div 
                    className="h-2 bg-primary rounded-full"
                    style={{ width: `${project.completion}%` }}
                  />
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-base-content/70">Avg Price:</span>
                  <span className="font-medium">{project.avgPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/70">Sales Rate:</span>
                  <span className="font-medium">
                    {Math.round((project.soldUnits/project.totalUnits)*100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/70">Completion:</span>
                  <span className="font-medium">{project.completionDate}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <button className="btn btn-primary btn-sm flex-1">
                  <RiEyeLine className="w-4 h-4" />
                  View Details
                </button>
                <button className="btn btn-outline btn-sm">
                  <RiSettings4Line className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Projects;