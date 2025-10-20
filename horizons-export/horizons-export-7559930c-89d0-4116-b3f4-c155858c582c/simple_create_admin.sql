-- Simple Direct Admin Profile Creation
-- Replace 'your-email@example.com' with your actual email address

-- Step 1: Check what users exist
SELECT 'Users in auth.users:' as info;
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- Step 2: Create admin profile directly (Method 1 - Recommended)
-- Replace 'your-email@example.com' with your actual email
INSERT INTO public.profiles (
    user_id,
    email,
    first_name,
    last_name,
    is_admin,
    is_active,
    created_at,
    updated_at
) 
SELECT 
    u.id,
    u.email,
    'Admin',  -- You can change this
    'User',   -- You can change this
    true,     -- This makes them admin
    true,
    NOW(),
    NOW()
FROM auth.users u 
WHERE u.email = 'your-email@example.com'  -- REPLACE THIS WITH YOUR EMAIL
AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
);

-- Step 3: Verify the admin was created
SELECT 'Admin profiles created:' as info;
SELECT p.id, p.user_id, u.email, p.first_name, p.last_name, p.is_admin, p.created_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE p.is_admin = true;

-- Step 4: Count total profiles to confirm
SELECT 'Total profiles:' as info, COUNT(*) as count FROM public.profiles;