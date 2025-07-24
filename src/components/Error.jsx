import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function Error() {
    const navigate = useNavigate();
    const location = useLocation();
    
const handleGoBack = () => {
    if (location.state?.from) {
        const { hash } = location.state.from;

        // Go back to previous page
        navigate(-1);

        // Wait a moment and scroll to the hash ID
        setTimeout(() => {
            const id = hash.replace('#', '');
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView(); // instant scroll
            }
        }, 50);
    } else {
        navigate('/');
    }
};



    return (
        <div className="min-h-screen flex items-center justify-center px-4 transition-colors duration-300"

            style={{ backgroundColor: 'var(--bg-primary)' }}
        >
            <div className="text-center">

                <h2 className="text-2xl md:text-4xl font-bold mb-4 transition-colors duration-300"
                    style={{ color: 'var(--text-primary)' }}
                >
                    Page Not Found
                </h2>
                <p className="mb-8 transition-colors duration-300"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    Sorry, this feature is not yet implemented or the page you're looking for doesn't exist.
                </p>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGoBack}
                    className="px-6 py-3 btn btn-primary btn-lg text-white rounded-full transition-colors duration-300 shadow-lg"
                >
                    Go Back Home
                </motion.button>

            </div>
        </div>
    );
}

export default Error;