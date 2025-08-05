import React, { useState } from 'react';
import { 
  RiVipCrownFill, 
  RiShieldCheckFill, 
  RiVerifiedBadgeFill,
  RiCheckLine,
  RiCloseLine,
  RiStarFill
} from 'react-icons/ri';
import VerifiedBadge from '../../../components/VerifiedBadge';

function SubscriptionManager({ projects }) {
  const [selectedPlan, setSelectedPlan] = useState('basic');

  const currentSubscription = projects[0]?.subscription || 'basic';
  const currentProjectCount = projects.length;
  const currentProjectLimit = projects[0]?.projectLimit || 2;

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 'Free',
      projectLimit: 2,
      features: [
        'Up to 2 projects',
        'Basic verification badge',
        'Standard milestone tracking',
        'Basic escrow management',
        'Email support'
      ],
      restrictions: [
        'Limited project showcase',
        'Basic badge only',
        'No priority support'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '₱2,999/month',
      projectLimit: 10,
      features: [
        'Up to 10 projects',
        'Professional verification badge',
        'Advanced milestone tracking',
        'Priority escrow processing',
        'Phone & email support',
        'Monthly analytics reports'
      ],
      restrictions: [
        'Limited to 10 projects'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '₱4,999/month',
      projectLimit: 'Unlimited',
      features: [
        'Unlimited projects',
        'Premium verification badge',
        'Advanced analytics dashboard',
        'Priority support & onboarding',
        'Custom branding options',
        'Dedicated account manager',
        'API access for integrations'
      ],
      restrictions: []
    }
  ];

  const getCurrentPlan = () => plans.find(plan => plan.id === currentSubscription);

  return (
    <div className="p-6 space-y-6">
      {/* Current Status */}
      <div className="card bg-base-200 shadow-lg">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="card-title text-2xl">Current Subscription</h2>
              <VerifiedBadge subscription={currentSubscription} className="text-lg" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{getCurrentPlan()?.price}</div>
              <div className="text-sm text-base-content/70">{getCurrentPlan()?.name} Plan</div>
            </div>
          </div>
          
          <div className="divider"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat">
              <div className="stat-title">Projects Used</div>
              <div className="stat-value text-primary">
                {currentProjectCount} / {currentProjectLimit === 'Unlimited' ? '∞' : currentProjectLimit}
              </div>
              <div className="stat-desc">
                {currentProjectLimit === 'Unlimited' ? 'Unlimited projects' : 
                 `${currentProjectLimit - currentProjectCount} remaining`}
              </div>
            </div>
            
            <div className="stat">
              <div className="stat-title">Badge Level</div>
              <div className="stat-value text-secondary">{getCurrentPlan()?.name}</div>
              <div className="stat-desc">Verification status</div>
            </div>
            
            <div className="stat">
              <div className="stat-title">Support Level</div>
              <div className="stat-value text-accent">
                {currentSubscription === 'premium' ? 'Priority' : 
                 currentSubscription === 'professional' ? 'Standard' : 'Basic'}
              </div>
              <div className="stat-desc">Response time</div>
            </div>
          </div>

          {currentSubscription === 'basic' && currentProjectCount >= currentProjectLimit && (
            <div className="alert alert-warning mt-4">
              <div className="flex-1">
                <strong>Project limit reached!</strong> You've used all {currentProjectLimit} projects. 
                Upgrade to add more projects and get premium verification badges.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Plans */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Available Plans</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`card shadow-lg cursor-pointer transition-all hover:shadow-xl ${
                plan.id === currentSubscription ? 'ring-2 ring-primary bg-primary/5' : 'bg-base-200'
              } ${plan.id === 'premium' ? 'border-2 border-warning' : ''}`}
            >
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="card-title text-xl">{plan.name}</h3>
                  {plan.id === 'premium' && (
                    <div className="badge badge-warning gap-1">
                      <RiStarFill className="w-3 h-3" />
                      Most Popular
                    </div>
                  )}
                </div>
                
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold">{plan.price}</div>
                  {plan.price !== 'Free' && (
                    <div className="text-sm text-base-content/70">per month</div>
                  )}
                </div>

                <div className="flex justify-center mb-4">
                  <VerifiedBadge subscription={plan.id} />
                </div>

                <div className="space-y-2 mb-6">
                  <div className="font-medium text-center">
                    {plan.projectLimit === 'Unlimited' ? 'Unlimited' : `Up to ${plan.projectLimit}`} Projects
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <RiCheckLine className="w-4 h-4 text-success flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.restrictions.length > 0 && (
                  <div className="space-y-1 mb-4">
                    {plan.restrictions.map((restriction, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <RiCloseLine className="w-4 h-4 text-error flex-shrink-0" />
                        <span className="text-sm text-base-content/70">{restriction}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="card-actions justify-end mt-auto">
                  {plan.id === currentSubscription ? (
                    <button className="btn btn-primary btn-disabled w-full">
                      Current Plan
                    </button>
                  ) : (
                    <button 
                      className={`btn w-full ${plan.id === 'premium' ? 'btn-warning' : 'btn-primary'}`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {plan.price === 'Free' ? 'Downgrade' : 'Upgrade'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits of Upgrading */}
      <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 shadow-lg">
        <div className="card-body">
          <h3 className="card-title text-xl mb-4">Why Upgrade?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Build Trust with Buyers</h4>
              <p className="text-sm text-base-content/70">
                Premium verification badges show buyers you're a serious, verified developer committed to transparency.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Showcase More Projects</h4>
              <p className="text-sm text-base-content/70">
                Display unlimited projects to potential buyers and build a comprehensive portfolio of your work.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Priority Support</h4>
              <p className="text-sm text-base-content/70">
                Get faster response times and dedicated support to keep your projects running smoothly.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Advanced Analytics</h4>
              <p className="text-sm text-base-content/70">
                Track buyer engagement, project performance, and optimize your development strategy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionManager;
