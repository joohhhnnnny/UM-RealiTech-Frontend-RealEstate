import React, { useState } from 'react';
import {
  RiMoneyDollarCircleLine,
  RiLockUnlockLine,
  RiLockLine,
  RiShieldCheckLine,
  RiTimeLine,
  RiAlertLine,
  RiCheckboxCircleLine
} from 'react-icons/ri';

function EscrowManagement({ 
  projects, 
  selectedProject,
  setSelectedProject,
  paymentMilestones,
  setPaymentMilestones,
  escrowReleases,
  setEscrowReleases,
  notifications,
  setNotifications,
  handleEscrowRelease
}) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Milestone-Based Escrow System</h2>
        <div className="badge badge-info">
          <RiShieldCheckLine className="w-4 h-4 mr-1" />
          Secure Payment Control
        </div>
      </div>

      {/* Escrow Overview Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-r from-success/10 to-success/5 border border-success/20">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-success/20 rounded-full">
                <RiLockUnlockLine className="text-success text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-success">Funds Released</h3>
                <p className="text-2xl font-bold">₱12,450,000</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-warning/10 to-warning/5 border border-warning/20">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-warning/20 rounded-full">
                <RiLockLine className="text-warning text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-warning">Funds In Escrow</h3>
                <p className="text-2xl font-bold">₱8,550,000</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-info/10 to-info/5 border border-info/20">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-info/20 rounded-full">
                <RiMoneyDollarCircleLine className="text-info text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-info">Next Release</h3>
                <p className="text-2xl font-bold">₱3,200,000</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Selector */}
      <div className="mb-6">
        <select 
          className="select select-bordered w-full max-w-xs"
          value={selectedProject?.id || ''}
          onChange={(e) => {
            const project = projects.find(p => p.id === e.target.value);
            setSelectedProject(project);
          }}
        >
          <option value="">Select Project for Escrow Details</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {selectedProject ? (
        <div className="space-y-6">
          {/* Payment Milestones */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <RiMoneyDollarCircleLine />
                Payment Milestones - {selectedProject.name}
              </h3>
              
              <div className="space-y-4">
                {selectedProject.milestones?.map((milestone, index) => (
                  <div key={milestone.id} className="flex items-center justify-between p-4 bg-base-100 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        milestone.completed 
                          ? milestone.verified 
                            ? 'bg-success text-success-content' 
                            : 'bg-warning text-warning-content'
                          : 'bg-base-300 text-base-content'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{milestone.name}</h4>
                        <p className="text-sm text-base-content/70">
                          Progress Target: {milestone.progressPercentage}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold text-lg">{milestone.paymentAmount}</div>
                      <div className={`badge ${
                        milestone.completed 
                          ? milestone.verified 
                            ? 'badge-success' 
                            : 'badge-warning'
                          : 'badge-outline'
                      }`}>
                        {milestone.completed 
                          ? milestone.verified 
                            ? 'Released' 
                            : 'Pending Release'
                          : 'In Escrow'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Escrow Release History */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <RiTimeLine />
                Escrow Release History
              </h3>
              
              {escrowReleases.length > 0 ? (
                <div className="space-y-3">
                  {escrowReleases.map(release => (
                    <div key={release.id} className="flex items-center justify-between p-3 bg-base-100 rounded">
                      <div>
                        <div className="font-medium">{release.amount}</div>
                        <div className="text-sm text-base-content/70">{release.releaseDate}</div>
                      </div>
                      <div className={`badge ${
                        release.status === 'released' ? 'badge-success' : 
                        release.status === 'pending_verification' ? 'badge-warning' : 'badge-outline'
                      }`}>
                        {release.status.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-base-content/50">
                  <RiMoneyDollarCircleLine className="mx-auto text-4xl mb-2" />
                  <p>No escrow releases yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Release Actions */}
          <div className="card bg-base-200">
            <div className="card-body">
              <h3 className="font-semibold mb-4">Request Escrow Release</h3>
              <p className="text-sm text-base-content/70 mb-4">
                Complete milestones and upload verification media to request fund releases
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {selectedProject.milestones
                  ?.filter(milestone => milestone.completed && !milestone.verified)
                  .map(milestone => (
                    <div key={milestone.id} className="p-4 bg-base-100 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{milestone.name}</h4>
                          <p className="text-sm text-base-content/70">
                            Amount: {milestone.paymentAmount}
                          </p>
                        </div>
                        <div className="badge badge-warning">Awaiting Verification</div>
                      </div>
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => handleEscrowRelease(milestone.id, milestone.paymentAmount)}
                      >
                        Request Release
                      </button>
                    </div>
                  ))
                }
              </div>
              
              {selectedProject.milestones?.every(m => !m.completed || m.verified) && (
                <div className="text-center py-4 text-base-content/50">
                  Complete milestones to request releases
                </div>
              )}
            </div>
          </div>

          {/* Escrow Protection Info */}
          <div className="card bg-gradient-to-r from-info/10 to-primary/10 border border-info/20">
            <div className="card-body">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <RiShieldCheckLine />
                Escrow Protection Benefits
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <RiLockLine className="text-info" />
                    For Buyers
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• Funds held securely until milestones complete</li>
                    <li>• Protection against incomplete projects</li>
                    <li>• Transparent payment release process</li>
                    <li>• Visual verification required</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <RiCheckboxCircleLine className="text-success" />
                    For Developers
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• Predictable payment schedule</li>
                    <li>• Builds trust with buyers</li>
                    <li>• Clear milestone verification process</li>
                    <li>• Professional project management</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <RiMoneyDollarCircleLine className="mx-auto text-4xl text-base-content/50 mb-4" />
          <p className="text-base-content/70">Select a project to view escrow details</p>
        </div>
      )}
    </div>
  );
}

export default EscrowManagement;
