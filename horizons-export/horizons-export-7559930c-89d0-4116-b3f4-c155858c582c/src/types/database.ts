// Enhanced Database Types for Maestro Essays
// Generated from the enhanced database schema

export type PaperCategory = 
  | 'essay'
  | 'research_paper'
  | 'thesis'
  | 'dissertation'
  | 'case_study'
  | 'lab_report'
  | 'presentation'
  | 'coursework'
  | 'assignment'
  | 'other';

export type OrderStatus = 
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'under_review'
  | 'revision_requested'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export type MessageType = 
  | 'client_message'
  | 'writer_message'
  | 'admin_message'
  | 'system_message'
  | 'revision_request';

export type PaymentStatus = 
  | 'pending'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export type NotificationType = 
  | 'order_assigned'
  | 'message_received'
  | 'order_completed'
  | 'payment_received'
  | 'revision_requested'
  | 'deadline_reminder';

export type RevisionStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'rejected';

// Base interfaces
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
}

// Subject related types
export interface Subject extends BaseEntity {
  name: string;
  description: string | null;
  is_active: boolean;
}

// Enhanced Profile interface
export interface Profile extends BaseEntity {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  is_writer: boolean;
  bio: string | null;
  phone: string | null;
  country: string | null;
  timezone: string;
  profile_picture_url: string | null;
  rating: number;
  total_reviews: number;
  total_orders_completed: number;
  is_active: boolean;
  last_login_at: string | null;
  
  // Computed property for backward compatibility
  get full_name(): string | null {
    if (this.first_name && this.last_name) {
      return `${this.first_name} ${this.last_name}`;
    }
    return this.first_name || this.last_name || null;
  }
}

// Writer expertise
export interface WriterExpertise extends BaseEntity {
  writer_id: string;
  subject_id: string;
  proficiency_level: number; // 1-5
  subject?: Subject;
  writer?: Profile;
}

// Enhanced Order interface
export interface Order extends BaseEntity {
  user_id: string;
  writer_id: string | null;
  title: string;
  description: string;
  subject_id: string | null;
  paper_category: PaperCategory;
  word_count: number;
  pages: number;
  formatting_style: string;
  sources_required: number;
  price: number;
  deadline: string;
  urgency_hours: number | null;
  is_urgent: boolean;
  status: OrderStatus;
  total_revisions: number;
  assigned_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  client_rating: number | null;
  
  // Relationships
  client?: Profile;
  writer?: Profile;
  subject?: Subject;
  attachments?: OrderAttachment[];
  messages?: OrderMessage[];
  reviews?: OrderReview[];
  payments?: PaymentTransaction[];
  revisions?: OrderRevision[];
}

// Order attachments
export interface OrderAttachment extends BaseEntity {
  order_id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  is_from_client: boolean;
  uploaded_at: string;
  
  // Relationships
  order?: Order;
}

// Order messages
export interface OrderMessage extends BaseEntity {
  order_id: string;
  sender_id: string;
  message_type: MessageType;
  subject: string | null;
  content: string;
  is_read: boolean;
  is_important: boolean;
  parent_message_id: string | null;
  
  // Relationships
  order?: Order;
  sender?: Profile;
  parent_message?: OrderMessage;
  replies?: OrderMessage[];
}

// Payment transactions
export interface PaymentTransaction extends BaseEntity {
  order_id: string;
  transaction_id: string;
  payment_method: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  gateway_response: any; // JSON
  processed_at: string | null;
  
  // Relationships
  order?: Order;
}

// Order reviews
export interface OrderReview extends BaseEntity {
  order_id: string;
  client_id: string;
  writer_id: string | null;
  rating: number; // 1-5
  quality_rating: number | null; // 1-5
  communication_rating: number | null; // 1-5
  timeliness_rating: number | null; // 1-5
  review_text: string | null;
  is_public: boolean;
  
  // Relationships
  order?: Order;
  client?: Profile;
  writer?: Profile;
}

// Notifications
export interface Notification extends BaseEntity {
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  related_order_id: string | null;
  is_read: boolean;
  
  // Relationships
  order?: Order;
}

// Order revisions
export interface OrderRevision extends BaseEntity {
  order_id: string;
  revision_number: number;
  requested_by: string;
  reason: string;
  detailed_instructions: string | null;
  status: RevisionStatus;
  completed_at: string | null;
  
  // Relationships
  order?: Order;
  requester?: Profile;
}

// Database response types
export interface DatabaseResponse<T> {
  data: T | null;
  error: any;
}

export interface DatabaseListResponse<T> {
  data: T[] | null;
  error: any;
}

// Query builder types
export interface OrderFilters {
  status?: OrderStatus | OrderStatus[];
  user_id?: string;
  writer_id?: string;
  subject_id?: string;
  paper_category?: PaperCategory;
  date_from?: string;
  date_to?: string;
  is_urgent?: boolean;
  search?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SortOptions {
  column: string;
  ascending?: boolean;
}

export interface QueryOptions {
  filters?: OrderFilters;
  pagination?: PaginationOptions;
  sort?: SortOptions;
  include?: string[]; // For including related data
}

// API request/response types
export interface CreateOrderRequest {
  topic: string;
  work_type: string;
  academic_level: string;
  pages: number;
  deadline: string;
  price: number;
  instructions?: string;
  subject_id?: string;
  paper_category: PaperCategory;
  word_count: number;
  formatting_style: string;
  sources_required: number;
  is_urgent: boolean;
}

export interface UpdateOrderRequest extends Partial<CreateOrderRequest> {
  status?: OrderStatus;
  writer_id?: string;
}

export interface CreateMessageRequest {
  order_id: string;
  message_type: MessageType;
  subject?: string;
  content: string;
  parent_message_id?: string;
  is_important?: boolean;
}

export interface CreateReviewRequest {
  order_id: string;
  rating: number;
  quality_rating?: number;
  communication_rating?: number;
  timeliness_rating?: number;
  review_text?: string;
  is_public?: boolean;
}

// Statistics and analytics types
export interface OrderStatistics {
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  assigned_orders: number;
  in_progress_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  average_rating: number;
  total_clients: number;
  total_writers: number;
}

export interface WriterStatistics {
  total_orders: number;
  completed_orders: number;
  average_rating: number;
  total_reviews: number;
  completion_rate: number;
  average_completion_time: number; // in hours
  subjects: Subject[];
}

export interface ClientStatistics {
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  favorite_subjects: Subject[];
  satisfaction_rating: number;
}

// Form validation types
export interface OrderFormData {
  paperType: string;
  academicLevel: string;
  wordCount: number;
  urgency: string;
  description: string;
  subject: string;
  formattingStyle: string;
  sourcesRequired: number;
  files: File[];
}

export interface ProfileFormData {
  full_name: string;
  bio?: string;
  phone?: string;
  country?: string;
  timezone?: string;
  expertise_areas?: string[]; // subject IDs for writers
}

// Utility types
export type OrderWithDetails = Order & {
  client: Profile;
  writer: Profile | null;
  subject: Subject | null;
  message_count: number;
  attachment_count: number;
  latest_message?: OrderMessage;
};

export type WriterWithExpertise = Profile & {
  expertise: (WriterExpertise & { subject: Subject })[];
  recent_orders: Order[];
};

// Supabase specific types (if needed for direct database operations)
export interface SupabaseOrder {
  id: string;
  user_id: string;
  writer_id: string | null;
  topic: string;
  work_type: string;
  academic_level: string;
  pages: number;
  deadline: string;
  price: string; // Supabase returns numeric as string
  status: OrderStatus;
  instructions: string | null;
  attachment_paths: string[] | null;
  created_at: string;
  updated_at: string;
  subject_id: string | null;
  paper_category: PaperCategory;
  total_revisions: number;
  assigned_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  client_rating: number | null;
  urgency_hours: number | null;
  word_count: number;
  formatting_style: string;
  sources_required: number;
  is_urgent: boolean;
}

// Export all types for easy importing
export type {
  // Add any additional exports here if needed
};