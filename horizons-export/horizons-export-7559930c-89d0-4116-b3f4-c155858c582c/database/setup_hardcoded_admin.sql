-- Setup Hardcoded Admin Account
-- Run this in your Supabase SQL Editor

-- First, let's check if the user exists
SELECT 'Checking for admin user:' as info;
SELECT id, email, created_at, email_confirmed_at 
FROM auth.users 
WHERE email = 'musyokibrian@gmail.com';

-- Check if profile exists for this user
SELECT 'Checking for admin profile:' as info;
SELECT p.id, p.user_id, p.email, p.is_admin, p.first_name, p.last_name
FROM public.profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'musyokibrian@gmail.com';

-- If profile exists but is not admin, make them admin
UPDATE public.profiles 
SET is_admin = true, updated_at = NOW()
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'musyokibrian@gmail.com'
)
AND is_admin = false;

-- Create basic orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    writer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    topic text NOT NULL,
    subject text,
    academic_level text,
    paper_type text,
    pages integer DEFAULT 1,
    price decimal(10,2),
    deadline timestamp with time zone NOT NULL,
    instructions text,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in-progress', 'completed', 'cancelled')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Add some sample orders for testing (only if no orders exist)
INSERT INTO public.orders (
    user_id,
    topic,
    subject,
    academic_level,
    paper_type,
    pages,
    price,
    deadline,
    instructions,
    status
)
SELECT 
    u.id,
    'Sample Essay: The Future of Technology',
    'Computer Science',
    'University',
    'Essay',
    5,
    75.00,
    NOW() + interval '7 days',
    'This is a sample order to test the admin panel.',
    'pending'
FROM auth.users u
WHERE u.email = 'musyokibrian@gmail.com'
AND NOT EXISTS (SELECT 1 FROM public.orders);

-- Add a few more sample orders with different statuses
INSERT INTO public.orders (
    user_id,
    topic,
    subject,
    academic_level,
    paper_type,
    pages,
    price,
    deadline,
    instructions,
    status
)
SELECT 
    u.id,
    topics.title,
    topics.subject,
    topics.level,
    topics.type,
    topics.pages,
    topics.price,
    NOW() + (random() * interval '20 days'),
    'Sample order for admin panel testing.',
    topics.status
FROM auth.users u
CROSS JOIN (VALUES 
    ('Business Strategy Analysis', 'Business', 'Graduate', 'Research Paper', 8, 120.00, 'assigned'),
    ('Environmental Impact Study', 'Environmental Science', 'University', 'Case Study', 6, 90.00, 'in-progress'),
    ('Literature Review: Modern Poetry', 'English Literature', 'College', 'Essay', 4, 60.00, 'completed'),
    ('Marketing Campaign Analysis', 'Marketing', 'University', 'Report', 7, 105.00, 'pending')
) topics(title, subject, level, type, pages, price, status)
WHERE u.email = 'musyokibrian@gmail.com'
AND (SELECT COUNT(*) FROM public.orders) < 5;

-- Create some sample writer profiles
INSERT INTO public.profiles (
    user_id,
    first_name,
    last_name,
    email,
    is_writer,
    is_active,
    bio,
    rating,
    total_orders_completed
)
SELECT 
    gen_random_uuid(),
    writers.first_name,
    writers.last_name,
    writers.email,
    true,
    true,
    writers.bio,
    writers.rating,
    writers.orders_completed
FROM (VALUES 
    ('Alice', 'Johnson', 'alice.writer@test.com', 'Expert academic writer with 5+ years experience in business and economics.', 4.9, 45),
    ('Bob', 'Smith', 'bob.writer@test.com', 'Specialized in STEM subjects, particularly computer science and engineering.', 4.7, 32),
    ('Carol', 'Davis', 'carol.writer@test.com', 'Literature and humanities specialist with PhD in English Literature.', 4.8, 38)
) writers(first_name, last_name, email, bio, rating, orders_completed)
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE is_writer = true)
LIMIT 3;

-- Verify everything is set up
SELECT 'Final verification:' as info;
SELECT 
    'Admin User' as type,
    u.email,
    p.is_admin,
    p.first_name || ' ' || p.last_name as name
FROM auth.users u
JOIN public.profiles p ON p.user_id = u.id
WHERE u.email = 'musyokibrian@gmail.com'
UNION ALL
SELECT 
    'Sample Orders' as type,
    COUNT(*)::text as email,
    NULL as is_admin,
    'orders total' as name
FROM public.orders
UNION ALL
SELECT 
    'Writers' as type,
    COUNT(*)::text as email,
    NULL as is_admin,
    'writers total' as name
FROM public.profiles
WHERE is_writer = true;