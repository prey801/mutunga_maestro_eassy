-- Enhanced Database Schema for Maestro Essays
-- This script creates the complete database structure with proper dependency handling

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types for better data consistency
DO $$ BEGIN
    CREATE TYPE paper_category AS ENUM (
      'essay',
      'research_paper',
      'thesis',
      'dissertation',
      'case_study',
      'lab_report',
      'presentation',
      'coursework',
      'assignment',
      'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM (
      'pending',
      'assigned',
      'in_progress',
      'under_review',
      'revision_requested',
      'completed',
      'cancelled',
      'refunded'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE message_type AS ENUM (
      'client_message',
      'writer_message',
      'admin_message',
      'system_message',
      'revision_request'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM (
      'pending',
      'completed',
      'failed',
      'refunded',
      'partially_refunded'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
      'order_assigned',
      'message_received',
      'order_completed',
      'payment_received',
      'revision_requested',
      'deadline_reminder'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table first (base dependency)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  first_name text,
  last_name text,
  email text,
  is_writer boolean DEFAULT false,
  bio text,
  phone text,
  country text,
  timezone text DEFAULT 'UTC',
  profile_picture_url text,
  rating numeric(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  total_reviews integer DEFAULT 0,
  total_orders_completed integer DEFAULT 0,
  is_active boolean DEFAULT true,
  last_login_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT profiles_user_id_unique UNIQUE (user_id)
);

-- Subjects table for categorizing academic disciplines
CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT subjects_pkey PRIMARY KEY (id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  writer_id uuid,
  title text NOT NULL,
  description text NOT NULL,
  subject_id uuid,
  paper_category paper_category DEFAULT 'essay',
  word_count integer DEFAULT 275,
  pages integer DEFAULT 1,
  formatting_style text DEFAULT 'APA',
  sources_required integer DEFAULT 0,
  price numeric NOT NULL,
  deadline timestamp with time zone NOT NULL,
  urgency_hours integer,
  is_urgent boolean DEFAULT false,
  status order_status DEFAULT 'pending',
  total_revisions integer DEFAULT 0,
  assigned_at timestamp with time zone,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  client_rating integer CHECK (client_rating >= 1 AND client_rating <= 5),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT orders_writer_id_fkey FOREIGN KEY (writer_id) REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT orders_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id)
);

-- Writer expertise junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.writer_expertise (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  writer_id uuid NOT NULL,
  subject_id uuid NOT NULL,
  proficiency_level integer NOT NULL DEFAULT 1 CHECK (proficiency_level >= 1 AND proficiency_level <= 5),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT writer_expertise_pkey PRIMARY KEY (id),
  CONSTRAINT writer_expertise_writer_id_fkey FOREIGN KEY (writer_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT writer_expertise_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE,
  CONSTRAINT writer_expertise_unique UNIQUE (writer_id, subject_id)
);

-- Order attachments table for better file management
CREATE TABLE IF NOT EXISTS public.order_attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  filename text NOT NULL,
  original_filename text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  uploaded_by uuid NOT NULL,
  is_from_client boolean NOT NULL DEFAULT true,
  uploaded_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT order_attachments_pkey PRIMARY KEY (id),
  CONSTRAINT order_attachments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE,
  CONSTRAINT order_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES auth.users(id)
);

-- Order messages for communication between clients and writers
CREATE TABLE IF NOT EXISTS public.order_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  message_type message_type NOT NULL DEFAULT 'client_message',
  subject text,
  content text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  is_important boolean NOT NULL DEFAULT false,
  parent_message_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT order_messages_pkey PRIMARY KEY (id),
  CONSTRAINT order_messages_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE,
  CONSTRAINT order_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id),
  CONSTRAINT order_messages_parent_message_id_fkey FOREIGN KEY (parent_message_id) REFERENCES public.order_messages(id)
);

-- Payment transactions table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  transaction_id text NOT NULL UNIQUE,
  payment_method text NOT NULL DEFAULT 'paypal',
  amount numeric NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'USD',
  status payment_status NOT NULL DEFAULT 'pending',
  gateway_response jsonb,
  processed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT payment_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT payment_transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE
);

-- Order reviews table for feedback system
CREATE TABLE IF NOT EXISTS public.order_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE,
  client_id uuid NOT NULL,
  writer_id uuid,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  quality_rating integer CHECK (quality_rating >= 1 AND quality_rating <= 5),
  communication_rating integer CHECK (communication_rating >= 1 AND communication_rating <= 5),
  timeliness_rating integer CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  review_text text,
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT order_reviews_pkey PRIMARY KEY (id),
  CONSTRAINT order_reviews_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE,
  CONSTRAINT order_reviews_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.users(id),
  CONSTRAINT order_reviews_writer_id_fkey FOREIGN KEY (writer_id) REFERENCES public.profiles(id)
);

-- Notifications table for system notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type notification_type NOT NULL,
  related_order_id uuid,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT notifications_related_order_id_fkey FOREIGN KEY (related_order_id) REFERENCES public.orders(id) ON DELETE SET NULL
);

-- Order revisions table for tracking revision requests
CREATE TABLE IF NOT EXISTS public.order_revisions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  revision_number integer NOT NULL DEFAULT 1,
  requested_by uuid NOT NULL,
  reason text NOT NULL,
  detailed_instructions text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT order_revisions_pkey PRIMARY KEY (id),
  CONSTRAINT order_revisions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE,
  CONSTRAINT order_revisions_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_writer ON public.profiles(is_writer);
CREATE INDEX IF NOT EXISTS idx_profiles_rating ON public.profiles(rating);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_writer_id ON public.orders(writer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_deadline ON public.orders(deadline);
CREATE INDEX IF NOT EXISTS idx_order_messages_order_id ON public.order_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_order_messages_sender_id ON public.order_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_order_messages_created_at ON public.order_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON public.payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Insert sample subjects (only if they don't exist)
INSERT INTO public.subjects (name, description) VALUES 
('English Literature', 'Literature analysis, creative writing, and language studies'),
('Business Administration', 'Management, marketing, finance, and business strategy'),
('Psychology', 'Human behavior, mental processes, and psychological research'),
('Computer Science', 'Programming, algorithms, software engineering, and IT'),
('History', 'Historical analysis, research, and documentation'),
('Biology', 'Life sciences, genetics, ecology, and biological research'),
('Chemistry', 'Chemical analysis, laboratory reports, and research'),
('Physics', 'Physical sciences, mechanics, and theoretical physics'),
('Mathematics', 'Mathematical analysis, statistics, and problem solving'),
('Nursing', 'Healthcare, medical procedures, and patient care'),
('Education', 'Teaching methods, curriculum design, and educational research'),
('Economics', 'Economic theory, market analysis, and financial studies'),
('Political Science', 'Government, politics, and public policy analysis'),
('Sociology', 'Social behavior, institutions, and cultural studies'),
('Philosophy', 'Philosophical analysis, ethics, and critical thinking')
ON CONFLICT (name) DO NOTHING;

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.profiles 
    SET total_orders_completed = total_orders_completed + 1,
        updated_at = NOW()
    WHERE id = NEW.writer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update profile stats when order is completed
DROP TRIGGER IF EXISTS update_profile_stats_trigger ON public.orders;
CREATE TRIGGER update_profile_stats_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_stats();

-- Function to update writer rating when review is added
CREATE OR REPLACE FUNCTION update_writer_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles 
  SET rating = (
    SELECT ROUND(AVG(rating)::numeric, 2)
    FROM public.order_reviews
    WHERE writer_id = NEW.writer_id
  ),
  total_reviews = (
    SELECT COUNT(*)
    FROM public.order_reviews
    WHERE writer_id = NEW.writer_id
  ),
  updated_at = NOW()
  WHERE id = NEW.writer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update writer rating when review is added
DROP TRIGGER IF EXISTS update_writer_rating_trigger ON public.order_reviews;
CREATE TRIGGER update_writer_rating_trigger
  AFTER INSERT OR UPDATE ON public.order_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_writer_rating();

-- Create RLS (Row Level Security) policies
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writer_expertise ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_revisions ENABLE ROW LEVEL SECURITY;

-- Policies for subjects (public read access)
DROP POLICY IF EXISTS "Subjects are viewable by everyone" ON public.subjects;
CREATE POLICY "Subjects are viewable by everyone" ON public.subjects
  FOR SELECT USING (is_active = true);

-- Policies for profiles (users can view all active profiles, manage their own)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for orders (users can see their own orders, writers can see assigned orders)
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (
    auth.uid() = orders.user_id OR 
    auth.uid() IN (SELECT p.user_id FROM public.profiles p WHERE p.id = orders.writer_id)
  );

DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
CREATE POLICY "Users can create their own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = orders.user_id);

DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
CREATE POLICY "Users can update their own orders" ON public.orders
  FOR UPDATE USING (
    auth.uid() = orders.user_id OR 
    auth.uid() IN (SELECT p.user_id FROM public.profiles p WHERE p.id = orders.writer_id)
  );

-- Policies for writer expertise (writers can manage their own)
DROP POLICY IF EXISTS "Writers can manage their own expertise" ON public.writer_expertise;
CREATE POLICY "Writers can manage their own expertise" ON public.writer_expertise
  FOR ALL USING (
    auth.uid() IN (SELECT p.user_id FROM public.profiles p WHERE p.id = writer_expertise.writer_id)
  );

-- Policies for order attachments (order participants can access)
DROP POLICY IF EXISTS "Order participants can access attachments" ON public.order_attachments;
CREATE POLICY "Order participants can access attachments" ON public.order_attachments
  FOR ALL USING (
    auth.uid() IN (
      SELECT o.user_id FROM public.orders o WHERE o.id = order_attachments.order_id
      UNION
      SELECT p.user_id FROM public.profiles p 
      JOIN public.orders o ON p.id = o.writer_id 
      WHERE o.id = order_attachments.order_id
    )
  );

-- Policies for order messages (order participants can access)
DROP POLICY IF EXISTS "Order participants can access messages" ON public.order_messages;
CREATE POLICY "Order participants can access messages" ON public.order_messages
  FOR ALL USING (
    auth.uid() IN (
      SELECT o.user_id FROM public.orders o WHERE o.id = order_messages.order_id
      UNION
      SELECT p.user_id FROM public.profiles p 
      JOIN public.orders o ON p.id = o.writer_id 
      WHERE o.id = order_messages.order_id
    )
  );

-- Policies for payment transactions (order owner can view)
DROP POLICY IF EXISTS "Order owner can view payment transactions" ON public.payment_transactions;
CREATE POLICY "Order owner can view payment transactions" ON public.payment_transactions
  FOR SELECT USING (
    auth.uid() IN (
      SELECT o.user_id FROM public.orders o WHERE o.id = payment_transactions.order_id
    )
  );

-- Policies for order reviews (public read, reviewers can write)
DROP POLICY IF EXISTS "Reviews are publicly viewable" ON public.order_reviews;
CREATE POLICY "Reviews are publicly viewable" ON public.order_reviews
  FOR SELECT USING (order_reviews.is_public = true);

DROP POLICY IF EXISTS "Clients can create reviews for their orders" ON public.order_reviews;
CREATE POLICY "Clients can create reviews for their orders" ON public.order_reviews
  FOR INSERT WITH CHECK (auth.uid() = order_reviews.client_id);

-- Policies for notifications (users can see their own)
DROP POLICY IF EXISTS "Users can access their own notifications" ON public.notifications;
CREATE POLICY "Users can access their own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = notifications.user_id);

-- Policies for order revisions (order participants can access)
DROP POLICY IF EXISTS "Order participants can access revisions" ON public.order_revisions;
CREATE POLICY "Order participants can access revisions" ON public.order_revisions
  FOR ALL USING (
    auth.uid() IN (
      SELECT o.user_id FROM public.orders o WHERE o.id = order_revisions.order_id
      UNION
      SELECT p.user_id FROM public.profiles p 
      JOIN public.orders o ON p.id = o.writer_id 
      WHERE o.id = order_revisions.order_id
    )
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON public.subjects TO anon;