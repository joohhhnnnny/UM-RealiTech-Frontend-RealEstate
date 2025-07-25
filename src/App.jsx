import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landingpage/LandingPage.jsx';
import Properties from './pages/Properties';
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
import DevTrackr from './pages/devtrackr/DevTrackr';
import Notif from './pages/quickactions/Notif';
import Msg from './pages/quickactions/Msg';
import Settings from './pages/quickactions/Settings';

function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/properties" element={<Properties />} />
                <Route path='/about' element={<AboutUs />} />
                <Route path="/error" element={<Error />} />
                <Route path="*" element={<Error />} />
                <Route path="/dashboard/buyer" element={<BuyerDashboard />} />
                <Route path="/dashboard/agent" element={<AgentDashboard />} />
                <Route path="/dashboard/developer" element={<DeveloperDashboard />} />
                <Route path="/dashboard/buysmartph" element={<BuySmartPH />} />
                <Route path="/dashboard/realtyconnect" element={<RealtyConnect />} />
                <Route path="/dashboard/propguard" element={<PropGuard />} />
                {/* <Route path="/dashboard/chatbot" element={<ChatBot />} /> */}
                <Route path="/dashboard/devtrackr" element={<DevTrackr />} />
                <Route path="/dashboard/notifications" element={<Notif />} />
                <Route path="/dashboard/messages" element={<Msg />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
            <ChatbotIcon />
            
        </>
    );
}

export default App;
