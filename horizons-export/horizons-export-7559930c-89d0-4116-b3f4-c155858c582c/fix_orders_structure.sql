-- Fix orders table structure for the simplified order system
-- Run this in your Supabase SQL Editor

-- Step 1: Check current structure
SELECT 'Current orders table columns:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Add missing columns that are actually needed
-- Add subject column if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'subject'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN subject text;
    END IF;
END $$;

-- Add payment_status column if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN payment_status text DEFAULT 'unpaid';
    END IF;
END $$;

-- Add payment_id column if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'payment_id'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN payment_id text;
    END IF;
END $$;

-- Add paid_at column if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'paid_at'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN paid_at timestamp with time zone;
    END IF;
END $$;

-- Step 3: Create storage bucket for order attachments if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('order_attachments', 'order_attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Step 4: Set up storage policies for order attachments
-- Allow authenticated users to upload to their own order folders
CREATE POLICY "Users can upload order attachments" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
    bucket_id = 'order_attachments' AND
    (storage.foldername(name))[1] IN (
        SELECT id::text FROM public.orders WHERE user_id = auth.uid()
    )
);

-- Allow users to view their own attachments
CREATE POLICY "Users can view own attachments" ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'order_attachments' AND
    (storage.foldername(name))[1] IN (
        SELECT id::text FROM public.orders WHERE user_id = auth.uid()
    )
);

-- Allow admins to view all attachments
CREATE POLICY "Admins can view all attachments" ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'order_attachments' AND
    auth.uid() IN (
        SELECT user_id FROM public.profiles WHERE is_admin = true
    )
);

-- Step 5: Ensure RLS is properly set for orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;

-- Users can create their own orders
CREATE POLICY "Users can create own orders" ON public.orders
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON public.orders
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own pending orders
CREATE POLICY "Users can update own orders" ON public.orders
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON public.orders
FOR SELECT 
TO authenticated
USING (
    auth.uid() IN (
        SELECT user_id FROM public.profiles WHERE is_admin = true
    )
);

-- Admins can update all orders
CREATE POLICY "Admins can update all orders" ON public.orders
FOR UPDATE 
TO authenticated
USING (
    auth.uid() IN (
        SELECT user_id FROM public.profiles WHERE is_admin = true
    )
)
WITH CHECK (
    auth.uid() IN (
        SELECT user_id FROM public.profiles WHERE is_admin = true
    )
);

-- Step 6: Verify the structure
SELECT 'Final orders table structure:' as info;
SELECT 
    column_name, 
    data_type,
    CASE 
        WHEN is_nullable = 'NO' THEN 'Required'
        ELSE 'Optional'
    END as requirement
FROM information_schema.columns 
WHERE table_name = 'orders' AND table_schema = 'public'
ORDER BY 
    CASE 
        WHEN column_name IN ('id', 'user_id', 'title', 'status') THEN 1
        WHEN column_name IN ('description', 'subject', 'paper_category') THEN 2
        WHEN column_name IN ('word_count', 'pages', 'price') THEN 3
        WHEN column_name IN ('deadline', 'urgency_hours') THEN 4
        WHEN column_name IN ('payment_status', 'payment_id', 'paid_at') THEN 5
        ELSE 6
    END,
    column_name;

-- Step 7: Show storage bucket status
SELECT 'Storage bucket status:' as info;
SELECT 
    id as bucket_name, 
    CASE WHEN public THEN 'Public' ELSE 'Private' END as access_type,
    created_at::date as created_date
FROM storage.buckets 
WHERE id = 'order_attachments';

-- Done!
SELECT '✅ Orders table structure has been updated for the new order system!' as status;