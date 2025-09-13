import React from 'react';
import { motion } from 'framer-motion';
import { Gift, FileText, Bot, Book, Edit, Smile, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const FreebiesSection = () => {
    const freebies = [
        { icon: Book, text: "Unlimited Sources" },
        { icon: Bot, text: "Plagiarism/AI Report" },
        { icon: Edit, text: "Formatting" },
        { icon: FileText, text: "Title Page" },
        { icon: Smile, text: "Unlimited Revisions" },
    ];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="relative bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl shadow-2xl p-8 md:p-12 overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 hero-pattern"></div>
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div className="text-white text-center lg:text-left">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get More with Every Order</h2>
                            <p className="text-lg text-sky-100 mb-8 max-w-lg lg:max-w-none mx-auto lg:mx-0">
                                We believe in providing maximum value. That's why every order you place comes with these amazing freebies, ensuring you get a comprehensive, ready-to-submit paper without any hidden costs.
                            </p>
                            <Button asChild size="lg" className="bg-white text-sky-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                                <Link to="/order">
                                    Order Now & Get Freebies <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                            {freebies.map((freebie, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="bg-white/20 backdrop-blur-sm p-4 rounded-xl text-center flex flex-col items-center justify-center space-y-2 border border-white/30"
                                >
                                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                                        <freebie.icon className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <p className="text-sm font-semibold text-white">{freebie.text}</p>
                                    <p className="text-xs font-bold text-cyan-200">FREE</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default FreebiesSection;