import { motion } from "framer-motion";
import { useState } from "react";
import { 
  RiBuildingLine, 
  RiGroupLine, 
  RiBarChartBoxLine,
  RiSettings4Line,
  RiLineChartLine,
} from 'react-icons/ri';
import Overview from './developersmartPH/Overview';
import Projects from './developersmartPH/Projects';
import BuyerInsights from './developersmartPH/BuyerInsights';
import Analytics from './developersmartPH/Analytics';

function DeveloperBSPH() {
  const [activeTab, setActiveTab] = useState('overview');
  
  const [projectStats] = useState({
    totalProjects: 12,
    activeProjects: 4,
    totalUnits: 2847,
    soldUnits: 1923,
    totalRevenue: "₱18.5B",
    averagePrice: "₱6.5M"
  });

  const [projects] = useState([
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
  ]);

  const [buyerInsights] = useState([
    {
      segment: "First Time Buyers",
      percentage: 45,
      avgBudget: "₱3.2M",
      topLocation: "Quezon City",
      color: "text-blue-600",
      bgColor: "from-blue-500/10 to-blue-600/5",
      borderColor: "border-blue-500/20"
    },
    {
      segment: "OFW Buyers",
      percentage: 28,
      avgBudget: "₱5.8M",
      topLocation: "Makati City",
      color: "text-emerald-600",
      bgColor: "from-emerald-500/10 to-emerald-600/5",
      borderColor: "border-emerald-500/20"
    },
    {
      segment: "Investors",
      percentage: 18,
      avgBudget: "₱8.5M",
      topLocation: "BGC",
      color: "text-purple-600",
      bgColor: "from-purple-500/10 to-purple-600/5",
      borderColor: "border-purple-500/20"
    },
    {
      segment: "Upgraders",
      percentage: 9,
      avgBudget: "₱12.3M",
      topLocation: "Ortigas",
      color: "text-amber-600",
      bgColor: "from-amber-500/10 to-amber-600/5",
      borderColor: "border-amber-500/20"
    }
  ]);

  const tabContent = {
    overview: <Overview projectStats={projectStats} />,
    projects: <Projects projects={projects} />,
    buyers: <BuyerInsights buyerInsights={buyerInsights} />,
    analytics: <Analytics />
  };

  return (
    <div className="space-y-8">
      {/* Developer Navigation Tabs */}
      <div className="tabs tabs-boxed bg-base-200 p-1">
        <a 
          className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <RiBarChartBoxLine className="w-4 h-4 mr-2" />
          Overview
        </a>
        <a 
          className={`tab ${activeTab === 'projects' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          <RiBuildingLine className="w-4 h-4 mr-2" />
          Projects
        </a>
        <a 
          className={`tab ${activeTab === 'buyers' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('buyers')}
        >
          <RiGroupLine className="w-4 h-4 mr-2" />
          Buyer Insights
        </a>
        <a 
          className={`tab ${activeTab === 'analytics' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <RiLineChartLine className="w-4 h-4 mr-2" />
          Analytics
        </a>
      </div>

      {/* Dynamic Content */}
      <motion.div 
        key={activeTab}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {tabContent[activeTab]}
      </motion.div>
    </div>
  );
}

export default DeveloperBSPH;