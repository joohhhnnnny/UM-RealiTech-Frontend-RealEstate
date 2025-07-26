import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { 
  RiRobot2Line, 
  RiHomeSmileLine, 
  RiMoneyDollarCircleLine,
  RiFileList3Line,
  RiBarChartBoxLine,
  RiCheckboxCircleLine,
  RiMapPinLine,
  RiBuilding4Line,
  RiPriceTag3Line,
  RiLayoutGridLine
} from 'react-icons/ri';
import listingsData from '../../listings.json';

function BuySmartPH() {
  // Get role from parent route
  const location = useLocation();
  const userRole = location.state?.userRole || "buyer";

  const [activeStep, setActiveStep] = useState(1);
  const [activeDocTab, setActiveDocTab] = useState('personal');
  const [profileStep, setProfileStep] = useState(1);
  const [sortBy, setSortBy] = useState('latest');
  const [listings, setListings] = useState([]);
  const [displayCount, setDisplayCount] = useState(9);

  useEffect(() => {
    // Filter out listings with missing essential data
    const validListings = listingsData.filter(listing => 
      listing.title && listing.location && (listing.price || listing.price === 0)
    );
    setListings(validListings);
  }, []);
  const [profileData, setProfileData] = useState({
    buyerType: '',
    monthlyIncome: '',
    monthlyDebts: '',
    hasSpouseIncome: false,
    preferredLocation: '',
    budgetRange: ''
  });

  const buyingSteps = [
    {
      id: 1,
      title: "AI Guide-Buyer Profile",
      description: "Personalized profile setup with AI-powered recommendations",
      icon: RiRobot2Line,
      color: "text-blue-500",
      bgGradient: "from-blue-500/20 to-blue-500/5"
    },
    {
      id: 2,
      title: "Loan Calculator",
      description: "Calculate mortgage payments and loan terms",
      icon: RiMoneyDollarCircleLine,
      color: "text-emerald-500",
      bgGradient: "from-emerald-500/20 to-emerald-500/5"
    },
    {
      id: 3,
      title: "Cost Calculator",
      description: "Estimate total costs including taxes and fees",
      icon: RiBarChartBoxLine,
      color: "text-purple-500",
      bgGradient: "from-purple-500/20 to-purple-500/5"
    },
    {
      id: 4,
      title: "Document Submission",
      description: "Streamlined document upload and verification process",
      icon: RiFileList3Line,
      color: "text-amber-500",
      bgGradient: "from-amber-500/20 to-amber-500/5"
    }
  ];

  // Content components for each step
  const stepContent = {
    1: (
      <div className="card bg-base-100 shadow-lg border border-base-200 p-6">
        <h2 className="text-2xl font-bold mb-4">Buyer Profile Setup</h2>
        
        {/* Progress Bar */}
        <div className="w-full mb-8">
          <div className="w-full h-2 bg-base-200 rounded-full">
            <div 
              className="h-2 bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(profileStep / 4) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={profileStep >= 1 ? "text-primary" : "text-base-content/50"}>Buyer Type</span>
            <span className={profileStep >= 2 ? "text-primary" : "text-base-content/50"}>Financial Info</span>
            <span className={profileStep >= 3 ? "text-primary" : "text-base-content/50"}>Location & Budget</span>
            <span className={profileStep >= 4 ? "text-primary" : "text-base-content/50"}>Summary</span>
          </div>
        </div>

        {/* Step 1: Buyer Type */}
        {profileStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">What type of buyer are you?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { type: 'First Time Buyer', icon: '🏠', description: 'First property purchase' },
                { type: 'OFW', icon: '✈️', description: 'Overseas Filipino Worker' },
                { type: 'Investor', icon: '💼', description: 'Investment property' },
                { type: 'Upgrader', icon: '⭐', description: 'Moving to a better property' }
              ].map((option) => (
                <div
                  key={option.type}
                  onClick={() => {
                    setProfileData(prev => ({ ...prev, buyerType: option.type }));
                  }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    profileData.buyerType === option.type
                      ? 'border-primary bg-primary/5'
                      : 'border-base-200 hover:border-primary/50'
                  }`}
                >
                  <div className="text-2xl mb-2">{option.icon}</div>
                  <h4 className="font-semibold">{option.type}</h4>
                  <p className="text-sm text-base-content/70">{option.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Financial Information */}
        {profileStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Financial Information</h3>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Monthly Income (₱)</span>
              </label>
              <input
                type="number"
                placeholder="Enter your monthly income"
                className="input input-bordered w-full"
                value={profileData.monthlyIncome}
                onChange={(e) => setProfileData(prev => ({ ...prev, monthlyIncome: e.target.value }))}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Monthly Debts/Obligations (₱)</span>
              </label>
              <input
                type="number"
                placeholder="Enter your monthly debts"
                className="input input-bordered w-full"
                value={profileData.monthlyDebts}
                onChange={(e) => setProfileData(prev => ({ ...prev, monthlyDebts: e.target.value }))}
              />
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">I have a spouse with income</span>
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={profileData.hasSpouseIncome}
                  onChange={(e) => setProfileData(prev => ({ ...prev, hasSpouseIncome: e.target.checked }))}
                />
              </label>
            </div>
          </div>
        )}

        {/* Step 3: Location and Budget */}
        {profileStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Location & Budget Preferences</h3>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Preferred Location</span>
              </label>
              <input
                type="text"
                placeholder="Enter preferred location"
                className="input input-bordered w-full"
                value={profileData.preferredLocation}
                onChange={(e) => setProfileData(prev => ({ ...prev, preferredLocation: e.target.value }))}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Budget Range</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={profileData.budgetRange}
                onChange={(e) => setProfileData(prev => ({ ...prev, budgetRange: e.target.value }))}
              >
                <option value="">Select budget range</option>
                <option value="1M-3M">₱1M - ₱3M</option>
                <option value="3M-5M">₱3M - ₱5M</option>
                <option value="5M-10M">₱5M - ₱10M</option>
                <option value="10M+">Above ₱10M</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 4: Profile Summary */}
        {profileStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold mb-4">Profile Summary</h3>
            <div className="bg-base-200 p-6 rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-base-content/70">Buyer Type</h4>
                  <p>{profileData.buyerType}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-base-content/70">Monthly Income</h4>
                  <p>₱{Number(profileData.monthlyIncome).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-base-content/70">Monthly Debts</h4>
                  <p>₱{Number(profileData.monthlyDebts).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-base-content/70">Has Spouse Income</h4>
                  <p>{profileData.hasSpouseIncome ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-base-content/70">Preferred Location</h4>
                  <p>{profileData.preferredLocation}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-base-content/70">Budget Range</h4>
                  <p>{profileData.budgetRange}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            className="btn btn-outline"
            onClick={() => setProfileStep(prev => prev - 1)}
            disabled={profileStep === 1}
          >
            Previous
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (profileStep < 4) {
                setProfileStep(prev => prev + 1);
              } else {
                // Handle profile completion
                console.log('Profile completed:', profileData);
              }
            }}
          >
            {profileStep === 4 ? 'Complete Profile' : 'Next'}
          </button>
        </div>
      </div>
    ),
    2: (
      <div className="card bg-base-100 shadow-lg border border-base-200 p-6">
        <h2 className="text-2xl font-bold mb-4">Loan Calculator</h2>
        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Loan Amount</span>
            </label>
            <input type="number" placeholder="Enter loan amount" className="input input-bordered w-full" />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Interest Rate (%)</span>
            </label>
            <input type="number" placeholder="Enter interest rate" className="input input-bordered w-full" />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Loan Term (years)</span>
            </label>
            <input type="number" placeholder="Enter loan term" className="input input-bordered w-full" />
          </div>
          <div className="mt-4 p-4 bg-base-200 rounded-lg">
            <p className="text-lg font-semibold">Monthly Payment: ₱0.00</p>
            <p className="text-lg font-semibold">Total Payment: ₱0.00</p>
          </div>
          <button className="btn btn-primary w-full mt-4">Calculate</button>
        </div>
      </div>
    ),
    3: (
      <div className="card bg-base-100 shadow-lg border border-base-200 p-6">
        <h2 className="text-2xl font-bold mb-4">Cost Calculator</h2>
        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Property Price</span>
            </label>
            <input type="number" placeholder="Enter property price" className="input input-bordered w-full" />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Down Payment (%)</span>
            </label>
            <input type="number" placeholder="Enter down payment percentage" className="input input-bordered w-full" />
          </div>
          <div className="divider">Additional Costs</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Transfer Fee</span>
              </label>
              <input type="number" placeholder="Enter transfer fee" className="input input-bordered w-full" />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Documentary Stamps</span>
              </label>
              <input type="number" placeholder="Enter documentary stamps" className="input input-bordered w-full" />
            </div>
          </div>
          <div className="mt-4 p-4 bg-base-200 rounded-lg">
            <p className="text-lg font-semibold">Total Costs: ₱0.00</p>
          </div>
          <button className="btn btn-primary w-full mt-4">Calculate Total</button>
        </div>
      </div>
    ),
    4: (
      <div className="card bg-base-100 shadow-lg border border-base-200 p-6">
        <h2 className="text-2xl font-bold mb-4">Document Submission</h2>
        
        {/* AI Verification Status Overview */}
        <div className="bg-base-200/50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">AI Verification Status</h3>
            <div className="badge badge-primary">Processing</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="stat bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-primary/20 hover:border-primary/30 transition-colors">
              <div className="stat-title font-medium text-primary/70">Personal Docs</div>
              <div className="stat-value text-2xl text-primary">85%</div>
              <div className="stat-desc text-primary/60">4/5 Verified</div>
            </div>
            <div className="stat bg-gradient-to-br from-warning/10 to-warning/5 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-warning/20 hover:border-warning/30 transition-colors">
              <div className="stat-title font-medium text-warning/70">Financial Docs</div>
              <div className="stat-value text-2xl text-warning">60%</div>
              <div className="stat-desc text-warning/60">2/4 Verified</div>
            </div>
            <div className="stat bg-gradient-to-br from-error/10 to-error/5 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-error/20 hover:border-error/30 transition-colors">
              <div className="stat-title font-medium text-error/70">Property Docs</div>
              <div className="stat-value text-2xl text-error">0%</div>
              <div className="stat-desc text-error/60">Pending</div>
            </div>
            <div className="stat bg-gradient-to-br from-success/10 to-success/5 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-success/20 hover:border-success/30 transition-colors">
              <div className="stat-title font-medium text-success/70">Legal Docs</div>
              <div className="stat-value text-2xl text-success">100%</div>
              <div className="stat-desc text-success/60">All Verified</div>
            </div>
          </div>
        </div>

        {/* Document Categories Tabs */}
        <div className="tabs tabs-boxed mb-6">
          <a 
            className={`tab ${activeDocTab === 'personal' ? 'tab-active' : ''}`}
            onClick={() => setActiveDocTab('personal')}
          >
            Personal
          </a>
          <a 
            className={`tab ${activeDocTab === 'financial' ? 'tab-active' : ''}`}
            onClick={() => setActiveDocTab('financial')}
          >
            Financial
          </a>
          <a 
            className={`tab ${activeDocTab === 'property' ? 'tab-active' : ''}`}
            onClick={() => setActiveDocTab('property')}
          >
            Property
          </a>
          <a 
            className={`tab ${activeDocTab === 'legal' ? 'tab-active' : ''}`}
            onClick={() => setActiveDocTab('legal')}
          >
            Legal
          </a>
        </div>

          {/* Document Upload Section */}
          <motion.div 
            className="space-y-6"
            key={activeDocTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="alert alert-info mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>Upload clear, high-quality scans for better AI verification scores</span>
            </div>          {/* Document List with Status */}
          <div className="space-y-4">
            {/* Personal Documents */}
            {activeDocTab === 'personal' && (
              <div className="grid gap-4">
                <div className="card bg-base-200/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">Valid ID (Primary)</h4>
                      <p className="text-sm text-base-content/70">Passport or Driver's License</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="badge badge-success gap-1">
                        <span className="w-2 h-2 bg-success rounded-full"></span>
                        Verified
                      </div>
                      <span className="text-success font-semibold">98%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <input type="file" className="file-input file-input-bordered file-input-sm w-full" />
                    <button className="btn btn-square btn-ghost btn-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                  </div>
                  <div className="mt-2 text-sm text-success">
                    ✓ High clarity scan
                    ✓ All details visible
                    ✓ No glare or shadows
                  </div>
                </div>

                <div className="card bg-base-200/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">Selfie with ID</h4>
                      <p className="text-sm text-base-content/70">For identity verification</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="badge badge-warning gap-1">
                        <span className="w-2 h-2 bg-warning rounded-full"></span>
                        Review
                      </div>
                      <span className="text-warning font-semibold">75%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <input type="file" className="file-input file-input-bordered file-input-sm w-full" />
                    <button className="btn btn-square btn-ghost btn-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                  </div>
                  <div className="mt-2 text-sm text-warning">
                    ⚠ Improve lighting
                    ✓ Face clearly visible
                    ⚠ Hold ID closer to camera
                  </div>
                </div>
              </div>
            )}

            {/* Financial Documents */}
            {activeDocTab === 'financial' && (
              <div className="grid gap-4">
                <div className="card bg-base-200/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">Income Statement</h4>
                      <p className="text-sm text-base-content/70">Latest 3 months pay slip</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="badge badge-success gap-1">
                        <span className="w-2 h-2 bg-success rounded-full"></span>
                        Verified
                      </div>
                      <span className="text-success font-semibold">95%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <input type="file" className="file-input file-input-bordered file-input-sm w-full" multiple />
                    <button className="btn btn-square btn-ghost btn-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                  </div>
                  <div className="mt-2 text-sm text-success">
                    ✓ Complete documentation
                    ✓ Verified employer details
                  </div>
                </div>

                <div className="card bg-base-200/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">Bank Statements</h4>
                      <p className="text-sm text-base-content/70">Last 6 months statements</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="badge badge-error gap-1">
                        <span className="w-2 h-2 bg-error rounded-full"></span>
                        Missing
                      </div>
                      <span className="text-error font-semibold">0%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <input type="file" className="file-input file-input-bordered file-input-sm w-full" multiple />
                    <button className="btn btn-square btn-ghost btn-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Property Documents */}
            {activeDocTab === 'property' && (
              <div className="grid gap-4">
                <div className="card bg-base-200/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">Property Title</h4>
                      <p className="text-sm text-base-content/70">Original copy or certified true copy</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="badge badge-warning gap-1">
                        <span className="w-2 h-2 bg-warning rounded-full"></span>
                        Pending
                      </div>
                      <span className="text-warning font-semibold">0%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <input type="file" className="file-input file-input-bordered file-input-sm w-full" />
                    <button className="btn btn-square btn-ghost btn-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                  </div>
                </div>

                <div className="card bg-base-200/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">Tax Declaration</h4>
                      <p className="text-sm text-base-content/70">Current year property tax declaration</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="badge badge-warning gap-1">
                        <span className="w-2 h-2 bg-warning rounded-full"></span>
                        Pending
                      </div>
                      <span className="text-warning font-semibold">0%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <input type="file" className="file-input file-input-bordered file-input-sm w-full" />
                    <button className="btn btn-square btn-ghost btn-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Legal Documents */}
            {activeDocTab === 'legal' && (
              <div className="grid gap-4">
                <div className="card bg-base-200/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">Contract to Sell</h4>
                      <p className="text-sm text-base-content/70">Signed agreement document</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="badge badge-success gap-1">
                        <span className="w-2 h-2 bg-success rounded-full"></span>
                        Verified
                      </div>
                      <span className="text-success font-semibold">100%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <input type="file" className="file-input file-input-bordered file-input-sm w-full" />
                    <button className="btn btn-square btn-ghost btn-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                  </div>
                  <div className="mt-2 text-sm text-success">
                    ✓ All signatures present
                    ✓ Notarized copy
                    ✓ Complete pages
                  </div>
                </div>

                <div className="card bg-base-200/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">Special Power of Attorney</h4>
                      <p className="text-sm text-base-content/70">If applicable for representation</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="badge badge-neutral gap-1">
                        <span className="w-2 h-2 bg-neutral rounded-full"></span>
                        Optional
                      </div>
                      <span className="text-neutral font-semibold">N/A</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <input type="file" className="file-input file-input-bordered file-input-sm w-full" />
                    <button className="btn btn-square btn-ghost btn-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Document Verification Summary */}
          <div className="bg-base-200 p-4 rounded-lg mt-6">
            <h4 className="font-semibold mb-2">AI Verification Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Overall Document Quality</span>
                <div className="radial-progress text-primary" style={{"--value":85}}>85%</div>
              </div>
              <div className="flex justify-between items-center">
                <span>Verification Status</span>
                <div className="badge badge-success">12/15 Verified</div>
              </div>
              <div className="flex justify-between items-center">
                <span>Required Actions</span>
                <div className="badge badge-warning">3 Pending</div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button className="btn btn-primary flex-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 mr-2 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Submit All Documents
            </button>
            <button className="btn btn-outline">
              Save Progress
            </button>
          </div>
          </motion.div>
      </div>
    )
  };

  return (
    <DashboardLayout userRole={userRole}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-base-100 p-4" // Added ml-20 for sidebar spacing
      >
        <div className="container mx-auto max-w-[1400px] px-4">
          {/* Hero Section */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="card bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg overflow-hidden backdrop-blur-xl mb-8"
          >
            <div className="card-body p-8">
              <div className="flex items-center gap-4 mb-4">
                <RiRobot2Line className="w-8 h-8 text-primary-content" />
                <h1 className="text-3xl font-bold text-primary-content">BuySmart PH</h1>
              </div>
              <p className="text-xl text-primary-content/90 max-w-2xl">
                Your intelligent guide through every step of the property buying process
              </p>
              <div className="mt-6">
                <button className="btn btn-ghost btn-lg text-primary-content border-primary-content/20 hover:bg-transparent hover:text-primary-content hover:border-primary-content">
                  Start Your Journey
                </button>
              </div>
            </div>
          </motion.div>

          {/* AI Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {buyingSteps.map((step) => (
              <motion.div
                key={step.id}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className={`card bg-gradient-to-br ${step.bgGradient} backdrop-blur-xl shadow-lg cursor-pointer`}
                onClick={() => setActiveStep(step.id)}
              >
                <div className="card-body p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <step.icon className={`w-8 h-8 ${step.color} mb-4`} />
                      <h3 className={`text-lg font-bold ${step.color}`}>
                        {step.title}
                      </h3>
                      <p className="text-base-content/70 text-sm mt-2">
                        {step.description}
                      </p>
                    </div>
                    {activeStep === step.id && (
                      <div className="rounded-full bg-success/10 p-1">
                        <RiCheckboxCircleLine className="w-5 h-5 text-success" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Dynamic Content Section */}
          <motion.div 
            key={activeStep}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {stepContent[activeStep]}
          </motion.div>

          {/* Property Listings Section */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Featured Properties</h2>
              <div className="flex items-center gap-4">
                <button className="btn btn-outline btn-sm gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter
                </button>
                <select className="select select-bordered select-sm">
                  <option>Latest First</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Most Popular</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.slice(0, displayCount).map((listing, index) => (
                <motion.div 
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group backdrop-blur-xl border border-base-300/10"
                >
                  <figure className="relative h-48 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-base-100/80 via-transparent to-transparent z-10"></div>
                    <img 
                      src={listing.images?.[0] || "https://via.placeholder.com/400x300?text=No+Image"}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 flex gap-2 z-20">
                      {listing.days_on_market === "Unknown" && (
                        <div className="badge bg-blue-800/90 text-white border-0 backdrop-blur-md shadow-lg">New</div>
                      )}
                      {listing.furnishing === "Semi Furnished" && (
                        <div className="badge bg-blue-700/90 text-white border-0 backdrop-blur-md shadow-lg">Semi Furnished</div>
                      )}
                      {listing.furnishing === "Fully Furnished" && (
                        <div className="badge bg-blue-600/90 text-white border-0 backdrop-blur-md shadow-lg">Fully Furnished</div>
                      )}
                    </div>
                    <div className="absolute bottom-4 right-4 z-20">
                      <button className="btn btn-circle btn-sm bg-white/80 backdrop-blur-md hover:bg-blue-800 hover:text-white border border-blue-700/10 shadow-lg transition-all duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  </figure>
                  <div className="card-body p-4 flex flex-col h-full bg-gradient-to-b from-base-100 to-base-200/20">
                    {/* Header Section */}
                    <div className="flex-none">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold mb-1.5 line-clamp-2 leading-tight bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent">{listing.title}</h3>
                          <p className="text-sm text-base-content/70 flex items-center gap-1.5">
                            <RiMapPinLine className="h-4 w-4 flex-shrink-0 text-blue-600" />
                            <span className="truncate">{listing.location}</span>
                          </p>
                        </div>
                        <div className="text-right ml-4 flex-none">
                          <p className="text-xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 text-white px-3 py-1 rounded-full shadow-lg whitespace-nowrap">{listing.price}</p>
                          {listing.lot_area_sqm > 0 && (
                            <p className="text-xs text-base-content/50 mt-1 whitespace-nowrap">
                              ₱{Math.round(parseInt(listing.price.replace(/[^0-9]/g, '')) / listing.lot_area_sqm).toLocaleString()}/sqm
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="divider my-2 before:bg-gradient-to-r before:from-blue-700/20 before:to-blue-500/20 after:bg-gradient-to-r after:from-blue-500/20 after:to-blue-700/20"></div>
                    </div>

                    {/* Main Content Section */}
                    <div className="flex-1">
                      <div className="grid grid-cols-3 gap-2 text-sm mb-4">
                        <div className="flex flex-col items-center p-2 rounded-lg bg-gradient-to-br from-blue-700/5 to-blue-800/10 backdrop-blur-sm border border-blue-700/10 hover:border-blue-700/20 transition-colors">
                          <span className="text-base-content/70 text-xs">Area</span>
                          <span className="font-semibold mt-0.5 text-blue-700">{listing.floor_area_sqm} sqm</span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-lg bg-gradient-to-br from-blue-600/5 to-blue-700/10 backdrop-blur-sm border border-blue-600/10 hover:border-blue-600/20 transition-colors">
                          <span className="text-base-content/70 text-xs">Beds</span>
                          <span className="font-semibold mt-0.5 text-blue-600">{listing.beds || '0'}</span>
                        </div>
                        <div className="flex flex-col items-center p-2 rounded-lg bg-gradient-to-br from-blue-500/5 to-blue-600/10 backdrop-blur-sm border border-blue-500/10 hover:border-blue-500/20 transition-colors">
                          <span className="text-base-content/70 text-xs">Baths</span>
                          <span className="font-semibold mt-0.5 text-blue-500">{listing.baths || '0'}</span>
                        </div>
                      </div>

                      {listing.amenities && listing.amenities.length > 0 && listing.amenities[0] !== "Not specified" && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {listing.amenities.slice(0, 3).map((amenity) => (
                            <div key={amenity} className="badge bg-gradient-to-r from-blue-800/10 to-blue-700/10 text-base-content border-blue-700/20 hover:border-blue-600/30 transition-colors backdrop-blur-sm">{amenity}</div>
                          ))}
                          {listing.amenities.length > 3 && (
                            <div className="badge bg-gradient-to-r from-blue-700/10 to-blue-600/10 text-base-content border-blue-600/20 hover:border-blue-500/30 transition-colors backdrop-blur-sm">+{listing.amenities.length - 3} more</div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer Section */}
                    <div className="flex-none pt-2 border-t border-gradient-to-r from-blue-800/20 to-blue-600/20">
                      <div className="flex items-center gap-2 mb-3 text-xs text-base-content/60">
                        <RiPriceTag3Line className="h-3.5 w-3.5 text-blue-600" />
                        Listed {listing.days_on_market === "Unknown" ? "Recently" : listing.days_on_market + " ago"}
                      </div>
                      <div className="flex gap-2">
                        <button className="btn border-0 flex-1 normal-case bg-gradient-to-r from-blue-900 to-blue-700 text-white hover:brightness-110 transition-all duration-300 shadow-lg hover:shadow-xl">
                          View Details
                        </button>
                        <button className="btn btn-ghost btn-square bg-gradient-to-br from-blue-200/50 to-blue-300/50 hover:from-blue-700/20 hover:to-blue-600/20 border border-base-content/10 shadow-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {displayCount < listings.length && (
              <div className="flex justify-center mt-8">
                <button 
                  className="btn btn-outline gap-2"
                  onClick={() => setDisplayCount(prev => prev + 9)}
                >
                  Load More Properties
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

export default BuySmartPH;