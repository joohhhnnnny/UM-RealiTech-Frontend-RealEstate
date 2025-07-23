// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import Navbar from '/src/components/Navbar.jsx'
import Solutions from './Solutions';
import Footer from '/src/components/Footer.jsx'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

function Home(){
    const navigate = useNavigate();
    const [searchPlaceholder, setSearchPlaceholder] = useState('');
    const phrases = [
        'Search for your dream home...',
        'Find properties in Cebu City...',
        'Discover condos in Manila...',
        'Explore houses in Davao...'
    ];

    useEffect(() => {
        let currentPhraseIndex = 0;
        let currentCharIndex = 0;
        let isDeleting = false;

        const type = () => {
            const currentPhrase = phrases[currentPhraseIndex];

            if (isDeleting) {
                setSearchPlaceholder(currentPhrase.substring(0, currentCharIndex - 1));
                currentCharIndex--;
            } else {
                setSearchPlaceholder(currentPhrase.substring(0, currentCharIndex + 1));
                currentCharIndex++;
            }

            if (!isDeleting && currentCharIndex === currentPhrase.length) {
                setTimeout(() => {
                    isDeleting = true;
                }, 2000);
            } else if (isDeleting && currentCharIndex === 0) {
                isDeleting = false;
                currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
            }

            const typingSpeed = isDeleting ? 50 : 150;
            setTimeout(type, typingSpeed);
        };

        type();
    }, []);

    return(
        <>
            <Navbar />
           
            <section id="hero" className="flex items-center justify-center px-4 lg:px-24 py-20 lg:py-32 transition-colors duration-300"
                style={{ backgroundColor: 'var(--section-bg)' }}>
                <div className="flex flex-col items-center w-full max-w-7xl">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6"
                            style={{ color: 'var(--text-primary)' }}>
                            Revolutionizing Real Estate
                        </h2>
                        <p className="text-lg md:text-xl max-w-2xl mx-auto"
                            style={{ color: 'var(--text-secondary)' }}>
                            Tech-driven solutions to simplify property management and enhance the home buying process in the Philippines
                        </p>
                    </div>

                    <div className="w-full max-w-3xl px-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                className="w-full px-6 py-4 text-lg rounded-full transition-all duration-300 pl-14"
                                style={{
                                    backgroundColor: 'var(--card-bg)',
                                    color: 'var(--text-primary)',
                                    borderColor: 'var(--border-color)'
                                }}
                            />
                            <MagnifyingGlassIcon 
                                className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 pointer-events-none"
                                style={{ color: 'var(--text-secondary)' }} 
                            />
                        </div>
                        
                        {/* New Button */}
                        <div className="flex justify-center mt-8">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/properties')}
                                className="px-8 py-3 bg-blue-600 text-white rounded-full font-medium
                                         shadow-lg hover:shadow-xl transition-all duration-300
                                         hover:bg-blue-700 flex items-center gap-2"
                            >
                                View All Properties
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    className="h-5 w-5" 
                                    viewBox="0 0 20 20" 
                                    fill="currentColor"
                                >
                                    <path 
                                        fillRule="evenodd" 
                                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" 
                                        clipRule="evenodd" 
                                    />
                                </svg>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </section>

            <Solutions/>
            <Footer />
        </>
    );
}

export default Home