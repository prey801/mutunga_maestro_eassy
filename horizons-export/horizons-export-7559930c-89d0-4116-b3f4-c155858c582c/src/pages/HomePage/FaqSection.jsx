import React from 'react';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from 'lucide-react';

const FaqSection = () => {
  const faqs = [
    {
      question: "Is your writing service confidential?",
      answer: "Yes, we guarantee 100% confidentiality. Your personal information and order details are kept private and secure. We never share your data with third parties."
    },
    {
      question: "Are the papers written by real experts?",
      answer: "Absolutely! Our team consists of highly qualified writers with Master's and PhD degrees in various fields. We match your order with a writer who has relevant expertise in your subject area."
    },
    {
      question: "Is the content original and plagiarism-free?",
      answer: "Yes, all our papers are written from scratch and are 100% original. We use advanced plagiarism detection software to ensure that every paper is unique before it's delivered to you."
    },
    {
      question: "What if I'm not satisfied with the paper?",
      answer: "Your satisfaction is our priority. We offer free, unlimited revisions. If you're not happy with the final result, you can request changes until the paper meets your requirements."
    },
    {
      question: "Can you handle urgent orders?",
      answer: "Yes, we specialize in meeting tight deadlines. You can place an order with a deadline as short as 6 hours. Our writers are trained to work efficiently without compromising on quality."
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
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about our services. If you can't find your answer here, feel free to contact our 24/7 support.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b-0 rounded-xl shadow-lg bg-sky-50/50">
                <AccordionTrigger className="p-6 text-lg font-medium text-left hover:no-underline">
                  <div className="flex items-center space-x-3">
                    <HelpCircle className="w-6 h-6 text-sky-600" />
                    <span>{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-6 pt-0">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FaqSection;