import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, Users, FileText, Search, Clock, CheckCircle, Edit, DollarSign,
  MessageSquare, Star, TrendingUp, Calendar, Filter, Download, Eye,
  UserCheck, AlertTriangle, BookOpen, Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Import our enhanced database services
import { 
  orderService, 
  profileService, 
  messageService,
  reviewService,
  statisticsService,
  subjectService,
  createNotification,
  sendSystemMessage 
} from '@/lib/database';

import type { 
  OrderWithDetails, 
  Profile, 
  OrderStatistics,
  Subject,
  OrderStatus,
  QueryOptions 
} from '@/types/database';

const EnhancedAdminPage = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [clients, setClients] = useState<Profile[]>([]);
  const [writers, setWriters] = useState<Profile[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [statistics, setStatistics] = useState<OrderStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersResult, clientsResult, writersResult, subjectsResult, statsResult] = await Promise.all([
        orderService.getAll({
          pagination: { limit: 100 },
          sort: { column: 'created_at', ascending: false }
        }),
        profileService.getAll({ filters: { is_writer: false } }),
        profileService.getWritersWithExpertise(),
        subjectService.getAll(),
        statisticsService.getOrderStatistics()
      ]);

      if (ordersResult.error || clientsResult.error || writersResult.error || subjectsResult.error || statsResult.error) {
        throw new Error('Failed to fetch data');
      }

      setOrders(ordersResult.data || []);
      setClients(clientsResult.data || []);
      setWriters(writersResult.data || []);
      setSubjects(subjectsResult.data || []);
      setStatistics(statsResult.data);

    } catch (error) {
      toast({ 
        variant: 'destructive', 
        title: 'Error fetching data', 
        description: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await orderService.updateStatus(orderId, newStatus);

      if (error) {
        throw error;
      }

      // Find the order to get client/writer info for notifications
      const order = orders.find(o => o.id === orderId);
      if (order) {
        // Create notification for client
        await createNotification(
          order.user_id,
          'Order Status Updated',
          `Your order "${order.topic}" has been updated to ${newStatus}`,
          'order_assigned',
          orderId
        );

        // Send system message
        await sendSystemMessage(
          orderId,
          `Order status has been updated to: ${newStatus}`,
          'Status Update'
        );
      }

      toast({ title: 'Order status updated successfully!' });
      fetchData(); // Refresh data
    } catch (error) {
      toast({ 
        variant: 'destructive', 
        title: 'Error updating status', 
        description: error.message 
      });
    }
  };

  const handleAssignWriter = async (orderId: string, writerId: string) => {
    try {
      const { error } = await orderService.assignWriter(orderId, writerId);

      if (error) {
        throw error;
      }

      const order = orders.find(o => o.id === orderId);
      const writer = writers.find(w => w.id === writerId);
      
      if (order && writer) {
        // Notify client
        await createNotification(
          order.user_id,
          'Writer Assigned',
          `${writer.full_name} has been assigned to your order "${order.topic}"`,
          'order_assigned',
          orderId
        );

        // Notify writer
        await createNotification(
          writerId,
          'New Order Assigned',
          `You have been assigned a new order: "${order.topic}"`,
          'order_assigned',
          orderId
        );

        // Send system message
        await sendSystemMessage(
          orderId,
          `${writer.full_name} has been assigned as your writer for this order.`,
          'Writer Assignment'
        );
      }

      toast({ title: 'Writer assigned successfully!' });
      fetchData();
    } catch (error) {
      toast({ 
        variant: 'destructive', 
        title: 'Error assigning writer', 
        description: error.message 
      });
    }
  };

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.writer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [orders, searchTerm, statusFilter]);

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'assigned': 'bg-blue-100 text-blue-800 border-blue-200',
      'in_progress': 'bg-purple-100 text-purple-800 border-purple-200',
      'under_review': 'bg-orange-100 text-orange-800 border-orange-200',
      'revision_requested': 'bg-red-100 text-red-800 border-red-200',
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'cancelled': 'bg-gray-100 text-gray-800 border-gray-200',
      'refunded': 'bg-pink-100 text-pink-800 border-pink-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: OrderStatus) => {
    const icons = {
      'pending': Clock,
      'assigned': UserCheck,
      'in_progress': TrendingUp,
      'under_review': Eye,
      'revision_requested': AlertTriangle,
      'completed': CheckCircle,
      'cancelled': X,
      'refunded': DollarSign,
    };
    const Icon = icons[status] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  const renderOrderDialog = () => (
    <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Comprehensive order information and management
          </DialogDescription>
        </DialogHeader>
        
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedOrder.topic}</h3>
                  <p className="text-sm text-gray-600">Order ID: {selectedOrder.id}</p>
                </div>
                <Badge className={getStatusColor(selectedOrder.status)}>
                  {getStatusIcon(selectedOrder.status)}
                  <span className="ml-1">{selectedOrder.status}</span>
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Price:</span>
                  <p className="font-semibold">${selectedOrder.price}</p>
                </div>
                <div>
                  <span className="text-gray-600">Pages:</span>
                  <p className="font-semibold">{selectedOrder.pages}</p>
                </div>
                <div>
                  <span className="text-gray-600">Deadline:</span>
                  <p className="font-semibold">
                    {new Date(selectedOrder.deadline).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Word Count:</span>
                  <p className="font-semibold">{selectedOrder.word_count}</p>
                </div>
              </div>
            </div>

            {/* Client and Writer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Client Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={selectedOrder.client?.profile_picture_url} />
                      <AvatarFallback>
                        {selectedOrder.client?.full_name?.charAt(0) || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedOrder.client?.full_name || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">Total Orders: {selectedOrder.client?.total_orders_completed || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Writer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedOrder.writer ? (
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={selectedOrder.writer.profile_picture_url} />
                        <AvatarFallback>
                          {selectedOrder.writer.full_name?.charAt(0) || 'W'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedOrder.writer.full_name}</p>
                        <div className="flex items-center space-x-2 text-sm">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{selectedOrder.writer.rating.toFixed(1)}</span>
                          <span className="text-gray-600">
                            ({selectedOrder.writer.total_reviews} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-gray-600">No writer assigned</p>
                      <Select onValueChange={(writerId) => handleAssignWriter(selectedOrder.id, writerId)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Assign a writer" />
                        </SelectTrigger>
                        <SelectContent>
                          {writers.map((writer) => (
                            <SelectItem key={writer.id} value={writer.id}>
                              <div className="flex items-center space-x-2">
                                <span>{writer.full_name}</span>
                                <Badge variant="secondary">
                                  ★ {writer.rating.toFixed(1)}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Order Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Academic Level:</span>
                    <p className="font-medium">{selectedOrder.academic_level}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Paper Type:</span>
                    <p className="font-medium">{selectedOrder.paper_category?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Subject:</span>
                    <p className="font-medium">{selectedOrder.subject?.name || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Formatting:</span>
                    <p className="font-medium">{selectedOrder.formatting_style}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Sources Required:</span>
                    <p className="font-medium">{selectedOrder.sources_required}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Urgency:</span>
                    <p className="font-medium">
                      {selectedOrder.is_urgent ? (
                        <Badge variant="destructive" className="text-xs">URGENT</Badge>
                      ) : (
                        'Standard'
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Revisions:</span>
                    <p className="font-medium">{selectedOrder.total_revisions}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <p className="font-medium">
                      {new Date(selectedOrder.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            {selectedOrder.instructions && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Client Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedOrder.instructions}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Status Management */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Select 
                    value={selectedOrder.status} 
                    onValueChange={(status: OrderStatus) => handleStatusChange(selectedOrder.id, status)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="revision_requested">Revision Requested</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-lg text-gray-600">Comprehensive order and user management system</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Reports
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statistics && [
          { 
            title: "Total Revenue", 
            value: `$${statistics.total_revenue.toLocaleString()}`, 
            icon: DollarSign, 
            color: "from-green-400 to-emerald-600",
            change: "+12.5%"
          },
          { 
            title: "Total Orders", 
            value: statistics.total_orders.toLocaleString(), 
            icon: FileText, 
            color: "from-sky-400 to-blue-600",
            change: "+8.2%"
          },
          { 
            title: "Active Writers", 
            value: statistics.total_writers.toLocaleString(), 
            icon: Users, 
            color: "from-purple-400 to-indigo-600",
            change: "+5.1%"
          },
          { 
            title: "Completion Rate", 
            value: `${((statistics.completed_orders / statistics.total_orders) * 100).toFixed(1)}%`, 
            icon: CheckCircle, 
            color: "from-teal-400 to-cyan-600",
            change: "+2.3%"
          },
        ].map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: i * 0.1 }}>
            <Card className="shadow-lg border-0 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">{stat.change}</span>
                    </div>
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
          <TabsList className="grid w-full grid-cols-5 bg-gray-200/80 backdrop-blur-sm">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="writers">Writers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Order Management</CardTitle>
                    <CardDescription>View, track, and manage all customer orders with enhanced filtering.</CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {filteredOrders.length} orders
                  </Badge>
                </div>
                
                {/* Enhanced Filters */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                      placeholder="Search by topic, ID, client, or writer..." 
                      className="pl-10" 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={(value: OrderStatus | 'all') => setStatusFilter(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="revision_requested">Revision Requested</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No orders found matching your criteria.</p>
                    </div>
                  ) : (
                    filteredOrders.map(order => (
                      <div key={order.id} className="border rounded-lg p-4 transition-all hover:shadow-md bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                          <div className="md:col-span-2">
                            <div className="flex items-start space-x-3">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800 hover:text-sky-600 cursor-pointer"
                                   onClick={() => {
                                     setSelectedOrder(order);
                                     setIsOrderDialogOpen(true);
                                   }}>
                                  {order.topic}
                                </p>
                                <p className="text-xs text-gray-500 font-mono">ID: {order.id.slice(0, 8)}...</p>
                                <p className="text-sm text-gray-600">
                                  Client: {order.client?.full_name || 'N/A'}
                                </p>
                                {order.writer && (
                                  <p className="text-sm text-gray-600">
                                    Writer: {order.writer.full_name}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <p className="text-lg font-bold text-green-600">${order.price}</p>
                            <p className="text-xs text-gray-500">{order.pages} pages</p>
                          </div>
                          
                          <div className="text-center">
                            <p className="text-sm text-gray-600">
                              {new Date(order.deadline).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {order.is_urgent && <Badge variant="destructive" className="text-xs">URGENT</Badge>}
                            </p>
                          </div>
                          
                          <div className="flex justify-center">
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-center gap-2">
                            <Select 
                              value={order.status} 
                              onValueChange={(status: OrderStatus) => handleStatusChange(order.id, status)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="assigned">Assigned</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="under_review">Under Review</SelectItem>
                                <SelectItem value="revision_requested">Revision Requested</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                <SelectItem value="refunded">Refunded</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsOrderDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle>Client Management</CardTitle>
                <CardDescription>Manage all registered clients and their order history.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clients.map(client => (
                    <div key={client.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={client.profile_picture_url} />
                            <AvatarFallback>
                              {client.full_name?.charAt(0) || 'C'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{client.full_name || 'No name provided'}</p>
                            <p className="text-sm text-gray-600">
                              Joined: {new Date(client.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              Orders: {client.total_orders_completed || 0}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={client.is_active ? 'default' : 'secondary'}>
                            {client.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
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
                <CardTitle>Writer Management</CardTitle>
                <CardDescription>Manage writers, their expertise, and performance metrics.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {writers.map(writer => (
                    <div key={writer.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={writer.profile_picture_url} />
                            <AvatarFallback>
                              {writer.full_name?.charAt(0) || 'W'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{writer.full_name || 'No name provided'}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm">{writer.rating.toFixed(1)}</span>
                                <span className="text-sm text-gray-600">({writer.total_reviews})</span>
                              </div>
                              <span className="text-sm text-gray-600">
                                {writer.total_orders_completed} orders completed
                              </span>
                            </div>
                            {writer.expertise && writer.expertise.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {writer.expertise.slice(0, 3).map((exp, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {exp.subject?.name}
                                  </Badge>
                                ))}
                                {writer.expertise.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{writer.expertise.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={writer.is_active ? 'default' : 'secondary'}>
                            {writer.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                  <CardDescription>Track revenue trends and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">This Month</span>
                      <span className="text-2xl font-bold text-green-600">
                        ${statistics?.total_revenue.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <p className="text-xs text-gray-600">75% of monthly target</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Distribution</CardTitle>
                  <CardDescription>Orders by status and category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {statistics && Object.entries({
                      'Pending': statistics.pending_orders,
                      'In Progress': statistics.in_progress_orders,
                      'Completed': statistics.completed_orders,
                      'Cancelled': statistics.cancelled_orders,
                    }).map(([status, count]) => (
                      <div key={status} className="flex justify-between items-center">
                        <span className="text-sm">{status}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-sky-600 h-2 rounded-full" 
                              style={{ width: `${(count / statistics.total_orders) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Management</CardTitle>
                <CardDescription>System settings, subjects, and configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center">
                      <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="font-medium">Subjects</p>
                      <p className="text-sm text-gray-600">{subjects.length} active subjects</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Manage
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center">
                      <Award className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="font-medium">Writer Verification</p>
                      <p className="text-sm text-gray-600">Pending applications</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Review
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center">
                      <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="font-medium">System Messages</p>
                      <p className="text-sm text-gray-600">Bulk notifications</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Send
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Order Details Dialog */}
      {renderOrderDialog()}
    </div>
  );
};

export default EnhancedAdminPage;