-- Fix Orders Table Structure
-- Run this in your Supabase SQL Editor

-- Step 1: Check what columns exist in the orders table
SELECT 'Current orders table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'orders' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Check what data exists
SELECT 'Current orders data:' as info;
SELECT COUNT(*) as total_orders FROM public.orders;

-- Step 3: Show first few rows to see structure
SELECT 'Sample of existing orders:' as info;
SELECT * FROM public.orders LIMIT 3;

-- Step 4: Add missing columns to match expected structure
-- Add topic column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'topic') THEN
        ALTER TABLE public.orders ADD COLUMN topic text;
        UPDATE public.orders SET topic = title WHERE title IS NOT NULL;
        -- Make topic NOT NULL if it was added
        ALTER TABLE public.orders ALTER COLUMN topic SET NOT NULL;
    END IF;
END $$;

-- Add subject column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'subject') THEN
        ALTER TABLE public.orders ADD COLUMN subject text;
        UPDATE public.orders SET subject = type WHERE type IS NOT NULL;
    END IF;
END $$;

-- Add other missing columns
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'academic_level') THEN
        ALTER TABLE public.orders ADD COLUMN academic_level text;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'paper_type') THEN
        ALTER TABLE public.orders ADD COLUMN paper_type text;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'instructions') THEN
        ALTER TABLE public.orders ADD COLUMN instructions text;
    END IF;
END $$;

-- Step 5: Ensure RLS policies for admin access
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all orders
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.profiles WHERE is_admin = true
        )
    );

-- Policy: Users can view their own orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

-- Step 6: Ensure admin user is properly set up
UPDATE public.profiles 
SET is_admin = true, updated_at = NOW()
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('musyokibrian047@gmail.com', 'musyokibrian@gmail.com')
);

-- Step 7: Add some sample orders using flexible column mapping
-- First, let's see what we're working with
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
    status,
    created_at,
    updated_at
)
SELECT 
    u.id,
    sample_orders.topic,
    sample_orders.subject,
    sample_orders.level,
    sample_orders.type,
    sample_orders.pages,
    sample_orders.price,
    NOW() + sample_orders.deadline_offset,
    sample_orders.instructions,
    sample_orders.status,
    NOW() + sample_orders.created_offset,
    NOW()
FROM auth.users u
CROSS JOIN (VALUES 
    ('The Impact of Social Media on Modern Communication', 'Communication Studies', 'University', 'Essay', 5, 75.00, 'Please analyze the effects of social media platforms on interpersonal communication in the digital age.', 'pending', interval '7 days', interval '-2 days'),
    ('Climate Change and Economic Policy Analysis', 'Environmental Economics', 'Graduate', 'Research Paper', 8, 120.00, 'Examine the relationship between climate change policies and their economic implications.', 'in-progress', interval '10 days', interval '-5 days'),
    ('Artificial Intelligence in Healthcare Systems', 'Computer Science', 'University', 'Case Study', 6, 90.00, 'Analyze current AI applications in healthcare and their potential future impact.', 'completed', interval '3 days', interval '-10 days'),
    ('Shakespeare''s Influence on Modern Literature', 'English Literature', 'College', 'Literary Analysis', 4, 60.00, 'Explore how Shakespearean themes and techniques influence contemporary authors.', 'assigned', interval '5 days', interval '-1 day'),
    ('Marketing Strategies in the Digital Age', 'Business Marketing', 'University', 'Report', 7, 105.00, 'Compare traditional and digital marketing approaches in today''s business environment.', 'pending', interval '14 days', interval '-3 days')
) sample_orders(topic, subject, level, type, pages, price, instructions, status, deadline_offset, created_offset)
WHERE u.email IN ('musyokibrian047@gmail.com', 'musyokibrian@gmail.com')
AND (SELECT COUNT(*) FROM public.orders WHERE topic IS NOT NULL) < 3  -- Only if we don't have orders with topics
LIMIT 5;

-- Step 8: Create sample writers if none exist
INSERT INTO public.profiles (
    user_id,
    first_name,
    last_name,
    email,
    is_writer,
    is_active,
    bio,
    rating,
    total_orders_completed,
    created_at,
    updated_at
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
    writers.orders_completed,
    NOW(),
    NOW()
FROM (VALUES 
    ('Alice', 'Johnson', 'alice.writer@example.com', 'Experienced academic writer specializing in business and economics.', 4.9, 45),
    ('Robert', 'Smith', 'robert.writer@example.com', 'STEM subjects specialist with expertise in computer science and engineering.', 4.7, 32),
    ('Sarah', 'Davis', 'sarah.writer@example.com', 'Literature and humanities expert with PhD in English Literature.', 4.8, 38)
) writers(first_name, last_name, email, bio, rating, orders_completed)
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE is_writer = true)
LIMIT 3;

-- Step 9: Final verification
SELECT 'Final verification:' as info;

-- Check admin user
SELECT 
    'Admin User Status' as check_type,
    u.email,
    p.is_admin,
    CASE WHEN p.is_admin THEN '✅ Admin access granted' ELSE '❌ Not admin' END as status
FROM auth.users u
JOIN public.profiles p ON p.user_id = u.id
WHERE u.email IN ('musyokibrian047@gmail.com', 'musyokibrian@gmail.com');

-- Check orders
SELECT 
    'Orders Data' as check_type,
    COUNT(*) as total_orders,
    COUNT(CASE WHEN topic IS NOT NULL THEN 1 END) as orders_with_topics,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders
FROM public.orders;

-- Check writers
SELECT 
    'Writers Data' as check_type,
    COUNT(*) as total_writers,
    ROUND(AVG(rating), 2) as avg_rating
FROM public.profiles WHERE is_writer = true;

-- Show sample data
SELECT 'Sample orders for admin panel:' as info;
SELECT 
    LEFT(topic, 40) as topic_preview,
    subject,
    pages,
    price,
    status,
    created_at::date as created_date
FROM public.orders 
WHERE topic IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;