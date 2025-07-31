import React, { useState } from 'react';
import {
  RiMoneyDollarCircleLine,
  RiAddLine,
  RiEditLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiBuildingLine,
  RiFileTextLine,
  RiLockLine,
  RiLockUnlockLine,
  RiCalendarCheckLine
} from 'react-icons/ri';

function SmartContracts() {
  // Sample static data
  const [contracts, setContracts] = useState([
    {
      id: 1,
      projectName: "Green Residences Tower A",
      totalValue: 25000000,
      status: 'active',
      startDate: '2025-01-15',
      currentProgress: 65,
      paymentTriggers: [
        { 
          id: 1, 
          progressPercentage: 25, 
          paymentPercentage: 30,
          isComplete: true,
          completionDate: '2025-03-20',
          milestone: 'Foundation Completion'
        },
        { 
          id: 2, 
          progressPercentage: 50, 
          paymentPercentage: 30,
          isComplete: true,
          completionDate: '2025-06-15',
          milestone: 'Structure Completion'
        },
        { 
          id: 3, 
          progressPercentage: 75, 
          paymentPercentage: 20,
          isComplete: false,
          milestone: 'Interior Finishing'
        },
        { 
          id: 4, 
          progressPercentage: 100, 
          paymentPercentage: 20,
          isComplete: false,
          milestone: 'Project Completion'
        }
      ]
    },
    {
      id: 2,
      projectName: "Blue Ocean Condominiums",
      totalValue: 18000000,
      status: 'active',
      startDate: '2025-03-01',
      currentProgress: 30,
      paymentTriggers: [
        { 
          id: 1, 
          progressPercentage: 25, 
          paymentPercentage: 35,
          isComplete: true,
          completionDate: '2025-05-15',
          milestone: 'Foundation Completion'
        },
        { 
          id: 2, 
          progressPercentage: 50, 
          paymentPercentage: 25,
          isComplete: false,
          milestone: 'Structure Completion'
        },
        { 
          id: 3, 
          progressPercentage: 75, 
          paymentPercentage: 20,
          isComplete: false,
          milestone: 'Interior Finishing'
        },
        { 
          id: 4, 
          progressPercentage: 100, 
          paymentPercentage: 20,
          isComplete: false,
          milestone: 'Project Completion'
        }
      ]
    }
  ]);

  const [showNewContract, setShowNewContract] = useState(false);
  const [showEditContract, setShowEditContract] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [newPaymentTrigger, setNewPaymentTrigger] = useState({ 
    progressPercentage: '', 
    paymentPercentage: '', 
    milestone: '' 
  });
  const [selectedContract, setSelectedContract] = useState(null);
  
  // New contract form state
  const [newContract, setNewContract] = useState({
    projectName: '',
    totalValue: '',
    paymentTriggers: []
  });

  const handleCreateContract = () => {
    if (!newContract.projectName || !newContract.totalValue) {
      alert('Please fill in all required fields');
      return;
    }

    const contractData = {
      id: Date.now(),
      projectName: newContract.projectName,
      totalValue: parseFloat(newContract.totalValue),
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      currentProgress: 0,
      paymentTriggers: newContract.paymentTriggers.map((trigger, index) => ({
        ...trigger,
        id: index + 1,
        isComplete: false
      }))
    };

    setContracts([contractData, ...contracts]); // Add to beginning of array
    
    // Reset form
    setNewContract({
      projectName: '',
      totalValue: '',
      paymentTriggers: []
    });
    setNewPaymentTrigger({ 
      progressPercentage: '', 
      paymentPercentage: '', 
      milestone: '' 
    });
    setShowNewContract(false);
  };

  const handleAddTrigger = () => {
    if (!newPaymentTrigger.progressPercentage || !newPaymentTrigger.paymentPercentage || !newPaymentTrigger.milestone) {
      alert('Please fill in all trigger fields');
      return;
    }

    const trigger = {
      progressPercentage: parseInt(newPaymentTrigger.progressPercentage),
      paymentPercentage: parseInt(newPaymentTrigger.paymentPercentage),
      milestone: newPaymentTrigger.milestone
    };

    setNewContract({
      ...newContract,
      paymentTriggers: [...newContract.paymentTriggers, trigger]
    });

    setNewPaymentTrigger({ 
      progressPercentage: '', 
      paymentPercentage: '', 
      milestone: '' 
    });
  };

  const handleRemoveTrigger = (index) => {
    const updatedTriggers = newContract.paymentTriggers.filter((_, i) => i !== index);
    setNewContract({
      ...newContract,
      paymentTriggers: updatedTriggers
    });
  };

  const handleEditContract = (contract) => {
    setEditingContract({
      ...contract,
      totalValue: contract.totalValue.toString()
    });
    setShowEditContract(true);
  };

  const handleUpdateContract = () => {
    if (!editingContract.projectName || !editingContract.totalValue) {
      alert('Please fill in all required fields');
      return;
    }

    setContracts(contracts.map(contract => 
      contract.id === editingContract.id 
        ? {
            ...editingContract,
            totalValue: parseFloat(editingContract.totalValue)
          }
        : contract
    ));

    setShowEditContract(false);
    setEditingContract(null);
  };

  const handleTriggerUpdate = (contractId, triggerId, isComplete) => {
    setContracts(contracts.map(contract => {
      if (contract.id === contractId) {
        const updatedTriggers = contract.paymentTriggers.map(trigger => {
          if (trigger.id === triggerId) {
            return { 
              ...trigger, 
              isComplete,
              completionDate: isComplete ? new Date().toISOString().split('T')[0] : null
            };
          }
          return trigger;
        });

        // Update current progress based on completed triggers
        const completedTriggers = updatedTriggers.filter(t => t.isComplete);
        const currentProgress = completedTriggers.length > 0 
          ? Math.max(...completedTriggers.map(t => t.progressPercentage))
          : 0;

        return {
          ...contract,
          currentProgress,
          paymentTriggers: updatedTriggers
        };
      }
      return contract;
    }));
  };

  const closeModal = () => {
    setShowNewContract(false);
    setNewContract({
      projectName: '',
      totalValue: '',
      paymentTriggers: []
    });
    setNewPaymentTrigger({ 
      progressPercentage: '', 
      paymentPercentage: '', 
      milestone: '' 
    });
  };

  const closeEditModal = () => {
    setShowEditContract(false);
    setEditingContract(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Smart Contract Manager</h1>
          <p className="text-base-content/70">Manage payment milestones and track project completion</p>
        </div>
        <button
          onClick={() => setShowNewContract(true)}
          className="btn btn-primary gap-2"
        >
          <RiAddLine className="text-xl" />
          New Contract
        </button>
      </div>

      {/* Contract Statistics */}
      <div className="stats stats-vertical lg:stats-horizontal shadow w-full mb-8">
        <div className="stat">
          <div className="stat-figure text-primary">
            <RiFileTextLine className="text-3xl" />
          </div>
          <div className="stat-title">Active Contracts</div>
          <div className="stat-value text-primary">{contracts.length}</div>
          <div className="stat-desc">Current period</div>
        </div>
        
        <div className="stat">
          <div className="stat-figure text-success">
            <RiLockUnlockLine className="text-3xl" />
          </div>
          <div className="stat-title">Released Payments</div>
          <div className="stat-value text-success">
            {contracts.reduce((acc, contract) => 
              acc + contract.paymentTriggers.filter(t => t.isComplete).length, 0
            )}
          </div>
          <div className="stat-desc">Completed milestones</div>
        </div>
        
        <div className="stat">
          <div className="stat-figure text-secondary">
            <RiLockLine className="text-3xl" />
          </div>
          <div className="stat-title">Pending Releases</div>
          <div className="stat-value text-secondary">
            {contracts.reduce((acc, contract) => 
              acc + contract.paymentTriggers.filter(t => !t.isComplete).length, 0
            )}
          </div>
          <div className="stat-desc">Awaiting completion</div>
        </div>
      </div>

      {/* New Contract Modal */}
      <dialog className={`modal ${showNewContract ? 'modal-open' : ''}`}>
        <div className="modal-box max-w-2xl">
          <h2 className="text-xl font-bold mb-4">Create New Smart Contract</h2>
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Project Name</span>
              </label>
              <input 
                type="text" 
                className="input input-bordered w-full" 
                placeholder="Enter project name"
                value={newContract.projectName}
                onChange={(e) => setNewContract({
                  ...newContract,
                  projectName: e.target.value
                })}
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Total Contract Value</span>
              </label>
              <input 
                type="number" 
                className="input input-bordered w-full" 
                placeholder="Enter value in PHP"
                value={newContract.totalValue}
                onChange={(e) => setNewContract({
                  ...newContract,
                  totalValue: e.target.value
                })}
              />
            </div>
            
            <div className="divider">Payment Triggers</div>
            
            {/* Existing triggers display */}
            {newContract.paymentTriggers.length > 0 && (
              <div className="space-y-2 mb-4">
                <h4 className="font-medium">Added Triggers:</h4>
                {newContract.paymentTriggers.map((trigger, index) => (
                  <div key={index} className="flex items-center justify-between bg-base-200 p-3 rounded">
                    <div>
                      <span className="font-medium">{trigger.milestone}</span>
                      <span className="text-sm text-base-content/70 ml-2">
                        {trigger.progressPercentage}% progress → {trigger.paymentPercentage}% payment
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveTrigger(index)}
                      className="btn btn-circle btn-sm btn-error"
                    >
                      <RiCloseCircleLine />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="space-y-2">
              {/* Add trigger form */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Milestone Name</span>
                </label>
                <input 
                  type="text" 
                  className="input input-bordered w-full" 
                  placeholder="e.g., Foundation Completion"
                  value={newPaymentTrigger.milestone}
                  onChange={(e) => setNewPaymentTrigger({
                    ...newPaymentTrigger,
                    milestone: e.target.value
                  })}
                />
              </div>
              
              <div className="flex gap-2 items-end">
                <div className="form-control flex-1">
                  <label className="label">
                    <span className="label-text">Progress %</span>
                  </label>
                  <input 
                    type="number" 
                    className="input input-bordered w-full" 
                    placeholder="25"
                    min="0"
                    max="100"
                    value={newPaymentTrigger.progressPercentage}
                    onChange={(e) => setNewPaymentTrigger({
                      ...newPaymentTrigger,
                      progressPercentage: e.target.value
                    })}
                  />
                </div>
                <div className="form-control flex-1">
                  <label className="label">
                    <span className="label-text">Payment %</span>
                  </label>
                  <input 
                    type="number" 
                    className="input input-bordered w-full" 
                    placeholder="30"
                    min="0"
                    max="100"
                    value={newPaymentTrigger.paymentPercentage}
                    onChange={(e) => setNewPaymentTrigger({
                      ...newPaymentTrigger,
                      paymentPercentage: e.target.value
                    })}
                  />
                </div>
                <button 
                  type="button" 
                  className="btn btn-circle btn-primary"
                  onClick={handleAddTrigger}
                >
                  <RiAddLine />
                </button>
              </div>
            </div>

            <div className="modal-action">
              <button 
                onClick={handleCreateContract} 
                className="btn btn-primary"
              >
                Create Contract
              </button>
              <button 
                type="button" 
                onClick={closeModal} 
                className="btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        <div className="modal-backdrop" onClick={closeModal}>
        </div>
      </dialog>

      {/* Edit Contract Modal */}
      <dialog className={`modal ${showEditContract ? 'modal-open' : ''}`}>
        <div className="modal-box max-w-2xl">
          <h2 className="text-xl font-bold mb-4">Edit Contract</h2>
          {editingContract && (
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Project Name</span>
                </label>
                <input 
                  type="text" 
                  className="input input-bordered w-full" 
                  placeholder="Enter project name"
                  value={editingContract.projectName}
                  onChange={(e) => setEditingContract({
                    ...editingContract,
                    projectName: e.target.value
                  })}
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Total Contract Value</span>
                </label>
                <input 
                  type="number" 
                  className="input input-bordered w-full" 
                  placeholder="Enter value in PHP"
                  value={editingContract.totalValue}
                  onChange={(e) => setEditingContract({
                    ...editingContract,
                    totalValue: e.target.value
                  })}
                />
              </div>

              <div className="divider">Payment Triggers</div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Current Triggers:</h4>
                {editingContract.paymentTriggers.map((trigger) => (
                  <div key={trigger.id} className={`flex items-center justify-between p-3 rounded ${
                    trigger.isComplete ? 'bg-success/10' : 'bg-base-200'
                  }`}>
                    <div>
                      <span className="font-medium">{trigger.milestone}</span>
                      <span className="text-sm text-base-content/70 ml-2">
                        {trigger.progressPercentage}% progress → {trigger.paymentPercentage}% payment
                      </span>
                      {trigger.isComplete && (
                        <span className="text-sm text-success ml-2">
                          (Completed on {trigger.completionDate})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-action">
                <button 
                  onClick={handleUpdateContract} 
                  className="btn btn-primary"
                >
                  Update Contract
                </button>
                <button 
                  type="button" 
                  onClick={closeEditModal} 
                  className="btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="modal-backdrop" onClick={closeEditModal}>
        </div>
      </dialog>

      {/* Contracts List */}
      <div className="grid gap-6">
        {contracts.map((contract) => (
          <div key={contract.id} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="card-title">
                    {contract.projectName}
                    <div className="badge badge-primary">{contract.status}</div>
                  </h2>
                  <p className="text-base-content/70">
                    Total Value: ₱{contract.totalValue.toLocaleString()}
                  </p>
                  <p className="text-base-content/70 flex items-center gap-2">
                    <RiCalendarCheckLine />
                    Started: {contract.startDate}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    className="btn btn-circle btn-ghost btn-sm"
                    onClick={() => handleEditContract(contract)}
                  >
                    <RiEditLine className="text-xl" />
                  </button>
                </div>
              </div>

              <div className="my-6">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">Project Progress</span>
                  <span className="font-semibold text-primary">{contract.currentProgress}%</span>
                </div>
                <progress 
                  className="progress progress-primary w-full" 
                  value={contract.currentProgress} 
                  max="100"
                ></progress>
              </div>

              <div className="space-y-4">
                {contract.paymentTriggers.map((trigger) => (
                  <div 
                    key={trigger.id} 
                    className={`card ${
                      trigger.isComplete ? 'bg-success/10' : 'bg-base-200'
                    }`}
                  >
                    <div className="card-body p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{trigger.milestone}</h3>
                          <div className="flex gap-4 mt-1">
                            <span className="text-sm">
                              Progress: {trigger.progressPercentage}%
                            </span>
                            <span className="text-sm">
                              Payment: ₱{(contract.totalValue * trigger.paymentPercentage / 100).toLocaleString()} ({trigger.paymentPercentage}%)
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {trigger.isComplete ? (
                            <div className="badge badge-success gap-2">
                              <RiCheckboxCircleLine />
                              Released on {trigger.completionDate}
                            </div>
                          ) : (
                            contract.currentProgress >= trigger.progressPercentage ? (
                              <button
                                onClick={() => handleTriggerUpdate(contract.id, trigger.id, true)}
                                className="btn btn-success btn-sm gap-2"
                              >
                                <RiLockUnlockLine />
                                Release Payment
                              </button>
                            ) : (
                              <div className="badge badge-outline gap-2">
                                <RiLockLine />
                                Locked
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SmartContracts;