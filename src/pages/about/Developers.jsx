
import robert from '../../assets/developers/robert.jpg';
import benedict from '../../assets/developers/benedict.jpg';
import jm from '../../assets/developers/jm.jpg';
import aaron from '../../assets/developers/aaron.jpg';
import { motion } from 'framer-motion';

function Developers() {
    return (
        <section id="developers" className="py-16 transition-colors duration-300">
            <div className="mb-16 text-center">
                <h2 className="text-4xl font-bold mb-4 text-primary">Meet Our Developers</h2>
                <p className="text-lg text-base-content/70">The team behind RealiTech</p>
            </div>

            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Handler - Robert */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="group"
                    >
                        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
                            <div className="aspect-square overflow-hidden rounded-t-xl">
                                <img 
                                    src={robert} 
                                    alt="Handler - Robert"
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-6 text-center bg-base-100 rounded-b-xl">
                                <h3 className="text-2xl font-bold mb-1 text-base-content">Handler</h3>
                                <p className="text-lg mb-2 text-primary font-medium">Robert</p>
                                <p className="text-base-content/70 font-medium">Lead Project Manager</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Hacker - Benedict */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="group"
                    >
                        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
                            <div className="aspect-square overflow-hidden rounded-t-xl">
                                <img 
                                    src={benedict} 
                                    alt="Hacker - Benedict"
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-6 text-center bg-base-100 rounded-b-xl">
                                <h3 className="text-2xl font-bold mb-1 text-base-content">Hacker</h3>
                                <p className="text-lg mb-2 text-primary font-medium">Benedict</p>
                                <p className="text-base-content/70 font-medium">Lead Developer</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Hipster - JM */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        viewport={{ once: true }}
                        className="group"
                    >
                        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
                            <div className="aspect-square overflow-hidden rounded-t-xl">
                                <img 
                                    src={jm} 
                                    alt="Hipster - JM"
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-6 text-center bg-base-100 rounded-b-xl">
                                <h3 className="text-2xl font-bold mb-1 text-base-content">Hipster</h3>
                                <p className="text-lg mb-2 text-primary font-medium">JM</p>
                                <p className="text-base-content/70 font-medium">Lead Designer</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Hustler - Aaron */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        viewport={{ once: true }}
                        className="group"
                    >
                        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
                            <div className="aspect-square overflow-hidden rounded-t-xl">
                                <img 
                                    src={aaron} 
                                    alt="Hustler - Aaron"
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-6 text-center bg-base-100 rounded-b-xl">
                                <h3 className="text-2xl font-bold mb-1 text-base-content">Hustler</h3>
                                <p className="text-lg mb-2 text-primary font-medium">Aaron</p>
                                <p className="text-base-content/70 font-medium">Business Developer</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
export default Developers;