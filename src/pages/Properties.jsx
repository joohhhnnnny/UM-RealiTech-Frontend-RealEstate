// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import Navbar from '/src/components/Navbar.jsx';
import Footer from '/src/components/Footer.jsx';

function Properties() {
    return (
        <>
            <Navbar />
            
            <section>
                
                <motion.section 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="py-16 px-4 lg:px-24 bg-base-100"
                >
                    <div className="max-w-7xl mx-auto">
                        <motion.h1 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="text-4xl font-bold mb-8 text-base-content"
                        >
                            All Properties
                        </motion.h1>
                        
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {/* Property cards will be mapped here */}
                        </motion.div>
                    </div>
                </motion.section>
            </section>
           
            <Footer />
        </>
    );
}

export default Properties;