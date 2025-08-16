import { motion } from "framer-motion";
import DashboardLayout from "../../layouts/DashboardLayout";
import { 
  RiHomeSmileLine, RiMoneyDollarCircleLine, RiStarSmileLine, 
  RiLineChartLine, RiAddLine, RiCheckboxCircleLine, 
  RiTimeLine, RiErrorWarningLine, RiEyeLine, RiCalendarLine 
} from 'react-icons/ri';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { db, auth } from '../../config/Firebase';
import { getThumbnailImageUrl } from '../../utils/imageHelpers';
import { DEFAULT_PROPERTY_IMAGE, debugLog } from '../../constants/propertyConstants';

// Utility function to fix agent names (matching MyListing.jsx)
const fixAgentName = (agentName, agentEmail) => {
  if (!agentName || agentName === 'undefined undefined' || agentName.trim() === '' || agentName.includes('undefined')) {
    if (agentEmail) {
      const emailPart = agentEmail.split('@')[0];
      return emailPart.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, ' ').trim() || 'Professional Agent';
    }
    return 'Professional Agent';
  }
  return agentName;
};

// Utility function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Utility function to calculate progress based on listing status
const calculateListingProgress = (listing) => {
  if (!listing.buyers || listing.buyers.length === 0) return 0;
  
  const buyer = listing.buyers[0]; // Get the first buyer for progress calculation
  switch (buyer.status) {
    case 'interested': return 25;
    case 'viewing_scheduled': return 35;
    case 'offer_made': return 50;
    case 'negotiating': return 65;
    case 'contract_signed': return 80;
    case 'payment_processing': return 90;
    case 'completed': return 100;
    default: return 15;
  }
};

// Utility function to get listing steps based on buyer status
const getListingSteps = (listing) => {
  if (!listing.buyers || listing.buyers.length === 0) {
    return [
      { title: "Property Listed", status: "completed", date: listing.createdAt ? new Date(listing.createdAt.toDate()).toLocaleDateString() : "Today" },
      { title: "Awaiting Buyers", status: "current", date: "In Progress" },
      { title: "Viewing Scheduled", status: "pending", date: "Pending" },
      { title: "Offer & Negotiation", status: "pending", date: "Pending" }
    ];
  }

  const buyer = listing.buyers[0];
  const steps = [
    { title: "Property Listed", status: "completed", date: listing.createdAt ? new Date(listing.createdAt.toDate()).toLocaleDateString() : "Today" },
    { title: "Buyer Interested", status: buyer.status ? "completed" : "pending", date: buyer.contactDate || "Pending" },
    { title: "Viewing Scheduled", status: ["viewing_scheduled", "offer_made", "negotiating", "contract_signed", "payment_processing", "completed"].includes(buyer.status) ? "completed" : buyer.status === "interested" ? "current" : "pending", date: buyer.viewingDate || "Pending" },
    { title: "Offer & Negotiation", status: ["offer_made", "negotiating", "contract_signed", "payment_processing", "completed"].includes(buyer.status) ? buyer.status === "negotiating" ? "current" : "completed" : "pending", date: buyer.offerDate || "Pending" }
  ];

  if (["contract_signed", "payment_processing", "completed"].includes(buyer.status)) {
    steps.push({ title: "Contract Signed", status: buyer.status === "contract_signed" ? "current" : "completed", date: buyer.contractDate || "Pending" });
  }

  if (buyer.status === "completed") {
    steps.push({ title: "Sale Completed", status: "completed", date: buyer.completionDate || "Recently" });
  }

  return steps;
};

function AgentDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Get current user (matching MyListing.jsx approach)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        debugLog('Firebase user authenticated:', firebaseUser.uid);
        setCurrentUser(firebaseUser);
      } else {
        debugLog('No Firebase user, checking localStorage');
        const userData = localStorage.getItem('userData');
        if (userData) {
          try {
            const parsedData = JSON.parse(userData);
            const userObj = {
              uid: parsedData.uid || parsedData.userNumber || parsedData.id,
              email: parsedData.email,
              fullName: parsedData.fullName || `${parsedData.firstName || ''} ${parsedData.lastName || ''}`.trim(),
              firstName: parsedData.firstName,
              lastName: parsedData.lastName,
              phone: parsedData.phone,
              role: parsedData.role
            };
            setCurrentUser(userObj);
          } catch (error) {
            console.error('Error parsing user data:', error);
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch dynamic data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser?.uid) {
        console.log('No current user or uid:', currentUser);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching dashboard data for user:', currentUser.uid);

        // Fetch listings from Firebase (matching MyListing.jsx)
        const listingsRef = collection(db, 'listings');
        const listingsQuery = query(
          listingsRef, 
          where('agentId', '==', currentUser.uid)
        );
        
        const listingsSnapshot = await getDocs(listingsQuery);
        const listings = [];
        
        listingsSnapshot.forEach((doc) => {
          const data = doc.data();
          listings.push({
            id: doc.id,
            firestoreId: doc.id,
            ...data,
            progress: calculateListingProgress(data),
            steps: getListingSteps(data)
          });
        });

        // Calculate current month and previous month data
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        // Calculate weekly data (last 7 days vs previous 7 days)
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        // Filter listings by date ranges for trend calculations
        const thisWeekListings = listings.filter(listing => {
          if (!listing.createdAt) return false;
          const listingDate = listing.createdAt.toDate ? listing.createdAt.toDate() : new Date(listing.createdAt);
          return listingDate >= lastWeek;
        });

        const lastWeekListings = listings.filter(listing => {
          if (!listing.createdAt) return false;
          const listingDate = listing.createdAt.toDate ? listing.createdAt.toDate() : new Date(listing.createdAt);
          return listingDate >= twoWeeksAgo && listingDate < lastWeek;
        });

        // Calculate sold properties and commissions
        const soldListings = listings.filter(listing => 
          listing.buyers && listing.buyers.some(buyer => buyer.status === 'completed')
        );

        const currentMonthSold = soldListings.filter(listing => {
          if (!listing.updatedAt) return false;
          const updateDate = listing.updatedAt.toDate ? listing.updatedAt.toDate() : new Date(listing.updatedAt);
          return updateDate.getMonth() === currentMonth && updateDate.getFullYear() === currentYear;
        });

        const lastMonthSold = soldListings.filter(listing => {
          if (!listing.updatedAt) return false;
          const updateDate = listing.updatedAt.toDate ? listing.updatedAt.toDate() : new Date(listing.updatedAt);
          return updateDate.getMonth() === lastMonth && updateDate.getFullYear() === lastMonthYear;
        });

        // Calculate average commission (assuming 2.5% commission rate)
        const commissionRate = 0.025;
        const pendingCommissions = listings
          .filter(listing => listing.buyers && listing.buyers.some(buyer => 
            ['offer_made', 'negotiating', 'contract_signed', 'payment_processing'].includes(buyer.status)
          ))
          .reduce((total, listing) => {
            const price = parseFloat(listing.price.replace(/[₱,]/g, '')) || 0;
            return total + (price * commissionRate);
          }, 0);

        // Calculate ratings (mock data - you can implement actual ratings)
        const mockCurrentRating = 4.2 + (Math.random() * 0.6); // 4.2 to 4.8
        const mockPreviousRating = mockCurrentRating - 0.1 - (Math.random() * 0.3);
        const ratingChange = mockCurrentRating - mockPreviousRating;

        // Calculate dynamic trends
        const activeListingsTrend = thisWeekListings.length - lastWeekListings.length;
        const commissionTrend = currentMonthSold.length > 0 && lastMonthSold.length > 0 ? 
          ((currentMonthSold.length - lastMonthSold.length) / lastMonthSold.length * 100) : 0;
        const salesTrend = currentMonthSold.length - lastMonthSold.length;

        const calculatedStats = [
          {
            title: "Active Listings",
            value: listings.length,
            subtitle: "Properties on market",
            icon: RiHomeSmileLine,
            trend: activeListingsTrend >= 0 ? 
              `+${activeListingsTrend} this week` : 
              `${activeListingsTrend} this week`,
            trendColor: activeListingsTrend >= 0 ? "text-success" : "text-error",
            color: "text-blue-500",
            bgGradient: "from-blue-500/20 to-blue-500/5"
          },
          {
            title: "Pending Commissions",
            value: formatCurrency(pendingCommissions),
            subtitle: "Expected earnings",
            icon: RiMoneyDollarCircleLine,
            trend: commissionTrend >= 0 ? 
              `+${commissionTrend.toFixed(1)}% from last month` : 
              `${commissionTrend.toFixed(1)}% from last month`,
            trendColor: commissionTrend >= 0 ? "text-success" : "text-error",
            color: "text-emerald-500",
            bgGradient: "from-emerald-500/20 to-emerald-500/5"
          },
          {
            title: "Average Rating",
            value: mockCurrentRating.toFixed(1),
            subtitle: `From ${Math.floor(Math.random() * 20) + 5} reviews`,
            icon: RiStarSmileLine,
            trend: ratingChange >= 0 ? 
              `+${ratingChange.toFixed(1)} this month` : 
              `${ratingChange.toFixed(1)} this month`,
            trendColor: ratingChange >= 0 ? "text-success" : "text-error",
            color: "text-amber-500",
            bgGradient: "from-amber-500/20 to-amber-500/5"
          },
          {
            title: "Sales This Month",
            value: currentMonthSold.length,
            subtitle: "Properties sold",
            icon: RiLineChartLine,
            trend: salesTrend >= 0 ? 
              `+${salesTrend} vs last month` : 
              `${salesTrend} vs last month`,
            trendColor: salesTrend >= 0 ? "text-success" : "text-error",
            color: "text-purple-500",
            bgGradient: "from-purple-500/20 to-purple-500/5"
          }
        ];

        setStats(calculatedStats);
        setMyListings(listings);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setMyListings([]);
        setStats([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <DashboardLayout userRole="agent">
        <div className="min-h-screen bg-base-100 p-4 flex items-center justify-center">
          <div className="text-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="mt-4 text-base-content">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="agent">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-base-100 p-4"
      >
        <div className="container mx-auto max-w-[1400px] px-4">
          {/* Welcome Section */}
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="card bg-gradient-to-r from-primary/90 to-primary shadow-lg overflow-hidden backdrop-blur-xl"
          >
            <div className="card-body p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="text-lg font-medium text-primary-content/80">
                    Welcome back, {fixAgentName(
                      currentUser?.fullName || currentUser?.displayName || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim(),
                      currentUser?.email
                    )} 👋
                  </h2>
                  <h1 className="text-3xl font-bold text-primary-content">
                    Agent Dashboard
                  </h1>
                  <p className="text-sm text-primary-content/70 max-w-md">
                    Track your listings, commissions, and client interactions all in one place.
                  </p>
                </div>
                <div className="hidden lg:block">
                  <div className="stats bg-primary-content/10 text-primary-content">
                    <div className="stat place-items-center">
                      <div className="stat-title text-primary-content/80">Total</div>
                      <div className="stat-value text-2xl">
                        {myListings.filter(listing => 
                          listing.buyers && listing.buyers.some(buyer => buyer.status === 'completed')
                        ).length}
                      </div>
                      <div className="stat-desc text-primary-content/60">Properties Sold</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {stats.map((stat) => (
              <motion.div
                key={stat.title}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className={`card bg-gradient-to-br ${stat.bgGradient} backdrop-blur-xl shadow-lg`}
              >
                <div className="card-body p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-base-content/70 text-sm font-medium">
                        {stat.title}
                      </p>
                      <h3 className={`text-2xl font-bold mt-2 ${stat.color}`}>
                        {stat.value}
                      </h3>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgGradient}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-base-content/60">
                      {stat.subtitle}
                    </p>
                    <p className={`text-xs mt-1 font-medium ${stat.trendColor || 'text-success'}`}>
                      {stat.trend}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Updated Listings Section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Property Listings</h2>
                <p className="text-base-content/60 mt-1">
                  Manage and track your property listings
                </p>
              </div>
            </div>

            {/* Active Listings */}
            {myListings.length > 0 ? (
              myListings.map((listing) => (
                <motion.div
                  key={listing.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="card bg-base-100 shadow-lg overflow-hidden mb-6"
                >
                  <div className="flex flex-col lg:flex-row">
                    <div className="lg:w-1/3 h-[200px] lg:h-auto relative">
                      <img 
                        src={getThumbnailImageUrl(listing) || listing.images?.[0] || listing.image || DEFAULT_PROPERTY_IMAGE}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = DEFAULT_PROPERTY_IMAGE;
                        }}
                      />
                      <div className="absolute top-4 left-4">
                        <span className={`badge ${
                          listing.status === 'Available' ? 'badge-success' :
                          listing.status === 'Under Negotiation' ? 'badge-warning' :
                          listing.status === 'Sold' ? 'badge-info' :
                          'badge-primary'
                        }`}>
                          {listing.status || 'Available'}
                        </span>
                      </div>
                      {listing.buyers && listing.buyers.length > 0 && (
                        <div className="absolute top-4 right-4">
                          <div className="badge badge-secondary">
                            {listing.buyers.length} {listing.buyers.length === 1 ? 'Buyer' : 'Buyers'}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="lg:w-2/3 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold">{listing.title}</h3>
                          <p className="text-base-content/60">{listing.location}</p>
                          <p className="text-lg font-semibold text-primary mt-2">{listing.price}</p>
                          <div className="flex gap-4 text-sm text-base-content/60 mt-2">
                            <span className="flex items-center gap-1">
                              <RiHomeSmileLine className="w-4 h-4" />
                              {listing.bedrooms} beds
                            </span>
                            <span>{listing.bathrooms} baths</span>
                            <span>{listing.floorArea} sqm</span>
                          </div>
                        </div>
                        <div className="text-right">
                          {listing.buyers && listing.buyers.length > 0 ? (
                            <div className="flex items-center gap-2">
                              <img 
                                src={listing.buyers[0].avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${listing.buyers[0].name || 'Buyer'}&backgroundColor=b6e3f4`}
                                alt={listing.buyers[0].name || "Buyer"}
                                className="w-8 h-8 rounded-full"
                              />
                              <div>
                                <p className="text-sm font-medium">{listing.buyers[0].name || "Interested Buyer"}</p>
                                <p className="text-xs text-base-content/60 capitalize">{listing.buyers[0].status?.replace('_', ' ') || "Interested"}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center">
                              <RiEyeLine className="w-6 h-6 text-base-content/40 mx-auto mb-1" />
                              <p className="text-xs text-base-content/60">Awaiting Buyers</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Steps */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {listing.steps.map((step, index) => (
                          <div 
                            key={index}
                            className="flex items-start gap-3"
                          >
                            {step.status === 'completed' && (
                              <RiCheckboxCircleLine className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                            )}
                            {step.status === 'current' && (
                              <RiTimeLine className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                            )}
                            {step.status === 'pending' && (
                              <RiErrorWarningLine className="w-5 h-5 text-base-content/30 mt-1 flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className={`text-sm font-medium ${
                                step.status === 'pending' ? 'text-base-content/50' : ''
                              }`}>{step.title}</p>
                              <p className="text-xs text-base-content/60 flex items-center gap-1">
                                <RiCalendarLine className="w-3 h-3" />
                                {step.date}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="text-center py-8">
                    <RiHomeSmileLine className="mx-auto h-12 w-12 text-base-content/30 mb-4" />
                    <h3 className="mt-2 text-lg font-medium text-base-content">No active listings</h3>
                    <p className="mt-1 text-sm text-base-content/60">
                      You don't have any active property listings yet.
                    </p>
                    <div className="mt-6">
                      <button className="btn btn-primary" onClick={() => window.location.href = '/agentsmartph/my-listing'}>
                        <RiAddLine className="w-5 h-5 mr-2" />
                        Add New Listing
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

export default AgentDashboard;