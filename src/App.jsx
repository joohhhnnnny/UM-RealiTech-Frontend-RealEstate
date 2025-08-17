import { Routes, Route } from 'react-router-dom';
import { useState } from 'react'; // Add this import
import LoadingScreen from './components/Loadingscreen';
import LandingPage from './pages/landingpage/LandingPage.jsx';
import Properties from './pages/properties/Properties.jsx';
import ViewProperties from './pages/properties/Viewproperties.jsx'; // Add this import
import AboutUs from './pages/About/AboutUs.jsx';
import Error from './components/Error';
import ChatbotIcon from './components/ChatbotIcon';
import BuyerDashboard from './pages/dashboards/BuyerDashboard';
import AgentDashboard from './pages/dashboards/AgentDashboard';
import DeveloperDashboard from './pages/dashboards/DeveloperDashboard';
import BuySmartPH from './pages/buysmartph/BuySmartPH';
import RealtyConnect from './pages/realtyconnect/RealtyConnect';
import PropGuard from './pages/propguard/PropGuard';
// import ChatBot from './pages/propguard/ChatBot.jsx';
import BuildSafe from './pages/buildsafe/BuildSafe.jsx';
import Notif from './pages/quickactions/Notif';
import Msg from './pages/quickactions/Msg';
import Settings from './pages/quickactions/Settings';
import ActivityLog from './pages/quickactions/ActivityLog';
import DashboardLayout from './layouts/DashboardLayout';
import AuthContainer from './pages/Authentication/AuthContainer.jsx';
import SystemTourDemo from './components/SystemTourDemo.jsx';
import ProtectedRoute from './components/ProtectedRoute'; // Import your ProtectedRoute

function App() {
    const [isLoaded, setIsLoaded] = useState(false); // Add this state declaration
    
    return (
        <>  
            {!isLoaded && <LoadingScreen onComplete={() => setIsLoaded(true)} />}
            <div 
                className={`min-h-screen transition-opacity duration-700 ${
                    isLoaded ? "opacity-100" : "opacity-0"
                } bg-black text-gray-100`}
            >
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<AuthContainer />} />
                    <Route path="/signup" element={<AuthContainer />} />
                    <Route path="/properties" element={<Properties />} />
                    <Route path="/properties/:id" element={<ViewProperties />} /> {/* Add this new route */}
                    <Route path='/about' element={<AboutUs />} />
                    <Route path="/error" element={<Error />} />
                    <Route path="*" element={<Error />} />
                    <Route
                      path="/dashboard/buyer"
                      element={
                        <ProtectedRoute>
                          <BuyerDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/agent"
                      element={
                        <ProtectedRoute>
                          <AgentDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/developer"
                      element={
                        <ProtectedRoute>
                          <DeveloperDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/dashboard/buysmartph" element={<BuySmartPH />} />
                    <Route path="/dashboard/realtyconnect" element={<RealtyConnect />} />
                    <Route path="/dashboard/propguard" element={<PropGuard />} />
                    {/* <Route path="/dashboard/chatbot" element={<ChatBot />} /> */}
                    <Route path="/dashboard/buildsafe" element={<BuildSafe />} />
                    <Route path="/dashboard/notifications" element={<Notif />} />
                    <Route path="/dashboard/messages" element={<Msg />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/dashboard/audit-log" element={<ActivityLog />} />
                    <Route path="/tour-demo" element={<SystemTourDemo />} />
                </Routes>
                <ChatbotIcon />
            </div>
        </>
    );
}

export default App;
