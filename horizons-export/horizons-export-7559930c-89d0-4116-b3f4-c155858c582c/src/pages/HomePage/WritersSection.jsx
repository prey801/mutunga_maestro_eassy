import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const WritersSection = () => {
  const writers = [
    {
      name: "Dr. Amanda Foster",
      specialization: "Literature & English",
      experience: "8 years",
      rating: 4.9,
      orders: 1247,
      status: "online",
      avatar: "AF"
    },
    {
      name: "Prof. James Wilson",
      specialization: "Business & Economics",
      experience: "12 years",
      rating: 4.8,
      orders: 2156,
      status: "online",
      avatar: "JW"
    },
    {
      name: "Dr. Maria Garcia",
      specialization: "Psychology & Social Sciences",
      experience: "6 years",
      rating: 4.9,
      orders: 987,
      status: "online",
      avatar: "MG"
    },
    {
      name: "Dr. Robert Kim",
      specialization: "Science & Technology",
      experience: "10 years",
      rating: 4.7,
      orders: 1543,
      status: "online",
      avatar: "RK"
    },
    {
      name: "Prof. Sarah Davis",
      specialization: "History & Philosophy",
      experience: "15 years",
      rating: 4.9,
      orders: 2789,
      status: "online",
      avatar: "SD"
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
            Our <span className="text-gradient">Expert Writers</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet our team of professional writers who are currently online and ready to work on your assignment.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {writers.slice(0, 3).map((writer, index) => (
            <motion.div
              key={writer.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{writer.avatar}</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{writer.name}</h3>
                      <p className="text-sm text-gray-600">{writer.specialization}</p>
                      <Badge className="bg-green-100 text-green-700 text-xs mt-1">Online</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Experience:</span>
                      <span className="text-sm font-medium">{writer.experience}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Rating:</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{writer.rating}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Completed Orders:</span>
                      <span className="text-sm font-medium">{writer.orders}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {writers.slice(3, 5).map((writer, index) => (
            <motion.div
              key={writer.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{writer.avatar}</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{writer.name}</h3>
                      <p className="text-sm text-gray-600">{writer.specialization}</p>
                      <Badge className="bg-green-100 text-green-700 text-xs mt-1">Online</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Experience:</span>
                      <span className="text-sm font-medium">{writer.experience}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Rating:</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{writer.rating}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Completed Orders:</span>
                      <span className="text-sm font-medium">{writer.orders}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WritersSection;