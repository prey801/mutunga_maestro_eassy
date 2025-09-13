import React from 'react';
import { motion } from 'framer-motion';
import { Edit3, CreditCard, UserCheck, Download } from 'lucide-react';

const HowToOrderSection = () => {
  const steps = [
    {
      step: "1",
      icon: Edit3,
      title: "Fill Out the Form",
      description: "Provide all your paper details: topic, length, academic level, and instructions. Don't forget to attach any necessary files."
    },
    {
      step: "2",
      icon: CreditCard,
      title: "Secure Your Payment",
      description: "Complete your payment through our secure PayPal gateway. We hold the funds until you are 100% happy with your paper."
    },
    {
      step: "3",
      icon: UserCheck,
      title: "A Writer is Assigned",
      description: "Our system matches your order with the most qualified, human expert in your subject area. They begin work immediately."
    },
    {
      step: "4",
      icon: Download,
      title: "Download Your Paper",
      description: "Receive a notification once your plagiarism-free, AI-free paper is ready. Review it and request revisions or approve and download."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            A Simple Path to <span className="text-gradient">Academic Success</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our four-step process is designed for your convenience, ensuring a smooth and transparent experience from start to finish.
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-sky-200 hidden md:block"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="relative inline-block">
                  <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-sky-500 font-bold text-sky-600">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowToOrderSection;