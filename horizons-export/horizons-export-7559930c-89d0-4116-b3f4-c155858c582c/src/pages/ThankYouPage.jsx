import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Helmet } from 'react-helmet';

const ThankYouPage = () => {
  return (
    <>
      <Helmet>
        <title>Thank You! - Maestro Essays</title>
      </Helmet>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
          className="w-full max-w-2xl"
        >
          <Card className="shadow-2xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-sky-500 to-blue-600 p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <CheckCircle className="w-20 h-20 text-white mx-auto" />
              </motion.div>
              <CardTitle className="text-white text-3xl md:text-4xl font-bold mt-4">
                Thank You for Your Order!
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 text-center space-y-6">
              <p className="text-lg text-gray-700">
                Your payment was successful and your order has been placed. Our team will start working on it right away.
              </p>
              <p className="text-gray-600">
                You will receive a confirmation email shortly. You can track the status of your order in your profile dashboard.
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg">
                  <Link to="/profile">
                    View My Orders
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default ThankYouPage;