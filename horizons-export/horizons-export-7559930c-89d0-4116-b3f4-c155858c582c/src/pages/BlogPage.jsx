import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { blogs } from '@/data/blogData';

const BlogPage = () => {
  return (
    <div className="min-h-screen">
       <Helmet>
        <title>Blog - Maestro Essays</title>
        <meta name="description" content="Explore our blog for tips, guides, and insights on academic writing, productivity, and student success. Stay updated with Maestro Essays." />
        <meta property="og:title" content="Blog - Maestro Essays" />
        <meta property="og:description" content="Explore our blog for tips, guides, and insights on academic writing, productivity, and student success. Stay updated with Maestro Essays." />
      </Helmet>

      <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 py-20 hero-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
              Insights from the <span className="text-gradient">Maestros</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your hub for academic advice, writing tips, and strategies for success, curated by our expert team.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog, index) => (
              <motion.div
                key={blog.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="h-full"
              >
                <Link to={`/blog/${blog.slug}`} className="h-full flex">
                  <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm cursor-pointer flex flex-col w-full">
                    <CardContent className="p-6 flex flex-col flex-grow">
                      <Badge className="bg-sky-100 text-sky-700 mb-4 self-start">{blog.category}</Badge>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-3 flex-grow">{blog.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-4">{blog.excerpt}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mt-auto pt-4 border-t">
                        <span>{blog.date}</span>
                        <span>{blog.readTime}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
              Ready to Excel?
            </h2>
            <p className="text-xl text-sky-100 max-w-3xl mx-auto">
              Apply these insights to your own work or let our experts handle it for you. Your success story starts here.
            </p>
            <Button asChild size="lg" className="bg-white text-sky-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <Link to="/order">
                Order Your Paper Now <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;