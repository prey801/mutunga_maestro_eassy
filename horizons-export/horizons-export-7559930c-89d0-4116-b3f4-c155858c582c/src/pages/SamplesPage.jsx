import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { BookOpen, FileText, GraduationCap, Search, Lightbulb, Edit, CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const SamplesPage = () => {
  const { toast } = useToast();

  const handleSampleClick = () => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  const samples = [
    {
      title: "Argumentative Essay: Climate Change Impact",
      type: "Essay",
      description: "A compelling argumentative essay discussing the socio-economic impacts of climate change and potential mitigation strategies.",
      icon: BookOpen,
      wordCount: "2500 words",
      academicLevel: "University"
    },
    {
      title: "Research Paper: AI in Healthcare",
      type: "Research Paper",
      description: "An in-depth research paper exploring the applications of Artificial Intelligence in modern healthcare systems, including ethical considerations.",
      icon: Search,
      wordCount: "5000 words",
      academicLevel: "Master's"
    },
    {
      title: "Dissertation Excerpt: Quantum Computing",
      type: "Dissertation",
      description: "A sample chapter from a PhD dissertation on the advancements and challenges in quantum computing technology.",
      icon: GraduationCap,
      wordCount: "7000 words",
      academicLevel: "PhD"
    },
    {
      title: "Term Paper: Renaissance Art History",
      type: "Term Paper",
      description: "A comprehensive term paper analyzing the key characteristics and influential artists of the Italian Renaissance period.",
      icon: FileText,
      wordCount: "3000 words",
      academicLevel: "College"
    },
    {
      title: "Personal Statement: MBA Application",
      type: "Admission Essay",
      description: "A persuasive personal statement crafted for an MBA program application, highlighting leadership skills and career aspirations.",
      icon: Lightbulb,
      wordCount: "750 words",
      academicLevel: "Graduate"
    },
    {
      title: "Edited Manuscript: Literary Analysis",
      type: "Editing Sample",
      description: "A before-and-after example of an edited literary analysis, showcasing improvements in clarity, grammar, and style.",
      icon: Edit,
      wordCount: "1500 words",
      academicLevel: "University"
    }
  ];

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Our Samples - Maestro Essays</title>
        <meta name="description" content="Explore high-quality academic writing samples from Maestro Essays, including essays, research papers, dissertations, and more." />
        <meta property="og:title" content="Our Samples - Maestro Essays" />
        <meta property="og:description" content="Explore high-quality academic writing samples from Maestro Essays, including essays, research papers, dissertations, and more." />
      </Helmet>

      {/* Hero Section for Samples Page */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 py-20 hero-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
              Our <span className="text-gradient">Writing Samples</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Browse through a selection of our high-quality academic papers to see the standard of excellence we deliver.
            </p>
            <Button asChild size="lg" className="mt-8 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <Link to="/order">Get Your Custom Sample</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Samples Grid */}
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
              Explore Our <span className="text-gradient">Work</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Each sample demonstrates our commitment to originality, research, and academic integrity.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {samples.map((sample, index) => (
              <motion.div
                key={sample.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card 
                  className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm cursor-pointer"
                  onClick={handleSampleClick}
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                      <sample.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{sample.title}</h3>
                    <p className="text-gray-600 mb-4">{sample.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-sky-600" />
                        <span className="text-sm text-gray-700">Word Count: {sample.wordCount}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-sky-600" />
                        <span className="text-sm text-gray-700">Academic Level: {sample.academicLevel}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-sky-600 to-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Need a Custom Sample?
            </h2>
            <p className="text-xl text-sky-100 max-w-3xl mx-auto">
              If you don't see what you're looking for, our writers can create a custom sample tailored to your specific needs.
            </p>
            <Button asChild size="lg" className="bg-white text-sky-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <Link to="/order">
                Order Your Custom Paper <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default SamplesPage;