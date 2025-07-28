import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RiBuildingLine, 
  RiGroupLine, 
  RiBarChartBoxLine,
  RiSettings4Line,
  RiEyeLine,
  RiAddLine,
  RiCloseLine,
  RiImageAddLine
} from 'react-icons/ri';

function Overview({ projectStats }) {
  const [showModal, setShowModal] = useState(false);
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

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    // In a real app, you would handle the project creation here
    console.log("Creating project:", newProject);
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

  return (
    <div className="space-y-6">
      {/* Developer Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="stat bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-blue-500/20">
          <div className="stat-title text-blue-600/70">Total Projects</div>
          <div className="stat-value text-2xl text-blue-600">{projectStats.totalProjects}</div>
          <div className="stat-desc text-blue-600/60">All time</div>
        </div>
        <div className="stat bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-emerald-500/20">
          <div className="stat-title text-emerald-600/70">Active Projects</div>
          <div className="stat-value text-2xl text-emerald-600">{projectStats.activeProjects}</div>
          <div className="stat-desc text-emerald-600/60">In development</div>
        </div>
        <div className="stat bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-purple-500/20">
          <div className="stat-title text-purple-600/70">Total Units</div>
          <div className="stat-value text-2xl text-purple-600">{projectStats.totalUnits.toLocaleString()}</div>
          <div className="stat-desc text-purple-600/60">All projects</div>
        </div>
        <div className="stat bg-gradient-to-br from-amber-500/10 to-amber-600/5 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-amber-500/20">
          <div className="stat-title text-amber-600/70">Units Sold</div>
          <div className="stat-value text-2xl text-amber-600">{projectStats.soldUnits.toLocaleString()}</div>
          <div className="stat-desc text-amber-600/60">{Math.round((projectStats.soldUnits/projectStats.totalUnits)*100)}% sold</div>
        </div>
        <div className="stat bg-gradient-to-br from-rose-500/10 to-rose-600/5 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-rose-500/20">
          <div className="stat-title text-rose-600/70">Total Revenue</div>
          <div className="stat-value text-xl text-rose-600">{projectStats.totalRevenue}</div>
          <div className="stat-desc text-rose-600/60">Gross sales</div>
        </div>
        <div className="stat bg-gradient-to-br from-teal-500/10 to-teal-600/5 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-teal-500/20">
          <div className="stat-title text-teal-600/70">Avg Unit Price</div>
          <div className="stat-value text-xl text-teal-600">{projectStats.averagePrice}</div>
          <div className="stat-desc text-teal-600/60">Market rate</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button 
          className="btn btn-primary gap-2 h-16"
          onClick={() => setShowModal(true)}
        >
          <RiBuildingLine className="w-5 h-5" />
          <div className="text-left">
            <div className="font-semibold">New Project</div>
            <div className="text-xs opacity-70">Create project</div>
          </div>
        </button>
        <button className="btn btn-outline gap-2 h-16">
          <RiBarChartBoxLine className="w-5 h-5" />
          <div className="text-left">
            <div className="font-semibold">Sales Report</div>
            <div className="text-xs opacity-70">View analytics</div>
          </div>
        </button>
        <button className="btn btn-outline gap-2 h-16">
          <RiGroupLine className="w-5 h-5" />
          <div className="text-left">
            <div className="font-semibold">Buyer Insights</div>
            <div className="text-xs opacity-70">Market analysis</div>
          </div>
        </button>
        <button className="btn btn-outline gap-2 h-16">
          <RiSettings4Line className="w-5 h-5" />
          <div className="text-left">
            <div className="font-semibold">Project Settings</div>
            <div className="text-xs opacity-70">Manage projects</div>
          </div>
        </button>
      </div>

      {/* Recent Project Activities */}
      <div className="card bg-base-100 shadow-lg border border-base-200">
        <div className="card-body">
          <h3 className="text-xl font-bold mb-4">Recent Activities</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-success/5 rounded-lg border border-success/20">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">3 new buyers matched with Viva Homes Townhouse</p>
                <p className="text-xs text-base-content/60">2 hours ago</p>
              </div>
              <div className="badge badge-success">+3</div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-blue/5 rounded-lg border border-blue/20">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">Metro Heights construction milestone reached</p>
                <p className="text-xs text-base-content/60">1 day ago</p>
              </div>
              <div className="badge badge-info">45%</div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-warning/5 rounded-lg border border-warning/20">
              <div className="w-2 h-2 bg-warning rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">Garden Residences pre-selling launched</p>
                <p className="text-xs text-base-content/60">3 days ago</p>
              </div>
              <div className="badge badge-warning">New</div>
            </div>
          </div>
        </div>
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
    </div>
  );
}

export default Overview;