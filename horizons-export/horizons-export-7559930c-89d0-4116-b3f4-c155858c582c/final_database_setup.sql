-- Final Database Setup - Handles enum types correctly
-- Run this in your Supabase SQL Editor

-- Step 1: Check current table structure and enum values
SELECT 'Current orders table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'orders' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Check what enum values are allowed for order_status
SELECT 'Available order_status enum values:' as info;
SELECT enumlabel as status_values
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid FROM pg_type WHERE typname = 'order_status'
)
ORDER BY enumsortorder;

-- Step 3: Show current data sample
SELECT 'Current orders data sample:' as info;
SELECT * FROM public.orders LIMIT 2;

-- Step 4: Add missing columns safely
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'topic') THEN
        ALTER TABLE public.orders ADD COLUMN topic text;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'title') THEN
            UPDATE public.orders SET topic = title WHERE title IS NOT NULL;
        END IF;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'subject') THEN
        ALTER TABLE public.orders ADD COLUMN subject text;
    END IF;
END $$;

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

-- Step 5: Set up admin access policies
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;

CREATE POLICY "Admins can view all orders" ON public.orders
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.profiles WHERE is_admin = true
        )
    );

CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

-- Step 6: Ensure admin status
UPDATE public.profiles 
SET is_admin = true, updated_at = NOW()
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('musyokibrian047@gmail.com', 'musyokibrian@gmail.com')
);

-- Step 7: Add sample orders with proper enum casting
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
    sample_data.topic,
    sample_data.subject,
    sample_data.level,
    sample_data.paper_type,
    sample_data.pages,
    sample_data.price,
    NOW() + sample_data.deadline_days * interval '1 day',
    sample_data.instructions,
    sample_data.status::order_status,  -- Cast to enum type
    NOW() - sample_data.created_days_ago * interval '1 day',
    NOW()
FROM auth.users u
CROSS JOIN (VALUES 
    ('Social Media Impact Analysis', 'Communication Studies', 'University', 'Research Essay', 5, 75.00, 'Analyze how social media platforms have changed interpersonal communication.', 'pending', 7, 2),
    ('Climate Change Economics', 'Environmental Economics', 'Graduate', 'Research Paper', 8, 120.00, 'Examine economic implications of climate change policies.', 'in_progress', 12, 4),
    ('AI in Healthcare', 'Computer Science', 'University', 'Case Study', 6, 90.00, 'Analyze current AI applications in healthcare systems.', 'completed', 2, 15),
    ('Shakespeare Modern Influence', 'English Literature', 'College', 'Literary Analysis', 4, 60.00, 'Explore Shakespearean themes in contemporary writing.', 'assigned', 8, 1),
    ('Digital Marketing Strategy', 'Business Marketing', 'University', 'Business Report', 7, 105.00, 'Compare traditional vs digital marketing approaches.', 'pending', 10, 3)
) sample_data(topic, subject, level, paper_type, pages, price, instructions, status, deadline_days, created_days_ago)
WHERE u.email IN ('musyokibrian047@gmail.com', 'musyokibrian@gmail.com')
AND (SELECT COUNT(*) FROM public.orders WHERE topic IS NOT NULL AND LENGTH(topic) > 10) < 3
LIMIT 5;

-- Step 8: Add sample writers
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
    ('Emily', 'Chen', 'emily.writer@example.com', 'Academic writing specialist with expertise in social sciences and business.', 4.9, 52),
    ('Marcus', 'Rodriguez', 'marcus.writer@example.com', 'STEM and technical writing expert with 6+ years experience.', 4.7, 38),
    ('Rachel', 'Thompson', 'rachel.writer@example.com', 'Literature and humanities writer with advanced degrees.', 4.8, 44)
) writers(first_name, last_name, email, bio, rating, orders_completed)
WHERE (SELECT COUNT(*) FROM public.profiles WHERE is_writer = true) < 2
LIMIT 3;

-- Step 9: Final verification
SELECT '=== DATABASE SETUP COMPLETE ===' as result;

-- Admin verification
SELECT 'Admin Status Check:' as info;
SELECT 
    u.email,
    p.is_admin,
    CASE WHEN p.is_admin THEN '✅ ADMIN ACCESS GRANTED' ELSE '❌ NOT ADMIN' END as status
FROM auth.users u
JOIN public.profiles p ON p.user_id = u.id
WHERE u.email IN ('musyokibrian047@gmail.com', 'musyokibrian@gmail.com');

-- Orders summary
SELECT 'Orders Summary:' as info;
SELECT 
    COUNT(*) as total_orders,
    COUNT(CASE WHEN topic IS NOT NULL AND LENGTH(topic) > 5 THEN 1 END) as orders_with_topics,
    SUM(CASE WHEN price IS NOT NULL THEN price ELSE 0 END) as total_revenue
FROM public.orders;

-- Status breakdown
SELECT 'Order Status Breakdown:' as info;
SELECT 
    status::text as order_status,
    COUNT(*) as count
FROM public.orders 
GROUP BY status
ORDER BY count DESC;

-- Writers summary  
SELECT 'Writers Summary:' as info;
SELECT 
    COUNT(*) as total_writers, 
    ROUND(AVG(rating), 2) as avg_rating
FROM public.profiles 
WHERE is_writer = true;

-- Sample orders preview
SELECT 'Orders for Admin Panel:' as info;
SELECT 
    LEFT(COALESCE(topic, 'Untitled'), 30) || '...' as title,
    COALESCE(subject, 'No Subject') as subject,
    COALESCE(pages, 0) as pages,
    COALESCE(price, 0) as price,
    status::text as status,
    created_at::date as created
FROM public.orders 
ORDER BY created_at DESC
LIMIT 5;

SELECT '🎉 SETUP SUCCESSFUL! Your admin panel should now show GREEN status!' as final_message;