import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RiBuildingLine, 
  RiMapPinLine, 
  RiEyeLine, 
  RiSettings4Line,
  RiCloseLine,
  RiImageAddLine,
  RiInformationLine,
  RiAddLine,
  RiEditLine
} from 'react-icons/ri';

function Projects() {
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "Viva Homes Townhouse",
      location: "Quezon City",
      totalUnits: 48,
      soldUnits: 32,
      avgPrice: "₱2.8M",
      status: "Active",
      completion: 75,
      completionDate: "2025-06-30",
      image: "https://via.placeholder.com/300x200?text=Viva+Homes",
      description: "Modern townhouse development in Quezon City with excellent amenities",
      startDate: "2023-01-15"
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
      completionDate: "2026-12-15",
      image: "https://via.placeholder.com/300x200?text=Metro+Heights",
      description: "Luxury condominium in the heart of Makati's financial district",
      startDate: "2022-08-01"
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
      completionDate: "2027-03-30",
      image: "https://via.placeholder.com/300x200?text=Garden+Residences",
      description: "Premium green living spaces in Bonifacio Global City",
      startDate: "2024-02-10"
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProject, setNewProject] = useState({
    name: "",
    location: "",
    totalUnits: "",
    avgPrice: "",
    status: "Active",
    completion: 0,
    image: null,
    previewImage: "",
    description: "",
    startDate: "",
    expectedCompletion: ""
  });
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProject(prev => ({
          ...prev,
          image: file,
          previewImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedProject(prev => ({
          ...prev,
          image: file,
          previewImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const triggerEditFileInput = () => {
    editFileInputRef.current.click();
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    
    const newId = Date.now();
    const imageUrl = newProject.previewImage || 
      `https://via.placeholder.com/300x200?text=${encodeURIComponent(newProject.name)}`;
    
    const project = {
      id: newId,
      name: newProject.name,
      location: newProject.location,
      totalUnits: parseInt(newProject.totalUnits),
      soldUnits: 0,
      avgPrice: newProject.avgPrice,
      status: newProject.status,
      completion: parseInt(newProject.completion),
      completionDate: newProject.expectedCompletion || "2025-12-31",
      image: imageUrl,
      description: newProject.description,
      startDate: newProject.startDate
    };
    
    setProjects([project, ...projects]);
    setShowModal(false);
    setNewProject({
      name: "",
      location: "",
      totalUnits: "",
      avgPrice: "",
      status: "Active",
      completion: 0,
      image: null,
      previewImage: "",
      description: "",
      startDate: "",
      expectedCompletion: ""
    });
  };

  const handleEditProject = (e) => {
    e.preventDefault();
    
    const updatedProjects = projects.map(project => {
      if (project.id === selectedProject.id) {
        return {
          ...project,
          name: selectedProject.name,
          location: selectedProject.location,
          totalUnits: parseInt(selectedProject.totalUnits),
          avgPrice: selectedProject.avgPrice,
          status: selectedProject.status,
          completion: parseInt(selectedProject.completion),
          completionDate: selectedProject.expectedCompletion || project.completionDate,
          image: selectedProject.previewImage || project.image,
          description: selectedProject.description,
          startDate: selectedProject.startDate
        };
      }
      return project;
    });
    
    setProjects(updatedProjects);
    setShowEditModal(false);
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  const handleEditClick = (project) => {
    setSelectedProject({
      ...project,
      previewImage: project.image,
      expectedCompletion: project.completionDate
    });
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">
          Project Portfolio
        </h2>
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm">
            Filter
          </button>
          <button 
            className="btn btn-primary btn-sm gap-2"
            onClick={() => setShowModal(true)}
          >
            <RiAddLine className="text-xl" />
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
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            className="card bg-base-100 shadow-lg border border-base-200 hover:shadow-xl transition-all duration-300 ease-in-out"
          >
            <figure className="h-48 overflow-hidden">
              <img 
                src={project.image} 
                alt={project.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </figure>
            <div className="card-body p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg text-primary">{project.name}</h3>
                  <p className="text-sm text-base-content/70 flex items-center gap-1">
                    <RiMapPinLine className="w-4 h-4" />
                    {project.location}
                  </p>
                </div>
                <div className={`badge ${project.status === 'Active' ? 'badge-success' : 'badge-warning'} badge-lg`}>
                  {project.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-base-200/50 rounded-lg hover:scale-103 transition-transform">
                  <div className="text-lg font-bold">{project.totalUnits}</div>
                  <div className="text-xs text-base-content/70">Total Units</div>
                </div>
                <div className="text-center p-3 bg-base-200/50 rounded-lg hover:scale-103 transition-transform">
                  <div className="text-lg font-bold">{project.soldUnits}</div>
                  <div className="text-xs text-base-content/70">Units Sold</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Construction Progress</span>
                  <span>{project.completion}%</span>
                </div>
                <div className="w-full h-2 bg-base-200 rounded-full overflow-hidden">
                  <div 
                    className="h-2 bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${project.completion}%` }}
                  />
                </div>
              </div>

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

              <div className="flex gap-2 mt-4">
                <button 
                  className="btn btn-primary btn-sm flex-1"
                  onClick={() => handleViewDetails(project)}
                >
                  <RiEyeLine className="w-4 h-4" />
                  View Details
                </button>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => handleEditClick(project)}
                >
                  <RiEditLine className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* New Project Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal modal-open">
            <div className="modal-box max-w-4xl relative">
              <button 
                onClick={() => setShowModal(false)}
                className="btn btn-sm btn-circle absolute right-2 top-2"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-bold mb-4">Create New Project</h2>
              
              <form onSubmit={handleCreateProject} className="space-y-4">
                {/* Image Upload Section */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Project Image</span>
                  </label>
                  <div className="flex flex-col items-center gap-2">
                    <div 
                      className="w-full h-48 bg-base-200 rounded-box flex items-center justify-center cursor-pointer overflow-hidden"
                      onClick={triggerFileInput}
                    >
                      {newProject.previewImage ? (
                        <img 
                          src={newProject.previewImage} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-base-content/50">
                          <RiImageAddLine className="w-12 h-12 mb-2" />
                          <span>Click to upload image</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="hidden"
                      accept="image/*"
                    />
                    <button 
                      type="button"
                      onClick={triggerFileInput}
                      className="btn btn-sm btn-outline"
                    >
                      {newProject.previewImage ? "Change Image" : "Select Image"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Project Name *</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newProject.name}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                      placeholder="Enter project name"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Location *</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={newProject.location}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                      placeholder="Enter location"
                      required
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Description</span>
                  </label>
                  <textarea
                    name="description"
                    value={newProject.description}
                    onChange={handleInputChange}
                    className="textarea textarea-bordered w-full"
                    placeholder="Project description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Start Date</span>
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={newProject.startDate}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Expected Completion</span>
                    </label>
                    <input
                      type="date"
                      name="expectedCompletion"
                      value={newProject.expectedCompletion}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Total Units *</span>
                    </label>
                    <input
                      type="number"
                      name="totalUnits"
                      value={newProject.totalUnits}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                      required
                      min="1"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Avg Price *</span>
                    </label>
                    <input
                      type="text"
                      name="avgPrice"
                      value={newProject.avgPrice}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                      required
                      placeholder="₱0.0M"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Status</span>
                    </label>
                    <select
                      name="status"
                      value={newProject.status}
                      onChange={handleInputChange}
                      className="select select-bordered w-full"
                    >
                      <option value="Active">Active</option>
                      <option value="Pre-selling">Pre-selling</option>
                    </select>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Progress (%)</span>
                    </label>
                    <input
                      type="number"
                      name="completion"
                      value={newProject.completion}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div className="modal-action">
                  <button type="submit" className="btn btn-primary">
                    <RiBuildingLine className="w-4 h-4 mr-2" />
                    Create Project
                  </button>
                  <button 
                    type="button" 
                    className="btn"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Project Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedProject && (
          <div className="modal modal-open">
            <div className="modal-box max-w-4xl relative">
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="btn btn-sm btn-circle absolute right-2 top-2"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <RiInformationLine className="text-primary" />
                Project Details: {selectedProject.name}
              </h2>
              
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2">
                  <figure className="h-64 overflow-hidden rounded-box">
                    <img 
                      src={selectedProject.image} 
                      alt={selectedProject.name}
                      className="w-full h-full object-cover"
                    />
                  </figure>
                </div>
                
                <div className="w-full md:w-1/2 space-y-4">
                  <div>
                    <h4 className="font-bold text-lg flex items-center gap-2">
                      <RiMapPinLine className="text-primary" />
                      Location
                    </h4>
                    <p>{selectedProject.location}</p>
                  </div>
                  
                  {selectedProject.description && (
                    <div>
                      <h4 className="font-bold text-lg">Description</h4>
                      <p>{selectedProject.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-base-200/50 p-3 rounded-box">
                      <p className="text-sm text-base-content/70">Total Units</p>
                      <p className="font-bold text-lg">{selectedProject.totalUnits}</p>
                    </div>
                    <div className="bg-base-200/50 p-3 rounded-box">
                      <p className="text-sm text-base-content/70">Units Sold</p>
                      <p className="font-bold text-lg">{selectedProject.soldUnits}</p>
                    </div>
                    <div className="bg-base-200/50 p-3 rounded-box">
                      <p className="text-sm text-base-content/70">Avg Price</p>
                      <p className="font-bold text-lg">{selectedProject.avgPrice}</p>
                    </div>
                    <div className="bg-base-200/50 p-3 rounded-box">
                      <p className="text-sm text-base-content/70">Sales Rate</p>
                      <p className="font-bold text-lg">
                        {Math.round((selectedProject.soldUnits/selectedProject.totalUnits)*100)}%
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-lg">Status</h4>
                    <span className={`badge ${selectedProject.status === 'Active' ? 'badge-success' : 'badge-warning'} badge-lg`}>
                      {selectedProject.status}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-lg">Construction Progress</h4>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{selectedProject.completion}% Complete</span>
                      <span>Target: {selectedProject.completionDate}</span>
                    </div>
                    <div className="w-full h-2 bg-base-200 rounded-full overflow-hidden">
                      <div 
                        className="h-2 bg-primary rounded-full"
                        style={{ width: `${selectedProject.completion}%` }}
                      />
                    </div>
                  </div>
                  
                  {selectedProject.startDate && (
                    <div>
                      <h4 className="font-bold text-lg">Project Timeline</h4>
                      <div className="flex justify-between text-sm">
                        <span>Start Date: {selectedProject.startDate}</span>
                        <span>Completion: {selectedProject.completionDate}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="modal-action">
                <button 
                  className="btn"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Project Modal */}
      <AnimatePresence>
        {showEditModal && selectedProject && (
          <div className="modal modal-open">
            <div className="modal-box max-w-4xl relative">
              <button 
                onClick={() => setShowEditModal(false)}
                className="btn btn-sm btn-circle absolute right-2 top-2"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-bold mb-4">Edit Project: {selectedProject.name}</h2>
              
              <form onSubmit={handleEditProject} className="space-y-4">
                {/* Image Upload Section */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Project Image</span>
                  </label>
                  <div className="flex flex-col items-center gap-2">
                    <div 
                      className="w-full h-48 bg-base-200 rounded-box flex items-center justify-center cursor-pointer overflow-hidden"
                      onClick={triggerEditFileInput}
                    >
                      {selectedProject.previewImage ? (
                        <img 
                          src={selectedProject.previewImage} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-base-content/50">
                          <RiImageAddLine className="w-12 h-12 mb-2" />
                          <span>Click to upload image</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={editFileInputRef}
                      onChange={handleEditImageChange}
                      className="hidden"
                      accept="image/*"
                    />
                    <button 
                      type="button"
                      onClick={triggerEditFileInput}
                      className="btn btn-sm btn-outline"
                    >
                      {selectedProject.previewImage ? "Change Image" : "Select Image"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Project Name *</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={selectedProject.name}
                      onChange={(e) => setSelectedProject({...selectedProject, name: e.target.value})}
                      className="input input-bordered w-full"
                      placeholder="Enter project name"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Location *</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={selectedProject.location}
                      onChange={(e) => setSelectedProject({...selectedProject, location: e.target.value})}
                      className="input input-bordered w-full"
                      placeholder="Enter location"
                      required
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Description</span>
                  </label>
                  <textarea
                    name="description"
                    value={selectedProject.description}
                    onChange={(e) => setSelectedProject({...selectedProject, description: e.target.value})}
                    className="textarea textarea-bordered w-full"
                    placeholder="Project description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Start Date</span>
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={selectedProject.startDate}
                      onChange={(e) => setSelectedProject({...selectedProject, startDate: e.target.value})}
                      className="input input-bordered w-full"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Expected Completion</span>
                    </label>
                    <input
                      type="date"
                      name="expectedCompletion"
                      value={selectedProject.expectedCompletion}
                      onChange={(e) => setSelectedProject({...selectedProject, expectedCompletion: e.target.value})}
                      className="input input-bordered w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Total Units *</span>
                    </label>
                    <input
                      type="number"
                      name="totalUnits"
                      value={selectedProject.totalUnits}
                      onChange={(e) => setSelectedProject({...selectedProject, totalUnits: e.target.value})}
                      className="input input-bordered w-full"
                      required
                      min="1"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Avg Price *</span>
                    </label>
                    <input
                      type="text"
                      name="avgPrice"
                      value={selectedProject.avgPrice}
                      onChange={(e) => setSelectedProject({...selectedProject, avgPrice: e.target.value})}
                      className="input input-bordered w-full"
                      required
                      placeholder="₱0.0M"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Status</span>
                    </label>
                    <select
                      name="status"
                      value={selectedProject.status}
                      onChange={(e) => setSelectedProject({...selectedProject, status: e.target.value})}
                      className="select select-bordered w-full"
                    >
                      <option value="Active">Active</option>
                      <option value="Pre-selling">Pre-selling</option>
                    </select>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Progress (%)</span>
                    </label>
                    <input
                      type="number"
                      name="completion"
                      value={selectedProject.completion}
                      onChange={(e) => setSelectedProject({...selectedProject, completion: e.target.value})}
                      className="input input-bordered w-full"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div className="modal-action">
                  <button type="submit" className="btn btn-primary">
                    <RiEditLine className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    className="btn"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Projects;