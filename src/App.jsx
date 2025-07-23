import './styles/darkMode.css';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage/Home';
import Properties from './pages/Properties';
import ChatbotIcon from './components/ChatbotIcon';

function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/properties" element={<Properties />} />
            </Routes>
            <ChatbotIcon />
        </>
    );
}

export default App;
