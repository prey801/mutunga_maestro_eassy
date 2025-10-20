import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, FileText, Search, Clock, CheckCircle, Edit, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminPage = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [writers, setWriters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      // Check if orders table exists first
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Fetch all profiles (both clients and writers)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true);

      if (orderError && orderError.code !== 'PGRST116') {
        console.error('Order error:', orderError);
        // Don't show toast on first error, just set empty data
      }

      if (profileError) {
        console.error('Profile error:', profileError);
        // Don't show toast on first error, just set empty data
      }

      // Set the data (even if empty arrays)
      setOrders(orderData || []);
      
      // Separate clients and writers from profiles
      const profiles = profileData || [];
      setClients(profiles.filter(p => !p.is_writer && !p.is_admin));
      setWriters(profiles.filter(p => p.is_writer));
      
    } catch (error) {
      console.error('Unexpected error in fetchData:', error);
      // Set empty data and stop loading
      setOrders([]);
      setClients([]);
      setWriters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Remove toast dependency to prevent infinite loop

  const handleStatusChange = async (orderId, newStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      toast({ variant: 'destructive', title: 'Error updating status', description: error.message });
    } else {
      toast({ title: 'Order status updated!' });
      fetchData();
    }
  };

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.price || 0), 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    return { totalOrders, totalRevenue, pendingOrders, completedOrders };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    return orders.filter(order =>
      (order.topic || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.id || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user_id || '').toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

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
  
  const handleNotImplemented = () => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-lg text-gray-600 mb-8">Manage orders, clients, and writers efficiently.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Total Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: "from-green-400 to-emerald-600" },
          { title: "Total Orders", value: stats.totalOrders, icon: FileText, color: "from-sky-400 to-blue-600" },
          { title: "Pending Orders", value: stats.pendingOrders, icon: Clock, color: "from-yellow-400 to-orange-600" },
          { title: "Completed Orders", value: stats.completedOrders, icon: CheckCircle, color: "from-teal-400 to-cyan-600" },
        ].map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: i * 0.1 }}>
            <Card className="shadow-lg border-0 overflow-hidden">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center shadow-md`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-200/80 backdrop-blur-sm">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="writers">Writers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>View, track, and update all customer orders.</CardDescription>
                <div className="relative pt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input placeholder="Search orders by topic, ID, or client..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? <p>Loading orders...</p> : filteredOrders.map(order => (
                    <div key={order.id} className="border rounded-lg p-4 transition-all hover:shadow-md">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <div className="md:col-span-2">
                          <p className="font-semibold text-gray-800">{order.topic}</p>
                          <p className="text-xs text-gray-500">ID: {order.id}</p>
                          <p className="text-sm text-gray-600">Client: {order.user_id ? `User ${order.user_id.slice(-8)}` : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">${order.price}</p>
                          <p className="text-xs text-gray-500">Due: {new Date(order.deadline).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center">
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select onValueChange={(value) => handleStatusChange(order.id, value)} defaultValue={order.status}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="assigned">Assigned</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="icon" onClick={handleNotImplemented}><Edit className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!loading && filteredOrders.length === 0 && <p className="text-center text-gray-500 py-8">No orders found.</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle>Client Management</CardTitle>
                <CardDescription>List of all registered clients.</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="space-y-2">
                    {loading ? <p>Loading clients...</p> : clients.map(client => (
                    <div key={client.id} className="flex items-center justify-between p-3 border rounded-md">
                            <p className="font-medium">{client.first_name && client.last_name ? `${client.first_name} ${client.last_name}` : client.email || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">{client.email || 'No email'}</p>
                        </div>
                    ))}
                    {!loading && clients.length === 0 && <p className="text-center text-gray-500 py-8">No clients found.</p>}
                 </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="writers">
            <Card>
              <CardHeader>
                <CardTitle>Writer Management</CardTitle>
                <CardDescription>Manage your team of writers.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                    {loading ? <p>Loading writers...</p> : writers.map(writer => (
                        <div key={writer.id} className="flex items-center justify-between p-3 border rounded-md">
                            <p className="font-medium">{writer.first_name && writer.last_name ? `${writer.first_name} ${writer.last_name}` : writer.email || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">{writer.email || 'No email'}</p>
                        </div>
                    ))}
                    {!loading && writers.length === 0 && <p className="text-center text-gray-500 py-8">No writers found.</p>}
                 </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Business Analytics</CardTitle>
                <CardDescription>Insights into your business performance.</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-16">
                 <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                 <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Analytics Coming Soon</h3>
                 <p className="text-gray-600">This section will provide detailed charts and reports.</p>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </motion.div>
    </div>
  );
};

export default AdminPage;