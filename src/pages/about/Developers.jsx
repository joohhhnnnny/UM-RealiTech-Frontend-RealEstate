
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
        <section id="developers" className="py-16 md:py-24 pb-60 md:pb-100 mt-8 min-h-screen">
            <div className="mb-20 text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary dark:text-primary/90">Meet Our Developers</h2>
                <p className="text-xl font-bold text-base-content/70 dark:text-base-content/80">The team behind RealiTech</p>
            </div>

            <div className="container mx-auto px-6 max-w-7xl mb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 md:gap-10">
                    {developers.map((dev, index) => (
                        <motion.div
                            key={dev.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                            viewport={{ once: true }}
                            className="group"
                        >
                            <div 
                                className="flip-card-container card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-300/20"
                                onClick={() => toggleCard(dev.id)}
                            >
                                {/* Card Inner - Contains both sides */}
                                <div 
                                    className={`flip-card-inner ${flippedCards[dev.id] ? 'flipped' : ''}`}
                                >
                                    {/* Front Side */}
                                    <div className="flip-card-front">
                                        <div className="aspect-square overflow-hidden rounded-t-xl">
                                            <img 
                                                src={dev.image} 
                                                alt={`${dev.title} - ${dev.name}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="p-6 text-center bg-base-200 rounded-b-xl">
                                            <h3 className="text-2xl font-bold mb-1 text-base-content">{dev.title}</h3>
                                            <p className="text-lg mb-2 text-primary font-medium">{dev.name}</p>
                                            <p className="text-base-content/70 font-medium">{dev.role}</p>
                                        </div>
                                    </div>

                                    {/* Back Side */}
                                    <div className="flip-card-back">
                                        <div className="aspect-square overflow-hidden rounded-t-xl">
                                            <img 
                                                src={dev.flippedImage} 
                                                alt={`${dev.title} - ${dev.name} (Alternative)`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="p-6 text-center bg-base-200 rounded-b-xl">
                                            <h3 className="text-2xl font-bold mb-1 text-base-content">{dev.title}</h3>
                                            <p className="text-lg mb-2 text-primary font-medium">{dev.name}</p>
                                            <p className="text-base-content/70 font-medium">{dev.role}</p>
                                            
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
export default Developers;