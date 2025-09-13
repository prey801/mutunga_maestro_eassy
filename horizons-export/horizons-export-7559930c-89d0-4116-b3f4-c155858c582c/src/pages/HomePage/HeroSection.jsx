import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Shield, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const HeroSection = () => {
  const features = [
    { icon: Clock, title: "24/7 Support", description: "Round-the-clock customer service" },
    { icon: Shield, title: "100% Original", description: "Plagiarism-free guarantee" },
    { icon: Users, title: "Expert Writers", description: "PhD and Masters qualified" },
    { icon: Zap, title: "Fast Delivery", description: "Meet tight deadlines" }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 hero-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 gap-12 items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-200">
                🎓 Professional Academic Writing
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                <span className="text-gradient">Maestro Essays</span>
                <br />
                <span className="text-gray-800">Your Academic Success Partner</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Get high-quality, original academic papers written by expert writers. 
                From essays to dissertations, we deliver excellence on time, every time.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <Link to="/order">
                  Order Now <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-sky-300 text-sky-700 hover:bg-sky-50">
                <Link to="/samples">
                  View Samples
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <feature.icon className="w-8 h-8 text-sky-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-800">{feature.title}</p>
                  <p className="text-xs text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;