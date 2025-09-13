-- Migration Utility for Maestro Essays Database
-- This script helps migrate from old schema to new schema structure

-- First, let's safely migrate existing profiles data if the table structure is different
DO $$
BEGIN
  -- Check if the old full_name column exists and migrate to first_name/last_name
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'full_name'
    AND table_schema = 'public'
  ) THEN
    
    -- Split full_name into first_name and last_name
    UPDATE public.profiles 
    SET 
      first_name = CASE 
        WHEN full_name IS NOT NULL AND full_name != '' THEN
          TRIM(SPLIT_PART(full_name, ' ', 1))
        ELSE first_name
      END,
      last_name = CASE 
        WHEN full_name IS NOT NULL AND full_name != '' AND ARRAY_LENGTH(STRING_TO_ARRAY(full_name, ' '), 1) > 1 THEN
          TRIM(ARRAY_TO_STRING(ARRAY_SLICE(STRING_TO_ARRAY(full_name, ' '), 2, NULL), ' '))
        ELSE last_name
      END,
      updated_at = NOW()
    WHERE full_name IS NOT NULL AND full_name != ''
    AND (first_name IS NULL OR last_name IS NULL);
    
    RAISE NOTICE 'Migrated full_name data to first_name and last_name fields';
    
    -- Optionally drop the old full_name column (uncomment if you want to remove it)
    -- ALTER TABLE public.profiles DROP COLUMN IF EXISTS full_name;
  END IF;
  
  -- Check if user_id column exists in profiles, if not, this might be a fresh install
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'user_id'
    AND table_schema = 'public'
  ) THEN
    RAISE NOTICE 'This appears to be a fresh installation. No migration needed for profiles.';
  END IF;
END $$;

-- Migrate existing orders data if needed
DO $$
BEGIN
  -- Check if old topic column exists and migrate to title
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' 
    AND column_name = 'topic'
    AND table_schema = 'public'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' 
    AND column_name = 'title'
    AND table_schema = 'public'
  ) THEN
    
    -- Add title column and migrate data
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS title text;
    UPDATE public.orders SET title = topic WHERE title IS NULL AND topic IS NOT NULL;
    ALTER TABLE public.orders ALTER COLUMN title SET NOT NULL;
    
    RAISE NOTICE 'Migrated topic column to title column in orders table';
  END IF;
  
  -- Check if instructions column exists and migrate to description
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' 
    AND column_name = 'instructions'
    AND table_schema = 'public'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' 
    AND column_name = 'description'
    AND table_schema = 'public'
  ) THEN
    
    -- Add description column and migrate data
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS description text;
    UPDATE public.orders SET description = COALESCE(instructions, 'No description provided') WHERE description IS NULL;
    ALTER TABLE public.orders ALTER COLUMN description SET NOT NULL;
    
    RAISE NOTICE 'Migrated instructions column to description column in orders table';
  END IF;
END $$;

-- Function to ensure all users have profiles
CREATE OR REPLACE FUNCTION ensure_all_users_have_profiles()
RETURNS INTEGER AS $$
DECLARE
  user_record RECORD;
  profiles_created INTEGER := 0;
  profile_data JSONB;
BEGIN
  -- Iterate through auth.users that don't have profiles
  FOR user_record IN 
    SELECT au.id, au.email, au.user_metadata, au.created_at
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.user_id
    WHERE p.user_id IS NULL
  LOOP
    -- Extract name information from metadata or email
    profile_data := user_record.user_metadata;
    
    INSERT INTO public.profiles (
      user_id,
      first_name,
      last_name,
      email,
      is_writer,
      is_active,
      timezone,
      created_at
    ) VALUES (
      user_record.id,
      COALESCE(profile_data->>'first_name', SPLIT_PART(COALESCE(profile_data->>'full_name', user_record.email), ' ', 1)),
      NULLIF(TRIM(SUBSTRING(COALESCE(profile_data->>'full_name', '') FROM POSITION(' ' IN COALESCE(profile_data->>'full_name', '')) + 1)), ''),
      user_record.email,
      FALSE,
      TRUE,
      'UTC',
      user_record.created_at
    );
    
    profiles_created := profiles_created + 1;
  END LOOP;
  
  RETURN profiles_created;
END;
$$ LANGUAGE plpgsql;

-- Run the profile creation function
DO $$
DECLARE
  created_count INTEGER;
BEGIN
  SELECT ensure_all_users_have_profiles() INTO created_count;
  RAISE NOTICE 'Created % new profile(s) for existing users', created_count;
END $$;

-- Clean up the helper function
DROP FUNCTION IF EXISTS ensure_all_users_have_profiles();

-- Update any existing writer_expertise references to use the new profile structure
DO $$
BEGIN
  -- Check if writer_expertise table exists and has data
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'writer_expertise' 
    AND table_schema = 'public'
  ) THEN
    -- Ensure all writer_expertise records point to valid profile IDs
    DELETE FROM public.writer_expertise 
    WHERE writer_id NOT IN (SELECT id FROM public.profiles WHERE is_writer = true);
    
    RAISE NOTICE 'Cleaned up invalid writer_expertise records';
  END IF;
END $$;

-- Add indexes that might be missing from the main schema
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_first_name ON public.profiles(first_name);
CREATE INDEX IF NOT EXISTS idx_profiles_last_name ON public.profiles(last_name);
CREATE INDEX IF NOT EXISTS idx_orders_subject_id ON public.orders(subject_id);
CREATE INDEX IF NOT EXISTS idx_orders_paper_category ON public.orders(paper_category);

-- Update any NULL values in critical fields
UPDATE public.profiles 
SET timezone = 'UTC' 
WHERE timezone IS NULL;

UPDATE public.profiles 
SET is_active = true 
WHERE is_active IS NULL;

UPDATE public.profiles 
SET is_writer = false 
WHERE is_writer IS NULL;

UPDATE public.orders 
SET formatting_style = 'APA' 
WHERE formatting_style IS NULL;

UPDATE public.orders 
SET sources_required = 0 
WHERE sources_required IS NULL;

UPDATE public.orders 
SET total_revisions = 0 
WHERE total_revisions IS NULL;

-- Final verification queries
DO $$
DECLARE
  profile_count INTEGER;
  user_count INTEGER;
  order_count INTEGER;
  subject_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO profile_count FROM public.profiles;
  SELECT COUNT(*) INTO user_count FROM auth.users;
  SELECT COUNT(*) INTO order_count FROM public.orders;
  SELECT COUNT(*) INTO subject_count FROM public.subjects;
  
  RAISE NOTICE 'Migration Summary:';
  RAISE NOTICE '  Total users: %', user_count;
  RAISE NOTICE '  Total profiles: %', profile_count;
  RAISE NOTICE '  Total orders: %', order_count;
  RAISE NOTICE '  Total subjects: %', subject_count;
  
  IF profile_count < user_count THEN
    RAISE WARNING 'Some users do not have profiles! You may need to run the profile creation again.';
  END IF;
END $$;

-- Create a view for easy profile lookup with computed full_name
CREATE OR REPLACE VIEW public.profiles_with_full_name AS
SELECT 
  p.*,
  CASE 
    WHEN p.first_name IS NOT NULL AND p.last_name IS NOT NULL THEN
      p.first_name || ' ' || p.last_name
    WHEN p.first_name IS NOT NULL THEN
      p.first_name
    WHEN p.last_name IS NOT NULL THEN
      p.last_name
    ELSE
      p.email
  END as full_name
FROM public.profiles p;

RAISE NOTICE 'Database migration completed successfully!';
RAISE NOTICE 'You can now use the new database structure with confidence.';
RAISE NOTICE 'Remember to update your application code to use the new field names:';
RAISE NOTICE '  - Use first_name and last_name instead of full_name';
RAISE NOTICE '  - Use title and description instead of topic and instructions in orders';
RAISE NOTICE '  - Profiles now have user_id field referencing auth.users(id)';