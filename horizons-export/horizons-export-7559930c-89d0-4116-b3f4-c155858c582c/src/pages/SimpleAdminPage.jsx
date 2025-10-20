import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, FileText, DollarSign, Shield, Settings, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const SimpleAdminPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 1250.00,
    totalOrders: 15,
    pendingOrders: 5,
    completedOrders: 8
  });

  // Mock data for demonstration
  const sampleOrders = [
    {
      id: '1',
      topic: 'The Impact of Social Media on Communication',
      subject: 'Communication Studies',
      pages: 3,
      price: 45.00,
      status: 'pending',
      deadline: '2025-09-20',
      client: 'John Doe'
    },
    {
      id: '2',
      topic: 'Climate Change and Economic Policy',
      subject: 'Environmental Economics',
      pages: 5,
      price: 75.00,
      status: 'in-progress',
      deadline: '2025-09-22',
      client: 'Jane Smith'
    },
    {
      id: '3',
      topic: 'AI in Healthcare Systems',
      subject: 'Computer Science',
      pages: 4,
      price: 60.00,
      status: 'completed',
      deadline: '2025-09-15',
      client: 'Mike Johnson'
    }
  ];

  const sampleClients = [
    { id: '1', name: 'John Doe', email: 'john@example.com', orders: 3 },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', orders: 2 },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', orders: 5 }
  ];

  const sampleWriters = [
    { id: '1', name: 'Alice Writer', email: 'alice@writers.com', rating: 4.8, completed: 25 },
    { id: '2', name: 'Bob Expert', email: 'bob@writers.com', rating: 4.9, completed: 32 },
    { id: '3', name: 'Carol Scholar', email: 'carol@writers.com', rating: 4.7, completed: 18 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'assigned': return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
        <p className="text-lg text-gray-600 mb-8">Welcome back, {user?.email}! Here's your business overview.</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Total Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: "from-green-400 to-emerald-600", change: "+12%" },
          { title: "Total Orders", value: stats.totalOrders, icon: FileText, color: "from-sky-400 to-blue-600", change: "+8%" },
          { title: "Pending Orders", value: stats.pendingOrders, icon: Users, color: "from-yellow-400 to-orange-600", change: "-2%" },
          { title: "Completed Orders", value: stats.completedOrders, icon: BarChart3, color: "from-teal-400 to-cyan-600", change: "+15%" },
        ].map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: i * 0.1 }}>
            <Card className="shadow-lg border-0 overflow-hidden hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                    <p className={`text-sm font-medium mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center shadow-md`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Tabs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="orders" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Orders</TabsTrigger>
            <TabsTrigger value="clients" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Clients</TabsTrigger>
            <TabsTrigger value="writers" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Writers</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Order Management
                </CardTitle>
                <CardDescription>View and manage all customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleOrders.map(order => (
                    <div key={order.id} className="border rounded-lg p-4 transition-all hover:shadow-md bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <div className="md:col-span-2">
                          <p className="font-semibold text-gray-800">{order.topic}</p>
                          <p className="text-xs text-gray-500">ID: {order.id} | Subject: {order.subject}</p>
                          <p className="text-sm text-gray-600">Client: {order.client}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">${order.price}</p>
                          <p className="text-xs text-gray-500">{order.pages} pages</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Due: {order.deadline}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                          <Button variant="outline" size="sm">View</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Client Management
                </CardTitle>
                <CardDescription>Registered clients and their order history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sampleClients.map(client => (
                    <div key={client.id} className="flex items-center justify-between p-3 border rounded-md bg-white hover:shadow-sm transition-shadow">
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-gray-500">{client.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{client.orders} orders</p>
                        <Button variant="ghost" size="sm">View Profile</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="writers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Writer Management
                </CardTitle>
                <CardDescription>Your team of professional writers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sampleWriters.map(writer => (
                    <div key={writer.id} className="flex items-center justify-between p-3 border rounded-md bg-white hover:shadow-sm transition-shadow">
                      <div>
                        <p className="font-medium">{writer.name}</p>
                        <p className="text-sm text-gray-500">{writer.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">⭐ {writer.rating} • {writer.completed} orders</p>
                        <Button variant="ghost" size="sm">View Profile</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  System Settings
                </CardTitle>
                <CardDescription>Admin configuration and system status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">System Status: Online</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">All services are running normally</p>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">Admin Panel Features</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>✅ User authentication working</li>
                    <li>✅ Admin access configured</li>
                    <li>✅ Dashboard statistics active</li>
                    <li>✅ Order management system ready</li>
                  </ul>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 font-medium">📊 Currently showing sample data</p>
                  <p className="text-sm text-yellow-700 mt-1">Connect your database to see real orders and clients</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default SimpleAdminPage;