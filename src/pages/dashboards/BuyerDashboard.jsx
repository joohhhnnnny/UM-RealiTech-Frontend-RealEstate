import { memo, useMemo, useState, useEffect } from 'react';
import { motion } from "framer-motion";
import DashboardLayout from "../../layouts/DashboardLayout";
import { 
  RiHomeSmileLine, 
  RiEarthLine, 
  RiBankLine, 
  RiHome6Line,  
  RiTimeLine,
  RiAddLine, 
  RiCheckboxCircleLine, 
  RiErrorWarningLine 
} from 'react-icons/ri';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const BuyerDashboard = () => {
  const [buyerData, setBuyerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuyerData = async () => {
      try {
        const auth = getAuth();
        const db = getFirestore();
        const user = auth.currentUser;

        if (user) {
          const buyerDoc = await getDoc(doc(db, 'buyers', user.uid));
          if (buyerDoc.exists()) {
            setBuyerData(buyerDoc.data());
          }
        }
      } catch (error) {
        console.error("Error fetching buyer data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuyerData();
  }, []);

  // Memoize stats data
  const stats = useMemo(() => [
    {
      title: "Active Projects",
      value: buyerData?.buyerProfile?.activeProjects?.length || "0",
      subtitle: "Ongoing developments",
      icon: RiHomeSmileLine,
      trend: "+8% from last month",
      color: "text-blue-500",
      bgGradient: "from-blue-500/20 to-blue-500/5"
    },
    {
      title: "Saved Properties",
      value: buyerData?.buyerProfile?.savedProperties?.length || "0",
      subtitle: "Properties you've saved",
      icon: RiEarthLine,
      trend: "+5% this week",
      color: "text-emerald-500",
      bgGradient: "from-emerald-500/20 to-emerald-500/5"
    },
    {
      title: "Pre-Approved",
      value: buyerData?.buyerProfile?.financialInfo?.preApprovalStatus === 'approved' ? "Yes" : "No",
      subtitle: "Loan status",
      icon: RiBankLine,
      trend: buyerData?.buyerProfile?.financialInfo?.preApprovalStatus === 'approved' ? "Ready" : "Pending",
      color: buyerData?.buyerProfile?.financialInfo?.preApprovalStatus === 'approved' ? "text-purple-500" : "text-amber-500",
      bgGradient: buyerData?.buyerProfile?.financialInfo?.preApprovalStatus === 'approved' ? "from-purple-500/20 to-purple-500/5" : "from-amber-500/20 to-amber-500/5"
    },
    {
      title: "Viewings Scheduled",
      value: buyerData?.buyerProfile?.scheduledViewings?.length || "0",
      subtitle: "Upcoming property viewings",
      icon: RiHome6Line, 
      trend: "1 tomorrow",
      color: "text-amber-500",
      bgGradient: "from-amber-500/20 to-amber-500/5"
    }
  ], [buyerData]);

  if (loading) {
    return (
      <DashboardLayout userRole="buyer">
        <div className="min-h-screen bg-base-100 p-6 flex items-center justify-center">
          <div className="text-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="mt-4 text-base-content">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="buyer">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-base-100 p-6"
      >
        <div className="max-w-[1400px] mx-auto">
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
                    Welcome back, {buyerData?.fullName || 'Buyer'} 👋
                  </h2>
                  <h1 className="text-3xl font-bold text-primary-content">
                    Buyer Dashboard
                  </h1>
                  <p className="text-sm text-primary-content/70 max-w-md">
                    Browse and track your favorite properties.
                  </p>
                </div>
                <div className="hidden lg:block">
                  <div className="stats bg-primary-content/10 text-primary-content">
                    <div className="stat place-items-center">
                      <div className="stat-title text-primary-content/80">Total</div>
                      <div className="stat-value text-2xl">
                        {buyerData?.buyerProfile?.savedProperties?.length || 0}
                      </div>
                      <div className="stat-desc text-primary-content/60">Saved Properties</div>
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
                    <p className="text-xs text-success mt-1">
                      {stat.trend}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* My Projects Section - You can implement this similarly with real data */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">My Properties</h2>
              <button className="btn btn-primary">
                Visited Listings
              </button>
            </div>
            {buyerData?.buyerProfile?.savedProperties?.length > 0 ? (
              <div className="space-y-6">
                {/* Render saved properties here */}
                <div className="card bg-base-100 shadow-lg">
                  <div className="card-body">
                    <p>Your saved properties will appear here</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body text-center py-8">
                  <p>You haven't saved any properties yet</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default memo(BuyerDashboard);