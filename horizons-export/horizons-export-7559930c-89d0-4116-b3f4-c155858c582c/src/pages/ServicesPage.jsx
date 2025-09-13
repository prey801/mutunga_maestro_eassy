import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { BookOpen, Users, CheckCircle, FileText, Lightbulb, GraduationCap, Edit, Clipboard, Briefcase, LayoutDashboard, Search, MessageSquare, ShieldCheck, DollarSign, Clock, Zap, ArrowRight, BrainCircuit, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ServicesPage = () => {
  const services = [
    {
      title: "Essay Writing",
      description: "Compelling essays on any topic, crafted by human experts. We guarantee 100% original, AI-free content tailored to your needs.",
      icon: BookOpen,
      features: ["Argumentative & Persuasive", "Descriptive & Narrative", "Expository & Critical", "100% Human Written"]
    },
    {
      title: "Research Papers",
      description: "In-depth research papers built on credible sources and critical analysis, all written by specialists in your field.",
      icon: Search,
      features: ["Literature Reviews", "Empirical Studies", "Methodology & Analysis", "Annotated Bibliographies"]
    },
    {
      title: "Dissertations & Theses",
      description: "Comprehensive, chapter-by-chapter support for your most important academic project, from proposal to conclusion.",
      icon: GraduationCap,
      features: ["Proposal Development", "Chapter Writing", "Data Analysis", "Final Editing & Formatting"]
    },
    {
      title: "Term Papers",
      description: "Well-researched term papers that showcase a deep understanding of course material, delivered on time.",
      icon: FileText,
      features: ["Subject-Specific Topics", "Comprehensive Research", "Adherence to Guidelines", "Timely Delivery"]
    },
    {
      title: "Coursework & Assignments",
      description: "Reliable assistance with homework, problem sets, lab reports, and other daily or weekly academic tasks.",
      icon: Clipboard,
      features: ["Problem Solving", "Presentations", "Lab Reports", "Reflective Journals"]
    },
    {
      title: "Case Studies",
      description: "Detailed analysis of complex scenarios, providing insightful solutions for business, legal, and medical subjects.",
      icon: Briefcase,
      features: ["Business & Marketing", "Medical & Healthcare", "Legal & Ethical Dilemmas", "SWOT & PESTLE Analysis"]
    },
    {
      title: "Admission Services",
      description: "Craft persuasive personal statements and SOPs that capture your unique story and impress admission committees.",
      icon: Lightbulb,
      features: ["Admission Essays", "Statements of Purpose", "Scholarship Applications", "Resume & CV Polishing"]
    },
    {
      title: "Editing & Proofreading",
      description: "Our human editors polish your work, enhancing clarity, style, and correctness while preserving your unique voice.",
      icon: Edit,
      features: ["Grammar & Punctuation", "Style & Flow Enhancement", "Formatting (APA, MLA, etc.)", "Clarity & Readability"]
    },
    {
      title: "Report Writing",
      description: "Clear, concise, and professional reports for academic, business, or technical purposes, structured for impact.",
      icon: LayoutDashboard,
      features: ["Business Reports", "Technical Reports", "Book & Movie Reports", "Feasibility Studies"]
    }
  ];

  const whyChooseUs = [
    { icon: User, title: "100% Human-Written", description: "Our papers are crafted by real experts, not AI. We guarantee authentic, nuanced writing." },
    { icon: BrainCircuit, title: "0% AI, 0% Plagiarism", description: "We use advanced tools to ensure every paper is free from AI-generated content and plagiarism." },
    { icon: Users, title: "Qualified Experts", description: "Your work is handled by writers with Master's and PhD degrees in relevant fields." },
    { icon: Clock, title: "On-Time Delivery", description: "We respect your deadlines and guarantee timely delivery, even for urgent orders." },
    { icon: DollarSign, title: "Transparent Pricing", description: "Fair, competitive pricing with no hidden fees. Quality assistance that is affordable." },
    { icon: MessageSquare, title: "24/7 Dedicated Support", description: "Our friendly support team is available around the clock to assist you." }
  ];

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Our Services - Maestro Essays</title>
        <meta name="description" content="Explore the comprehensive range of 100% human-written academic services offered by Maestro Essays. We guarantee AI-free and plagiarism-free content." />
        <meta property="og:title" content="Our Services - Maestro Essays | 100% Human-Written" />
        <meta property="og:description" content="Explore the comprehensive range of 100% human-written academic services offered by Maestro Essays. We guarantee AI-free and plagiarism-free content." />
      </Helmet>

      {/* Hero Section for Services Page */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 py-20 hero-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
              Our <span className="text-gradient">Human-Powered Services</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Maestro Essays provides a wide array of professional writing services, all performed by qualified human experts to ensure authenticity and quality.
            </p>
            <Button asChild size="lg" className="mt-8 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              <Link to="/order">Order Your Paper</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Detailed Services Grid */}
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
              What We <span className="text-gradient">Offer</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From simple essays to complex dissertations, every paper is custom-written by a human expert to meet your exact needs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                      <service.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <div className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-sky-600" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-br from-sky-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              The <span className="text-gradient">Maestro Difference</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our commitment to human expertise and academic integrity is what sets us apart.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseUs.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
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
              Ready for an Authentic, High-Quality Paper?
            </h2>
            <p className="text-xl text-sky-100 max-w-3xl mx-auto">
              Experience the peace of mind that comes with a service dedicated to genuine, human-powered academic excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-sky-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <Link to="/order">
                  Place Your Order Now <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-sky-600">
                <Link to="/chat">
                  <MessageSquare className="mr-2 w-5 h-5" />
                  Chat with Support
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;