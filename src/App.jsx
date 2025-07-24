import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landingpage/LandingPage.jsx';
import Properties from './pages/Properties';
import AboutUs from './pages/About/AboutUs.jsx';
import Error from './components/Error';
import ChatbotIcon from './components/ChatbotIcon';

function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/properties" element={<Properties />} />
                <Route path='/about' element={<AboutUs />} />
                <Route path="/error" element={<Error />} />
                <Route path="*" element={<Error />} />

            </Routes>
            <ChatbotIcon />
        </>
    );
}

export default App;
