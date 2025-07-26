
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

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

     const scrollToSolutions = () => {
        document.getElementById('solutions')?.scrollIntoView({
            behavior: 'smooth'
        });
    };

    return(
        <section 
            id="hero" 
            className="min-h-[80vh] md:min-h-[95vh] flex flex-col items-center justify-between 
                       px-4 lg:px-24 py-8 lg:py-16 transition-colors duration-300 bg-base-100"
        >
            {/* Main content */}
            <div className="flex flex-col items-center w-full max-w-7xl flex-grow justify-center">
                <div className="text-center mb-8 md:mb-12">
                    <h2 className="text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-base-content">
                        Revolutionizing Real Estate
                    </h2>
                    <p className="text-base md:text-lg lg:text-xl max-w-2xl mx-auto text-base-content/70">
                        Tech-driven solutions to simplify property management and enhance the home buying process in the Philippines
                    </p>
                </div>

                <div className="w-full max-w-3xl px-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            className="input input-xl input-bordered w-full px-6 py-3 md:py-4 text-base md:text-lg rounded-full 
                                     transition-all duration-300 pl-12 md:pl-14 bg-base-100 border-2 
                                     focus:outline-none shadow-md hover:shadow-lg 
                                     placeholder-base-content/60 text-base-content"
                        />
                        <MagnifyingGlassIcon 
                            className="absolute left-4 md:left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 
                                     pointer-events-none text-base-content/70"
                        />
                    </div>
                    
                    <div className="flex justify-center mt-6 md:mt-8">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/properties')}
                            className="btn btn-primary btn-lg rounded-full font-medium px-6 md:px-8 py-3 
                                     shadow-lg hover:shadow-xl transition-all duration-300
                                     flex items-center gap-2 text-sm md:text-base"
                        >
                            View All Properties
                            {/* ...existing svg... */}
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <motion.div 
                className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 
                           transition-opacity mt-8 md:mt-12 pb-4"
                onClick={scrollToSolutions}
                animate={{ 
                    y: [0, -10, 0] 
                }}
                transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                }}
            >
                <span className="text-xs md:text-sm text-primary font-medium">
                    Scroll to explore
                </span>
                <ChevronDownIcon 
                    className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-primary" 
                    aria-label="Scroll to solutions"
                />
            </motion.div>
        </section>


    );
}

export default Home;