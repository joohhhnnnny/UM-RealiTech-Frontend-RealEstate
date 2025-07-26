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
            className="relative h-[80vh] md:h-[85vh] flex items-center justify-center 
                       px-4 lg:px-24 py-16 lg:py-32 transition-colors duration-300 bg-base-100"
        >
            <div className="flex flex-col items-center w-full max-w-7xl">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-base-content">
                        Revolutionizing Real Estate
                    </h2>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto text-base-content/70">
                        Protecting buyers. Empowering agents. Regulating developers.
 Together, we make every real estate journey transparent, fair, and safe.
                    </p>
                </div>

                <div className="w-full max-w-3xl px-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            className="input input-xl input-bordered w-full px-6 py-4 text-lg rounded-full 
                                     transition-all duration-300 pl-14 bg-base-100 border-2 
                                     focus:outline-none shadow-md hover:shadow-lg 
                                     placeholder-base-content/60 text-base-content"
                        />
                        <MagnifyingGlassIcon 
                            className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 
                                     pointer-events-none text-base-content/70"
                        />
                    </div>
                    
                    <div className="flex justify-center mt-8">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/properties')}
                            className="btn btn-primary btn-lg rounded-full font-medium px-8 py-3 
                                     shadow-lg hover:shadow-xl transition-all duration-300
                                     flex items-center gap-2"
                        >
                            View All Properties
                            {/* ...existing svg... */}
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <motion.div 
                className="block absolute bottom-8 left-1/2 transform -translate-x-1/2 
                           cursor-pointer hover:opacity-80 transition-opacity"
                // ...existing motion props...
                onClick={scrollToSolutions}
            >
                <div className="flex flex-col items-center gap-2">
                    <span className="text-sm text-primary font-medium">
                        Scroll to explore
                    </span>
                    <ChevronDownIcon 
                        className="w-6 h-6 md:w-8 md:h-8 text-primary" 
                        aria-label="Scroll to solutions"
                    />
                </div>
            </motion.div>
        </section>
    );
}

export default Home;