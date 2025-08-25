import robert from '../../assets/developers/robert.jpg';
import robertskie from '../../assets/developers/robertskie.jpg';
import benedict from '../../assets/developers/benedict.jpg';
import benedictskie from '../../assets/developers/benedictskie.jpg';
import jm from '../../assets/developers/jm.jpg';
import jmskie from '../../assets/developers/jmskie.jpg';
import aaron from '../../assets/developers/aaron.jpg';
import aaronskie from '../../assets/developers/aaronskie.jpg';
import { motion } from 'framer-motion';
import { useState } from 'react';

function Developers() {
    const [flippedCards, setFlippedCards] = useState({});

    const toggleCard = (cardId) => {
        setFlippedCards(prev => ({
            ...prev,
            [cardId]: !prev[cardId]
        }));
    };

    const developers = [
        {
            id: 'robert',
            title: 'Handler',
            name: 'Robert',
            role: 'Lead Project Manager',
            image: robert,
            flippedImage: robertskie
        },
        {
            id: 'benedict',
            title: 'Hacker',
            name: 'Benedict',
            role: 'Lead Developer',
            image: benedict,
            flippedImage: benedictskie
        },
        {
            id: 'jm',
            title: 'Hipster',
            name: 'JM',
            role: 'Lead Designer',
            image: jm,
            flippedImage: jmskie
        },
        {
            id: 'aaron',
            title: 'Hustler',
            name: 'Aaron',
            role: 'Business Developer',
            image: aaron,
            flippedImage: aaronskie
        }
    ];

    return (
        <section id="developers" className="py-12 sm:py-16 md:py-20 lg:py-24 pb-16 sm:pb-20 md:pb-24 lg:pb-32 mt-4 sm:mt-6 md:mt-8 min-h-screen">
            {/* Header Section */}
            <div className="mb-12 sm:mb-16 md:mb-20 text-center px-4 sm:px-6">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-primary dark:text-primary/90">
                    Meet Our Developers
                </h2>
                <p className="text-base sm:text-lg md:text-xl font-bold text-base-content/70 dark:text-base-content/80 max-w-2xl mx-auto">
                    The team behind RealiTech
                </p>
            </div>

            {/* Cards Container */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl mb-12 sm:mb-16 md:mb-20">
                {/* Responsive Grid with increased vertical spacing for tablet */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 sm:gap-12 md:gap-16 lg:gap-14 justify-items-center">
                    {developers.map((dev, index) => (
                        <motion.div
                            key={dev.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                            viewport={{ once: true }}
                            className="group w-full max-w-sm"
                        >
                            <div 
                                className="flip-card-container card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-300/20 cursor-pointer w-full h-full"
                                onClick={() => toggleCard(dev.id)}
                            >
                                {/* Card Inner - Contains both sides */}
                                <div 
                                    className={`flip-card-inner ${flippedCards[dev.id] ? 'flipped' : ''}`}
                                    style={{
                                        transformStyle: 'preserve-3d',
                                        transition: 'transform 0.6s'
                                    }}
                                >
                                    {/* Front Side */}
                                    <div 
                                        className="flip-card-front w-full h-full"
                                        style={{
                                            backfaceVisibility: 'hidden',
                                            position: 'absolute',
                                            width: '100%',
                                            height: '100%'
                                        }}
                                    >
                                        {/* Image Container - Better aspect ratio for tablet */}
                                        <div className="aspect-[4/3] sm:aspect-[3/2] lg:aspect-[5/4] overflow-hidden rounded-t-xl">
                                            <img 
                                                src={dev.image} 
                                                alt={`${dev.title} - ${dev.name}`}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                        
                                        {/* Content - Increased padding for better spacing */}
                                        <div className="p-4 sm:p-5 md:p-6 lg:p-5 text-center bg-base-200 rounded-b-xl">
                                            <h3 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2 text-base-content">
                                                {dev.title}
                                            </h3>
                                            <p className="text-sm sm:text-base mb-1.5 sm:mb-2 text-primary font-medium">
                                                {dev.name}
                                            </p>
                                            <p className="text-sm sm:text-sm md:text-base lg:text-sm text-base-content/70 font-medium">
                                                {dev.role}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Back Side */}
                                    <div 
                                        className="flip-card-back w-full h-full"
                                        style={{
                                            backfaceVisibility: 'hidden',
                                            position: 'absolute',
                                            width: '100%',
                                            height: '100%',
                                            transform: 'rotateY(180deg)'
                                        }}
                                    >
                                        {/* Image Container - Better aspect ratio for tablet */}
                                        <div className="aspect-[4/3] sm:aspect-[3/2] lg:aspect-[5/4] overflow-hidden rounded-t-xl">
                                            <img 
                                                src={dev.flippedImage} 
                                                alt={`${dev.title} - ${dev.name} (Alternative)`}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        </div>
                                        
                                        {/* Content - Increased padding for better spacing */}
                                        <div className="p-4 sm:p-5 md:p-6 lg:p-5 text-center bg-base-200 rounded-b-xl">
                                            <h3 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2 text-base-content">
                                                {dev.title}
                                            </h3>
                                            <p className="text-sm sm:text-base mb-1.5 sm:mb-2 text-primary font-medium">
                                                {dev.name}
                                            </p>
                                            <p className="text-sm sm:text-sm md:text-base lg:text-sm text-base-content/70 font-medium">
                                                {dev.role}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Updated CSS with better tablet spacing */}
            <style jsx>{`
                .flip-card-container {
                    perspective: 1000px;
                    min-height: 280px;
                }

                .flip-card-inner {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    transition: transform 0.6s;
                    transform-style: preserve-3d;
                }

                .flip-card-inner.flipped {
                    transform: rotateY(180deg);
                }

                .flip-card-front,
                .flip-card-back {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    backface-visibility: hidden;
                    border-radius: 0.75rem;
                }

                .flip-card-back {
                    transform: rotateY(180deg);
                }

                @media (max-width: 640px) {
                    .flip-card-container {
                        min-height: 320px;
                    }
                }

                /* Tablet view - Increased height for better label visibility */
                @media (min-width: 641px) and (max-width: 1023px) {
                    .flip-card-container {
                        min-height: 380px;
                    }
                }

                /* Large tablet and desktop */
                @media (min-width: 1024px) and (max-width: 1279px) {
                    .flip-card-container {
                        min-height: 340px;
                    }
                }

                @media (min-width: 1280px) {
                    .flip-card-container {
                        min-height: 320px;
                    }
                }
            `}</style>
        </section>
    );
}

export default Developers;