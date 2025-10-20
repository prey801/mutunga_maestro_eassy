-- =====================================================
-- MAESTRO ESSAYS - ADMIN DASHBOARD DATABASE SETUP
-- =====================================================
-- Run these commands in your Supabase SQL Editor
-- or PostgreSQL database to set up admin functionality

-- 1. PROFILES TABLE (User Management)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    country TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    is_writer BOOLEAN DEFAULT FALSE,
    writer_rating DECIMAL(3,2) DEFAULT 0.0,
    total_orders_completed INTEGER DEFAULT 0,
    specializations TEXT[],
    bio TEXT,
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ORDERS TABLE (Main Orders Management)
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    
    -- Order Basic Info
    topic TEXT NOT NULL,
    subject TEXT,
    description TEXT,
    instructions TEXT,
    
    -- Academic Requirements
    paper_type TEXT,
    academic_level TEXT,
    citation_style TEXT,
    urgency TEXT,
    
    -- Specifications
    pages INTEGER,
    word_count INTEGER,
    sources INTEGER,
    spacing TEXT DEFAULT 'double',
    language TEXT DEFAULT 'English',
    
    -- Pricing & Payment
    price DECIMAL(10,2),
    payment_status TEXT DEFAULT 'pending', -- pending, paid, refunded
    payment_id TEXT,
    payment_method TEXT,
    
    -- Order Management
    status TEXT DEFAULT 'pending', -- pending, assigned, in-progress, completed, cancelled
    assigned_writer_id UUID REFERENCES profiles(id),
    
    -- Timestamps
    deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Customer Info (for admin reference)
    customer_email TEXT,
    customer_name TEXT
);

-- 3. ORDER FILES TABLE (File Uploads)
-- =====================================================
CREATE TABLE IF NOT EXISTS order_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    
    -- File Info
    filename TEXT NOT NULL,
    original_name TEXT,
    file_path TEXT NOT NULL,
    file_url TEXT,
    file_type TEXT,
    file_size INTEGER,
    
    -- Metadata
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_delivery_file BOOLEAN DEFAULT FALSE -- FALSE for customer uploads, TRUE for writer deliveries
);

-- 4. PAYMENT TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    
    -- Transaction Details
    transaction_id TEXT UNIQUE,
    payment_method TEXT, -- paypal, stripe, etc
    amount DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    status TEXT, -- pending, completed, failed, refunded
    
    -- Gateway Response
    gateway_response JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ORDER STATUS HISTORY (Track Status Changes)
-- =====================================================
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Status Change Details
    old_status TEXT,
    new_status TEXT,
    changed_by UUID REFERENCES auth.users,
    change_reason TEXT,
    notes TEXT,
    
    -- Timestamp
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ORDER COMMUNICATIONS (Messages/Notes)
-- =====================================================
CREATE TABLE IF NOT EXISTS order_communications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Message Details
    sender_id UUID REFERENCES auth.users,
    sender_type TEXT, -- admin, customer, writer
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'note', -- note, email_sent, status_update
    
    -- Visibility
    visible_to_customer BOOLEAN DEFAULT FALSE,
    visible_to_writer BOOLEAN DEFAULT FALSE,
    is_internal_note BOOLEAN DEFAULT TRUE,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. WRITER APPLICATIONS (If you have writer signup)
-- =====================================================
CREATE TABLE IF NOT EXISTS writer_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    
    -- Application Details
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    education TEXT,
    experience TEXT,
    specializations TEXT[],
    sample_work_url TEXT,
    resume_url TEXT,
    
    -- Application Status
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    reviewed_by UUID REFERENCES profiles(id),
    review_notes TEXT,
    
    -- Timestamps
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- INDEXES FOR BETTER PERFORMANCE
-- =====================================================

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_writer ON orders(assigned_writer_id);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_is_writer ON profiles(is_writer);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Payment transactions indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);

-- Order files indexes
CREATE INDEX IF NOT EXISTS idx_order_files_order_id ON order_files(order_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE writer_applications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND is_admin = TRUE
    )
);

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON orders FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND is_admin = TRUE
    )
);
CREATE POLICY "Writers can view assigned orders" ON orders FOR SELECT USING (
    auth.uid() = assigned_writer_id OR 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND is_admin = TRUE
    )
);

-- Order files policies
CREATE POLICY "Users can view own order files" ON order_files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upload to own orders" ON order_files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all order files" ON order_files FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND is_admin = TRUE
    )
);

-- Payment transactions policies
CREATE POLICY "Users can view own transactions" ON payment_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON payment_transactions FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND is_admin = TRUE
    )
);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to track order status changes
CREATE OR REPLACE FUNCTION track_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, changed_at)
        VALUES (NEW.id, OLD.status, NEW.status, auth.uid(), NOW());
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply status tracking trigger
CREATE TRIGGER track_order_status_changes 
    AFTER UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION track_order_status_change();

-- =====================================================
-- INITIAL ADMIN USER SETUP
-- =====================================================

-- Insert or update admin profile for your email
-- Replace 'your-email@example.com' with your actual admin email
INSERT INTO profiles (id, user_id, email, first_name, last_name, is_admin, is_writer)
VALUES (
    -- You'll need to get the actual UUID from auth.users table
    -- This is just a template - replace with actual user ID
    (SELECT id FROM auth.users WHERE email = 'musyokibrian@gmail.com' LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'musyokibrian@gmail.com' LIMIT 1),
    'musyokibrian@gmail.com',
    'Brian',
    'Musyoki',
    TRUE,
    FALSE
)
ON CONFLICT (id) 
DO UPDATE SET 
    is_admin = TRUE,
    updated_at = NOW();

-- Also set up backup admin email
INSERT INTO profiles (id, user_id, email, first_name, last_name, is_admin, is_writer)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'musyokibrian047@gmail.com' LIMIT 1),
    (SELECT id FROM auth.users WHERE email = 'musyokibrian047@gmail.com' LIMIT 1),
    'musyokibrian047@gmail.com',
    'Brian',
    'Musyoki',
    TRUE,
    FALSE
)
ON CONFLICT (id) 
DO UPDATE SET 
    is_admin = TRUE,
    updated_at = NOW();

-- =====================================================
-- SAMPLE DATA FOR TESTING (OPTIONAL)
-- =====================================================

-- Insert sample orders for testing (uncomment if needed)
/*
INSERT INTO orders (user_id, topic, subject, description, paper_type, academic_level, pages, price, status, payment_status, customer_email, created_at)
VALUES 
    (
        (SELECT id FROM auth.users WHERE email = 'test@example.com' LIMIT 1),
        'Business Analysis of Netflix Strategy',
        'Business Studies',
        'Comprehensive analysis of Netflix business model and competitive strategy',
        'Research Paper',
        'Masters',
        10,
        150.00,
        'pending',
        'pending',
        'test@example.com',
        NOW() - INTERVAL '2 days'
    ),
    (
        (SELECT id FROM auth.users WHERE email = 'test2@example.com' LIMIT 1),
        'Climate Change Impact on Agriculture',
        'Environmental Science',
        'Research paper on how climate change affects agricultural productivity',
        'Essay',
        'Bachelor',
        8,
        120.00,
        'in-progress',
        'paid',
        'test2@example.com',
        NOW() - INTERVAL '1 day'
    );
*/

-- =====================================================
-- STORAGE BUCKET FOR FILE UPLOADS (Run in Supabase)
-- =====================================================

-- Create storage bucket for order files
-- Run this in Supabase SQL Editor or via dashboard
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'order-files',
    'order-files',
    false,
    10485760, -- 10MB limit
    ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/png']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for order files
CREATE POLICY "Users can upload order files" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'order-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own order files" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'order-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all order files" 
ON storage.objects FOR ALL 
USING (
    bucket_id = 'order-files' AND 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND is_admin = TRUE
    )
);

-- =====================================================
-- VIEWS FOR ADMIN DASHBOARD
-- =====================================================

-- Admin dashboard summary view
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
    -- Order statistics
    COUNT(*) as total_orders,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
    COUNT(*) FILTER (WHERE status = 'in-progress') as in_progress_orders,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_orders,
    COUNT(*) FILTER (WHERE payment_status = 'paid') as paid_orders,
    
    -- Revenue statistics
    SUM(price) as total_revenue,
    SUM(price) FILTER (WHERE payment_status = 'paid') as confirmed_revenue,
    AVG(price) as average_order_value,
    
    -- Time statistics
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as orders_this_week,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as orders_this_month
FROM orders;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Create a completion log
DO $$
BEGIN
    RAISE NOTICE 'Admin database setup completed successfully!';
    RAISE NOTICE 'Tables created: profiles, orders, order_files, payment_transactions, order_status_history, order_communications, writer_applications';
    RAISE NOTICE 'Security policies applied';
    RAISE NOTICE 'Triggers and functions created';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Verify admin user setup';
    RAISE NOTICE '2. Test order creation';
    RAISE NOTICE '3. Configure storage bucket in Supabase dashboard';
END $$;