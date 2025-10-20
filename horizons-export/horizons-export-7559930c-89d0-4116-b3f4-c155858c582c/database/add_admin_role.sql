-- Add admin role functionality to the profiles table
-- This migration adds an is_admin column to support proper admin access

-- Add is_admin column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Create an index for better performance on admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);

-- Create a function to make the first admin user
-- This will be useful for setting up the initial admin account
CREATE OR REPLACE FUNCTION make_admin(admin_email text)
RETURNS boolean AS $$
BEGIN
  UPDATE public.profiles 
  SET is_admin = true, updated_at = NOW()
  WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = admin_email
  );
  
  -- Return true if any rows were updated
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example usage (uncomment and modify email as needed):
-- SELECT make_admin('admin@maestroessays.com');

-- Update RLS policies to allow admins to view all data
-- Admin users can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    is_active = true OR 
    auth.uid() IN (SELECT user_id FROM public.profiles WHERE is_admin = true)
  );

-- Admin users can view all orders
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (
    auth.uid() = orders.user_id OR 
    auth.uid() IN (SELECT p.user_id FROM public.profiles p WHERE p.id = orders.writer_id) OR
    auth.uid() IN (SELECT user_id FROM public.profiles WHERE is_admin = true)
  );

-- Admin users can update all orders
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
CREATE POLICY "Admins can update all orders" ON public.orders
  FOR UPDATE USING (
    auth.uid() = orders.user_id OR 
    auth.uid() IN (SELECT p.user_id FROM public.profiles p WHERE p.id = orders.writer_id) OR
    auth.uid() IN (SELECT user_id FROM public.profiles WHERE is_admin = true)
  );