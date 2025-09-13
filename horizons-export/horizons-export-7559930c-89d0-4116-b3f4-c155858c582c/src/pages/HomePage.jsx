import React from 'react';
import HeroSection from '@/pages/HomePage/HeroSection';
import AboutSection from '@/pages/HomePage/AboutSection';
import ServicesSection from '@/pages/HomePage/ServicesSection';
import HowToOrderSection from '@/pages/HomePage/HowToOrderSection';
import ReviewsSection from '@/pages/HomePage/ReviewsSection';
import WritersSection from '@/pages/HomePage/WritersSection';
import BlogSection from '@/pages/HomePage/BlogSection';
import CtaSection from '@/pages/HomePage/CtaSection';
import FaqSection from '@/pages/HomePage/FaqSection';
import QualityPromiseSection from '@/pages/HomePage/QualityPromiseSection';
import FreebiesSection from '@/pages/HomePage/FreebiesSection';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <AboutSection />
      <QualityPromiseSection />
      <ServicesSection isHomepage={true} /> {/* Pass prop to indicate homepage usage */}
      <FreebiesSection />
      <HowToOrderSection />
      <ReviewsSection />
      <WritersSection />
      <FaqSection />
      <BlogSection />
      <CtaSection />
    </div>
  );
};

export default HomePage;