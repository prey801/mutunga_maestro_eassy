import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { blogs } from '@/data/blogData';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const BlogPostPage = () => {
  const { slug } = useParams();
  const blog = blogs.find(b => b.slug === slug);

  if (!blog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Blog Post Not Found</h1>
        <p className="text-lg text-gray-600 mb-8">Sorry, we couldn't find the post you're looking for.</p>
        <Button asChild>
          <Link to="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <Helmet>
        <title>{blog.title} - Maestro Essays</title>
        <meta name="description" content={blog.excerpt} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.excerpt} />
      </Helmet>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="relative h-64 md:h-80 bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white text-center p-4">
          <div className="max-w-4xl mx-auto">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-3xl md:text-5xl font-bold leading-tight"
            >
              {blog.title}
            </motion.h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-gray-500 mb-8 border-b pb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{blog.date}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{blog.readTime}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4" />
              <Badge variant="secondary">{blog.category}</Badge>
            </div>
          </div>

          <article 
            className="prose lg:prose-xl max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          <div className="mt-12 text-center border-t pt-8">
            <Button asChild variant="outline">
              <Link to="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Posts
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BlogPostPage;