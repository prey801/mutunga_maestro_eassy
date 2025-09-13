import React from 'react';
import { motion } from 'framer-motion';
import { Award, Target } from 'lucide-react';

const AboutSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              About <span className="text-gradient">Maestro Essays</span>
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              Founded by a team of passionate academics, Maestro Essays was born from a desire to bridge the gap between students' potential and their academic performance. We understand the pressures of modern education and are dedicated to providing ethical, high-quality writing support.
            </p>
            <p className="text-lg text-gray-600 mb-6">
              Our mission is to empower students to achieve their goals by offering reliable, professional, and personalized academic assistance. We believe in fostering academic integrity and helping students learn and grow through our expertly crafted model papers.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Our Vision</h3>
                  <p className="text-gray-600">To be the most trusted and respected academic partner for students worldwide.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Our Mission</h3>
                  <p className="text-gray-600">To deliver exceptional, human-written academic content that inspires and educates.</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex justify-center items-center"
          >
            <div className="w-full h-64 md:h-96 bg-gradient-to-br from-sky-200 to-blue-300 rounded-xl shadow-2xl flex items-center justify-center p-8 text-center">
              <p className="text-xl font-semibold text-sky-800">Your Success, Our Mission</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;