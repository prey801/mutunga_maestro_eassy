import React from 'react';
import { motion } from 'framer-motion';
import { User, BrainCircuit, ShieldCheck } from 'lucide-react';

const QualityPromiseSection = () => {
    const promises = [
        {
            icon: User,
            title: "100% Human-Written Content",
            description: "Every paper is crafted by a qualified human expert. We do not use AI for writing, ensuring authentic, nuanced, and critically-aware content that stands out."
        },
        {
            icon: BrainCircuit,
            title: "0% AI & Plagiarism Guarantee",
            description: "We are committed to absolute academic integrity. Our strict policies and advanced checking tools ensure your paper is completely free of AI-generated text and plagiarism."
        },
        {
            icon: ShieldCheck,
            title: "Unmatched Quality & Expertise",
            description: "Our writers are not just writers; they are specialists with Master's and PhD degrees. This ensures your paper is not only well-written but also academically rigorous and insightful."
        }
    ];

    return (
        <section className="py-20 bg-sky-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Our Unwavering Commitment to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-sky-400">Authenticity</span>
                    </h2>
                    <p className="text-xl text-sky-200 max-w-3xl mx-auto">
                        In an era of automation, we stand firm on the power of human intellect. Here’s what makes Maestro Essays the ethical choice for academic success.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {promises.map((promise, index) => (
                        <motion.div
                            key={promise.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-sky-800/50 p-8 rounded-xl shadow-lg border border-sky-700/50 text-center"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-sky-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <promise.icon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">{promise.title}</h3>
                            <p className="text-sky-200">{promise.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default QualityPromiseSection;