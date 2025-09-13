// Enhanced Database Service for Maestro Essays
// Comprehensive database utilities with type safety

import { supabase } from '../customSupabaseClient';
import type {
  Order,
  OrderWithDetails,
  Profile,
  Subject,
  OrderMessage,
  OrderReview,
  PaymentTransaction,
  Notification,
  OrderRevision,
  OrderAttachment,
  WriterExpertise,
  CreateOrderRequest,
  UpdateOrderRequest,
  CreateMessageRequest,
  CreateReviewRequest,
  OrderFilters,
  QueryOptions,
  DatabaseResponse,
  DatabaseListResponse,
  OrderStatistics,
  WriterStatistics,
  ClientStatistics,
  WriterWithExpertise,
  OrderStatus,
  PaperCategory,
  MessageType,
  NotificationType,
} from '@/types/database';

// Error handling utility
const handleDatabaseError = (error: any) => {
  console.error('Database Error:', error);
  return error;
};

// ==================== SUBJECTS ====================

export const subjectService = {
  async getAll(): Promise<DatabaseListResponse<Subject>> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  async getById(id: string): Promise<DatabaseResponse<Subject>> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .single();
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  async create(subject: Omit<Subject, 'id' | 'created_at'>): Promise<DatabaseResponse<Subject>> {
    const { data, error } = await supabase
      .from('subjects')
      .insert([subject])
      .select()
      .single();
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  async update(id: string, updates: Partial<Subject>): Promise<DatabaseResponse<Subject>> {
    const { data, error } = await supabase
      .from('subjects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },
};

// ==================== PROFILES ====================

export const profileService = {
  async getById(id: string): Promise<DatabaseResponse<Profile>> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  async getWritersWithExpertise(): Promise<DatabaseListResponse<WriterWithExpertise>> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        expertise:writer_expertise(
          *,
          subject:subjects(*)
        )
      `)
      .eq('is_writer', true)
      .eq('is_active', true);
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  async getWritersBySubject(subjectId: string): Promise<DatabaseListResponse<Profile>> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        expertise:writer_expertise!inner(subject_id)
      `)
      .eq('is_writer', true)
      .eq('is_active', true)
      .eq('expertise.subject_id', subjectId)
      .order('rating', { ascending: false });
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  async updateProfile(id: string, updates: Partial<Profile>): Promise<DatabaseResponse<Profile>> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  async updateLastLogin(id: string): Promise<DatabaseResponse<Profile>> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },
};

// ==================== ORDERS ====================

export const orderService = {
  async getById(id: string): Promise<DatabaseResponse<OrderWithDetails>> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        client:profiles!orders_user_id_fkey(*),
        writer:profiles!orders_writer_id_fkey(*),
        subject:subjects(*),
        messages:order_messages(count),
        attachments:order_attachments(count)
      `)
      .eq('id', id)
      .single();
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  async getByUserId(userId: string, options: QueryOptions = {}): Promise<DatabaseListResponse<OrderWithDetails>> {
    let query = supabase
      .from('orders')
      .select(`
        *,
        client:profiles!orders_user_id_fkey(*),
        writer:profiles!orders_writer_id_fkey(*),
        subject:subjects(*)
      `)
      .eq('user_id', userId);

    if (options.sort) {
      query = query.order(options.sort.column, { ascending: options.sort.ascending ?? false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    if (options.pagination) {
      const { limit = 10, offset = 0 } = options.pagination;
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error } = await query;
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  async getAll(options: QueryOptions = {}): Promise<DatabaseListResponse<OrderWithDetails>> {
    let query = supabase
      .from('orders')
      .select(`
        *,
        client:profiles!orders_user_id_fkey(*),
        writer:profiles!orders_writer_id_fkey(*),
        subject:subjects(*)
      `);

    // Apply filters
    if (options.filters) {
      const { status, writer_id, subject_id, paper_category, date_from, date_to, is_urgent, search } = options.filters;
      
      if (status) {
        if (Array.isArray(status)) {
          query = query.in('status', status);
        } else {
          query = query.eq('status', status);
        }
      }
      
      if (writer_id) query = query.eq('writer_id', writer_id);
      if (subject_id) query = query.eq('subject_id', subject_id);
      if (paper_category) query = query.eq('paper_category', paper_category);
      if (is_urgent !== undefined) query = query.eq('is_urgent', is_urgent);
      if (date_from) query = query.gte('created_at', date_from);
      if (date_to) query = query.lte('created_at', date_to);
      
      if (search) {
        query = query.or(`topic.ilike.%${search}%,instructions.ilike.%${search}%`);
      }
    }

    // Apply sorting
    if (options.sort) {
      query = query.order(options.sort.column, { ascending: options.sort.ascending ?? false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    if (options.pagination) {
      const { limit = 20, offset = 0 } = options.pagination;
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error } = await query;
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  async create(orderData: CreateOrderRequest): Promise<DatabaseResponse<Order>> {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  async update(id: string, updates: UpdateOrderRequest): Promise<DatabaseResponse<Order>> {
    const { data, error } = await supabase
      .from('orders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  async updateStatus(id: string, status: OrderStatus): Promise<DatabaseResponse<Order>> {
    const updates: any = { status, updated_at: new Date().toISOString() };
    
    // Add timestamps for specific status changes
    if (status === 'assigned') {
      updates.assigned_at = new Date().toISOString();
    } else if (status === 'in_progress') {
      updates.started_at = new Date().toISOString();
    } else if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  async assignWriter(orderId: string, writerId: string): Promise<DatabaseResponse<Order>> {
    const { data, error } = await supabase
      .from('orders')
      .update({
        writer_id: writerId,
        status: 'assigned',
        assigned_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  async delete(id: string): Promise<DatabaseResponse<null>> {
    const { data, error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  // Get statistics
  async getStatistics(): Promise<DatabaseResponse<OrderStatistics>> {
    const { data, error } = await supabase
      .rpc('get_order_statistics');
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },
};

// ==================== ORDER MESSAGES ====================

export const messageService = {
  async getByOrderId(orderId: string): Promise<DatabaseListResponse<OrderMessage>> {
    const { data, error } = await supabase
      .from('order_messages')
      .select(`
        *,
        sender:profiles(full_name, profile_picture_url, is_writer)
      `)
      .eq('order_id', orderId)
      .order('created_at');
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  async create(messageData: CreateMessageRequest): Promise<DatabaseResponse<OrderMessage>> {
    const { data, error } = await supabase
      .from('order_messages')
      .insert([{ ...messageData, sender_id: (await supabase.auth.getUser()).data.user?.id }])
      .select(`
        *,
        sender:profiles(full_name, profile_picture_url, is_writer)
      `)
      .single();
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  async markAsRead(messageIds: string[]): Promise<DatabaseResponse<null>> {
    const { data, error } = await supabase
      .from('order_messages')
      .update({ is_read: true })
      .in('id', messageIds);
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  async getUnreadCount(userId: string): Promise<DatabaseResponse<number>> {
    const { count, error } = await supabase
      .from('order_messages')
      .select('*', { count: 'exact', head: true })
      .neq('sender_id', userId)
      .eq('is_read', false)
      .in('order_id', 
        supabase
          .from('orders')
          .select('id')
          .or(`user_id.eq.${userId},writer_id.eq.${userId}`)
      );
    
    return { data: count ?? 0, error: error ? handleDatabaseError(error) : null };
  },
};

// ==================== ORDER REVIEWS ====================

export const reviewService = {
  async getByOrderId(orderId: string): Promise<DatabaseResponse<OrderReview>> {
    const { data, error } = await supabase
      .from('order_reviews')
      .select(`
        *,
        client:profiles!order_reviews_client_id_fkey(full_name, profile_picture_url),
        writer:profiles!order_reviews_writer_id_fkey(full_name, profile_picture_url)
      `)
      .eq('order_id', orderId)
      .single();
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  async getByWriterId(writerId: string, limit = 10): Promise<DatabaseListResponse<OrderReview>> {
    const { data, error } = await supabase
      .from('order_reviews')
      .select(`
        *,
        client:profiles!order_reviews_client_id_fkey(full_name, profile_picture_url),
        order:orders(topic, work_type)
      `)
      .eq('writer_id', writerId)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  async create(reviewData: CreateReviewRequest): Promise<DatabaseResponse<OrderReview>> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    const { data, error } = await supabase
      .from('order_reviews')
      .insert([{ ...reviewData, client_id: userId }])
      .select()
      .single();
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  async update(id: string, updates: Partial<OrderReview>): Promise<DatabaseResponse<OrderReview>> {
    const { data, error } = await supabase
      .from('order_reviews')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },
};

// ==================== PAYMENT TRANSACTIONS ====================

export const paymentService = {
  async getByOrderId(orderId: string): Promise<DatabaseListResponse<PaymentTransaction>> {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  async create(paymentData: Omit<PaymentTransaction, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseResponse<PaymentTransaction>> {
    const { data, error } = await supabase
      .from('payment_transactions')
      .insert([paymentData])
      .select()
      .single();
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  async updateStatus(id: string, status: string, gatewayResponse?: any): Promise<DatabaseResponse<PaymentTransaction>> {
    const updates: any = { 
      status, 
      updated_at: new Date().toISOString() 
    };
    
    if (gatewayResponse) {
      updates.gateway_response = gatewayResponse;
    }
    
    if (status === 'completed') {
      updates.processed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('payment_transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },
};

// ==================== NOTIFICATIONS ====================

export const notificationService = {
  async getByUserId(userId: string, limit = 20): Promise<DatabaseListResponse<Notification>> {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        order:orders(topic, status)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  async create(notificationData: Omit<Notification, 'id' | 'created_at'>): Promise<DatabaseResponse<Notification>> {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  async markAsRead(notificationIds: string[]): Promise<DatabaseResponse<null>> {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', notificationIds);
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  async getUnreadCount(userId: string): Promise<DatabaseResponse<number>> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    
    return { data: count ?? 0, error: error ? handleDatabaseError(error) : null };
  },

  async markAllAsRead(userId: string): Promise<DatabaseResponse<null>> {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },
};

// ==================== ORDER ATTACHMENTS ====================

export const attachmentService = {
  async getByOrderId(orderId: string): Promise<DatabaseListResponse<OrderAttachment>> {
    const { data, error } = await supabase
      .from('order_attachments')
      .select('*')
      .eq('order_id', orderId)
      .order('uploaded_at');
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  async create(attachmentData: Omit<OrderAttachment, 'id' | 'created_at' | 'uploaded_at'>): Promise<DatabaseResponse<OrderAttachment>> {
    const { data, error } = await supabase
      .from('order_attachments')
      .insert([attachmentData])
      .select()
      .single();
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  async delete(id: string): Promise<DatabaseResponse<null>> {
    const { data, error } = await supabase
      .from('order_attachments')
      .delete()
      .eq('id', id);
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },
};

// ==================== WRITER EXPERTISE ====================

export const expertiseService = {
  async getByWriterId(writerId: string): Promise<DatabaseListResponse<WriterExpertise>> {
    const { data, error } = await supabase
      .from('writer_expertise')
      .select(`
        *,
        subject:subjects(*)
      `)
      .eq('writer_id', writerId);
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  async create(expertiseData: Omit<WriterExpertise, 'id' | 'created_at'>): Promise<DatabaseResponse<WriterExpertise>> {
    const { data, error } = await supabase
      .from('writer_expertise')
      .insert([expertiseData])
      .select(`
        *,
        subject:subjects(*)
      `)
      .single();
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  async update(id: string, updates: Partial<WriterExpertise>): Promise<DatabaseResponse<WriterExpertise>> {
    const { data, error } = await supabase
      .from('writer_expertise')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        subject:subjects(*)
      `)
      .single();
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },

  async delete(id: string): Promise<DatabaseResponse<null>> {
    const { data, error } = await supabase
      .from('writer_expertise')
      .delete()
      .eq('id', id);
    
    return { data, error: error ? handleDatabaseError(error) : null };
  },
};

// ==================== STATISTICS ====================

export const statisticsService = {
  async getOrderStatistics(): Promise<DatabaseResponse<OrderStatistics>> {
    // This would typically be a database function/view
    // For now, we'll query multiple tables
    const [ordersResult, profilesResult] = await Promise.all([
      supabase.from('orders').select('status, price'),
      supabase.from('profiles').select('is_writer')
    ]);

    if (ordersResult.error || profilesResult.error) {
      return { 
        data: null, 
        error: ordersResult.error || profilesResult.error 
      };
    }

    const orders = ordersResult.data || [];
    const profiles = profilesResult.data || [];

    const stats: OrderStatistics = {
      total_orders: orders.length,
      total_revenue: orders.reduce((sum, order) => sum + parseFloat(order.price || '0'), 0),
      pending_orders: orders.filter(o => o.status === 'pending').length,
      assigned_orders: orders.filter(o => o.status === 'assigned').length,
      in_progress_orders: orders.filter(o => o.status === 'in_progress').length,
      completed_orders: orders.filter(o => o.status === 'completed').length,
      cancelled_orders: orders.filter(o => o.status === 'cancelled').length,
      average_rating: 4.5, // This would come from reviews
      total_clients: profiles.filter(p => !p.is_writer).length,
      total_writers: profiles.filter(p => p.is_writer).length,
    };

    return { data: stats, error: null };
  },

  async getWriterStatistics(writerId: string): Promise<DatabaseResponse<WriterStatistics>> {
    const [ordersResult, reviewsResult, expertiseResult] = await Promise.all([
      supabase.from('orders').select('status, completed_at, assigned_at').eq('writer_id', writerId),
      supabase.from('order_reviews').select('rating').eq('writer_id', writerId),
      supabase.from('writer_expertise').select('*, subject:subjects(*)').eq('writer_id', writerId)
    ]);

    if (ordersResult.error || reviewsResult.error || expertiseResult.error) {
      return { 
        data: null, 
        error: ordersResult.error || reviewsResult.error || expertiseResult.error 
      };
    }

    const orders = ordersResult.data || [];
    const reviews = reviewsResult.data || [];
    const expertise = expertiseResult.data || [];

    const completedOrders = orders.filter(o => o.status === 'completed');
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0;

    // Calculate average completion time in hours
    const completionTimes = completedOrders
      .filter(o => o.assigned_at && o.completed_at)
      .map(o => {
        const assigned = new Date(o.assigned_at);
        const completed = new Date(o.completed_at);
        return (completed.getTime() - assigned.getTime()) / (1000 * 60 * 60); // hours
      });

    const averageCompletionTime = completionTimes.length > 0
      ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
      : 0;

    const stats: WriterStatistics = {
      total_orders: orders.length,
      completed_orders: completedOrders.length,
      average_rating: averageRating,
      total_reviews: reviews.length,
      completion_rate: orders.length > 0 ? (completedOrders.length / orders.length) * 100 : 0,
      average_completion_time: averageCompletionTime,
      subjects: expertise.map(e => e.subject).filter(Boolean),
    };

    return { data: stats, error: null };
  },

  async getClientStatistics(clientId: string): Promise<DatabaseResponse<ClientStatistics>> {
    const ordersResult = await supabase
      .from('orders')
      .select('price, subject:subjects(*)')
      .eq('user_id', clientId);

    if (ordersResult.error) {
      return { data: null, error: ordersResult.error };
    }

    const orders = ordersResult.data || [];
    const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.price || '0'), 0);
    
    // Count subject frequencies
    const subjectCounts: { [key: string]: number } = {};
    orders.forEach(order => {
      if (order.subject?.name) {
        subjectCounts[order.subject.name] = (subjectCounts[order.subject.name] || 0) + 1;
      }
    });

    const favoriteSubjects = Object.entries(subjectCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([name]) => ({ name, description: null, is_active: true, id: '', created_at: '' }));

    const stats: ClientStatistics = {
      total_orders: orders.length,
      total_spent: totalSpent,
      average_order_value: orders.length > 0 ? totalSpent / orders.length : 0,
      favorite_subjects: favoriteSubjects,
      satisfaction_rating: 4.5, // This would come from reviews
    };

    return { data: stats, error: null };
  },
};

// Helper function to create notifications
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
  relatedOrderId?: string
) => {
  return await notificationService.create({
    user_id: userId,
    title,
    message,
    type,
    related_order_id: relatedOrderId,
    is_read: false,
  });
};

// Helper function to send system messages
export const sendSystemMessage = async (
  orderId: string,
  content: string,
  subject?: string
) => {
  return await messageService.create({
    order_id: orderId,
    message_type: 'system_message',
    subject: subject || 'System Message',
    content,
  });
};

// Export all services
export {
  subjectService,
  profileService,
  orderService,
  messageService,
  reviewService,
  paymentService,
  notificationService,
  attachmentService,
  expertiseService,
  statisticsService,
};

// Export everything for easy importing
export * from '@/types/database';