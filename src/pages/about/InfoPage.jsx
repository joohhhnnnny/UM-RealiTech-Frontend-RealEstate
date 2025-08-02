
import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, ShieldCheckIcon, StarIcon } from '@heroicons/react/24/outline';

function InfoPage() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.3,
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    const values = [
        {
            icon: SparklesIcon,
            title: "Innovation",
            description: "Leveraging cutting-edge technology to transform the real estate experience",
            gradient: "from-blue-500 to-purple-600"
        },
        {
            icon: ShieldCheckIcon,
            title: "Trust",
            description: "Building lasting relationships through transparency and reliability",
            gradient: "from-green-500 to-teal-600"
        },
        {
            icon: StarIcon,
            title: "Excellence",
            description: "Delivering exceptional service and exceeding expectations every time",
            gradient: "from-orange-500 to-red-600"
        }
    ];

    return (
        <section className="min-h-screen bg-gradient-to-br from-base-200/30 via-base-100 to-base-200/50 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 py-20 max-w-6xl relative z-10">
                <motion.div 
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <motion.div
                        className="inline-block p-3 rounded-2xl bg-gray-600/90 mb-6"
                        whileHover={{ scale: 1.05, rotate: 2 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <h1 className="text-5xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-accent">
                            About Us
                        </h1>
                    </motion.div>
                    <motion.p 
                        className="text-xl text-base-content/60 max-w-1xl mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        Transforming real estate through innovation and trust
                    </motion.p>
                </motion.div>

                <motion.div 
                    className="bg-base-100/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-16 border border-base-content/5"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="space-y-8 max-w-4xl mx-auto">
                        <motion.p 
                            className="text-xl text-base-content/80 leading-relaxed text-center"
                            variants={itemVariants}
                        >
                            Welcome to our revolutionary real estate platform! We are dedicated to connecting buyers, sellers, and renters 
                            with their ideal properties through innovative technology and exceptional service.
                        </motion.p>
                        
                        <motion.div 
                            className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
                            variants={itemVariants}
                        ></motion.div>
                        
                        <motion.p 
                            className="text-xl text-base-content/80 leading-relaxed text-center"
                            variants={itemVariants}
                        >
                            Our mission is to revolutionize the real estate experience by providing cutting-edge solutions 
                            that make property transactions seamless, transparent, and efficient for everyone involved.
                        </motion.p>

                        <motion.div 
                            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
                            variants={containerVariants}
                        >
                            {values.map((value) => (
                                <motion.div
                                    key={value.title}
                                    className="group relative"
                                    variants={itemVariants}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <div className="relative p-8 bg-base-100 rounded-2xl shadow-lg border border-base-content/5 hover:shadow-2xl transition-all duration-300 overflow-hidden">
                                        {/* Gradient overlay on hover */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                                        
                                        {/* Icon */}
                                        <motion.div 
                                            className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${value.gradient} mb-6 shadow-lg`}
                                            whileHover={{ rotate: 10, scale: 1.1 }}
                                            transition={{ type: "spring", stiffness: 400 }}
                                        >
                                            <value.icon className="w-8 h-8 text-white" />
                                        </motion.div>
                                        
                                        <h3 className="text-2xl font-bold mb-4 text-base-content group-hover:text-primary transition-colors duration-300">
                                            {value.title}
                                        </h3>
                                        <p className="text-base-content/70 leading-relaxed">
                                            {value.description}
                                        </p>
                                        
                                        {/* Decorative corner accent */}
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default InfoPage;