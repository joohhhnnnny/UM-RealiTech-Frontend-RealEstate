import React, { useState, useCallback, useMemo } from 'react';
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
  RiCalendarCheckLine,
  RiShieldCheckLine,
  RiAlertLine
} from 'react-icons/ri';

function SmartContracts({ projects }) {
  // First define all state variables
  const [showNewContract, setShowNewContract] = useState(false);
  const [showEditContract, setShowEditContract] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  
  const [newContract, setNewContract] = useState({
    projectName: '',
    totalValue: '',
    paymentTriggers: []
  });

  const [newPaymentTrigger, setNewPaymentTrigger] = useState({ 
    progressPercentage: '', 
    paymentPercentage: '',
    paymentAmount: '',
    milestone: '' 
  });

  // Then define helper functions
  const calculateProgressPercentage = (milestoneName, milestones) => {
    const totalMilestones = milestones.length;
    const milestoneIndex = milestones.findIndex(m => m.name === milestoneName);
    return Math.round(((milestoneIndex + 1) / totalMilestones) * 100);
  };

  const calculatePaymentPercentage = (milestone, project) => {
    if (milestone.paymentAmount && project.escrowStatus) {
      const totalValue = parseFloat(project.escrowStatus.released.replace(/[^\d.]/g, '')) + 
                        parseFloat(project.escrowStatus.held.replace(/[^\d.]/g, ''));
      const paymentAmount = parseFloat(milestone.paymentAmount.replace(/[^\d.]/g, ''));
      return Math.round((paymentAmount / totalValue) * 100);
    }
    return 20; // Default percentage
  };

  const calculateDefaultPayment = (milestone, project) => {
    const totalValue = project.escrowStatus ? 
      parseFloat(project.escrowStatus.released.replace(/[^\d.]/g, '')) + 
      parseFloat(project.escrowStatus.held.replace(/[^\d.]/g, '')) : 0;
    const percentage = calculatePaymentPercentage(milestone, project);
    return (totalValue * (percentage / 100)).toLocaleString('en-PH', { 
      style: 'currency', 
      currency: 'PHP' 
    });
  };

  // Then initialize contracts state
  const [contracts, setContracts] = useState(
    projects.map(project => ({
      id: project.id,
      projectName: project.name,
      totalValue: project.escrowStatus ? 
        parseFloat(project.escrowStatus.released.replace(/[^\d.]/g, '')) + 
        parseFloat(project.escrowStatus.held.replace(/[^\d.]/g, '')) : 0,
      status: 'active',
      startDate: '2025-01-01',
      currentProgress: project.progress || 0,
      paymentTriggers: project.milestones?.map(milestone => ({
        id: milestone.id,
        progressPercentage: calculateProgressPercentage(milestone.name, project.milestones),
        paymentPercentage: calculatePaymentPercentage(milestone, project),
        paymentAmount: milestone.paymentAmount || calculateDefaultPayment(milestone, project),
        isComplete: milestone.completed && milestone.verified,
        completionDate: milestone.verifiedDate || '',
        milestone: milestone.name
      })) || []
    }))
  );

  // Rest of your component functions...
  const handleCreateContract = useCallback(() => {
    if (!newContract.projectName || !newContract.totalValue) {
      alert('Please fill in all required fields');
      return;
    }

    const totalValue = parseFloat(newContract.totalValue);
    const contractData = {
      id: Date.now(),
      projectName: newContract.projectName,
      totalValue: totalValue,
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      currentProgress: 0,
      paymentTriggers: newContract.paymentTriggers.map((trigger, index) => ({
        ...trigger,
        id: index + 1,
        paymentAmount: (totalValue * (parseFloat(trigger.paymentPercentage) / 100))
                      .toLocaleString('en-PH', { style: 'currency', currency: 'PHP' }),
        isComplete: false
      }))
    };

    setContracts([contractData, ...contracts]);
    setNewContract({
      projectName: '',
      totalValue: '',
      paymentTriggers: []
    });
    setNewPaymentTrigger({ 
      progressPercentage: '', 
      paymentPercentage: '',
      paymentAmount: '',
      milestone: '' 
    });
    setShowNewContract(false);
  }, [newContract, contracts]);

  const handleAddTrigger = useCallback(() => {
    if (!newPaymentTrigger.progressPercentage || 
        !newPaymentTrigger.paymentPercentage || 
        !newPaymentTrigger.milestone) {
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
      paymentAmount: '',
      milestone: '' 
    });
  }, [newPaymentTrigger, newContract]);

  const handleRemoveTrigger = useCallback((index) => {
    const updatedTriggers = newContract.paymentTriggers.filter((_, i) => i !== index);
    setNewContract({
      ...newContract,
      paymentTriggers: updatedTriggers
    });
  }, [newContract]);

  const handleEditContract = useCallback((contract) => {
    setEditingContract({
      ...contract,
      totalValue: contract.totalValue.toString()
    });
    setShowEditContract(true);
  }, []);

  const handleUpdateContract = useCallback(() => {
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
  }, [editingContract, contracts]);

  const handleTriggerUpdate = useCallback((contractId, triggerId, isComplete) => {
    setContracts(prevContracts => 
      prevContracts.map(contract => {
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
      })
    );
  }, []);

  const closeModal = useCallback(() => {
    setShowNewContract(false);
    setNewContract({
      projectName: '',
      totalValue: '',
      paymentTriggers: []
    });
    setNewPaymentTrigger({ 
      progressPercentage: '', 
      paymentPercentage: '',
      paymentAmount: '',
      milestone: '' 
    });
  }, []);

  const closeEditModal = useCallback(() => {
    setShowEditContract(false);
    setEditingContract(null);
  }, []);

  // Calculate contract statistics
  const contractStats = useMemo(() => {
    return {
      activeContracts: contracts.length,
      releasedPayments: contracts.reduce((acc, contract) => 
        acc + contract.paymentTriggers.filter(t => t.isComplete).length, 0
      ),
      pendingReleases: contracts.reduce((acc, contract) => 
        acc + contract.paymentTriggers.filter(t => !t.isComplete).length, 0
      ),
      totalReleasedValue: contracts.reduce((acc, contract) => {
        return acc + contract.paymentTriggers
          .filter(t => t.isComplete)
          .reduce((sum, t) => sum + (contract.totalValue * t.paymentPercentage / 100), 0);
      }, 0)
    };
  }, [contracts]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">BuildSafe Smart Contracts</h1>
          <p className="text-base-content/70">Manage milestone payments and escrow releases</p>
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
          <div className="stat-value text-primary">{contractStats.activeContracts}</div>
          <div className="stat-desc">Current projects</div>
        </div>
        
        <div className="stat">
          <div className="stat-figure text-success">
            <RiLockUnlockLine className="text-3xl" />
          </div>
          <div className="stat-title">Released Payments</div>
          <div className="stat-value text-success">
            {contractStats.releasedPayments}
          </div>
          <div className="stat-desc">Completed milestones</div>
        </div>
        
        <div className="stat">
          <div className="stat-figure text-secondary">
            <RiMoneyDollarCircleLine className="text-3xl" />
          </div>
          <div className="stat-title">Released Value</div>
          <div className="stat-value text-secondary">
            ₱{contractStats.totalReleasedValue.toLocaleString()}
          </div>
          <div className="stat-desc">Total payments</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-warning">
            <RiLockLine className="text-3xl" />
          </div>
          <div className="stat-title">Pending Releases</div>
          <div className="stat-value text-warning">
            {contractStats.pendingReleases}
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
                <span className="label-text">Project Name *</span>
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
                required
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Total Contract Value (PHP) *</span>
              </label>
              <input 
                type="number" 
                className="input input-bordered w-full" 
                placeholder="Enter value"
                value={newContract.totalValue}
                onChange={(e) => setNewContract({
                  ...newContract,
                  totalValue: e.target.value
                })}
                required
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="divider">Payment Triggers</div>
            
            <div className="alert alert-info">
              <RiShieldCheckLine className="text-xl" />
              <div>
                <h3 className="font-bold">Escrow Protection</h3>
                <div className="text-xs">
                  Payments will be held in escrow until milestones are verified
                </div>
              </div>
            </div>
            
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
                  <span className="label-text">Milestone Name *</span>
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
                  required
                />
              </div>
              
              <div className="flex gap-2 items-end">
                <div className="form-control flex-1">
                  <label className="label">
                    <span className="label-text">Progress % *</span>
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
                    required
                  />
                </div>
                <div className="form-control flex-1">
                  <label className="label">
                    <span className="label-text">Payment % *</span>
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
                    required
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
        <div className="modal-backdrop" onClick={closeModal}></div>
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
                      trigger.isComplete ? 'bg-success/10 border-success' : 'bg-base-200'
                    }`}
                  >
                    <div className="card-body p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{trigger.milestone}</h3>
                          <div className="flex flex-wrap gap-4 mt-1">
                            <span className="text-sm">
                              Progress: {trigger.progressPercentage}%
                            </span>
                            <span className="text-sm">
                              Payment: {trigger.paymentAmount || '₱0'} ({trigger.paymentPercentage}%)
                            </span>
                          </div>
                          {trigger.isComplete && trigger.completionDate && (
                            <div className="text-xs text-success mt-1">
                              Released on {trigger.completionDate}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {trigger.isComplete ? (
                            <div className="badge badge-success gap-2">
                              <RiCheckboxCircleLine />
                              Paid
                            </div>
                          ) : contract.currentProgress >= trigger.progressPercentage ? (
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
                              Pending
                            </div>
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