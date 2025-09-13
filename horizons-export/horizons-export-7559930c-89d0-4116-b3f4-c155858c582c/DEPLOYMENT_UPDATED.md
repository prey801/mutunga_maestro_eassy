# Enhanced Maestro Essays - Updated Deployment Guide

This guide covers the deployment of your improved Maestro Essays application with the refined database schema and enhanced features.

## 🎯 Key Improvements in This Version

Your enhanced schema includes several important improvements:

- **Better Profile Structure**: `first_name` and `last_name` instead of `full_name`
- **Enhanced Orders Table**: `title` and `description` fields with better organization
- **Robust Foreign Keys**: Proper relationships with CASCADE and SET NULL options
- **Comprehensive RLS Policies**: Security-first approach with detailed policies
- **Safe ENUM Creation**: Uses `DO` blocks to prevent duplicate errors
- **Migration Support**: Utilities to safely transition from old schema

## 🗄️ Database Deployment Steps

### Step 1: Deploy the Enhanced Schema

1. **Access Supabase SQL Editor**
   ```bash
   # Navigate to: https://app.supabase.com
   # Select your project → SQL Editor
   ```

2. **Run the Enhanced Schema**
   - Copy contents from `database/enhanced_schema_v2.sql`
   - Execute in Supabase SQL Editor
   - This script is idempotent and safe to run multiple times

3. **Run Migration Utilities (If Upgrading)**
   - If you have existing data, run `database/migration_utility.sql`
   - This will safely migrate your existing data to the new structure

4. **Verify the Installation**
   ```sql
   -- Check all tables exist
   SELECT schemaname, tablename 
   FROM pg_tables 
   WHERE schemaname = 'public' 
   ORDER BY tablename;
   
   -- Check ENUM types
   SELECT typname 
   FROM pg_type 
   WHERE typtype = 'e' 
   ORDER BY typname;
   
   -- Verify subjects data
   SELECT COUNT(*) as subject_count FROM public.subjects;
   ```

### Step 2: Set Up Storage Bucket

```sql
-- Create storage bucket for order attachments (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('order_attachments', 'order_attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Authenticated users can upload files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'order_attachments' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can view their own files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'order_attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## 🔧 Application Configuration

### Environment Variables

Create/update your `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# PayPal Configuration
VITE_PAYPAL_CLIENT_ID=your-paypal-client-id

# Application Configuration
VITE_APP_NAME=Maestro Essays
VITE_APP_URL=https://your-domain.com
VITE_SUPPORT_EMAIL=support@maestroessays.com

# Feature Flags
VITE_ENABLE_ENHANCED_FEATURES=true
VITE_ENABLE_MESSAGING=true
VITE_ENABLE_REVIEWS=true
VITE_ENABLE_NOTIFICATIONS=true
```

### Code Updates Required

If you're upgrading from an older version, make these changes:

1. **Update Profile References**
   ```javascript
   // Old way
   profile.full_name
   
   // New way
   import { getFullName } from '@/lib/profileUtils';
   getFullName(profile)
   ```

2. **Update Order References**
   ```javascript
   // Old way
   order.topic
   order.instructions
   
   // New way
   order.title
   order.description
   ```

3. **Use Enhanced Auth Context**
   ```javascript
   // Replace old auth context
   import { useAuth } from '@/contexts/SupabaseAuthContext';
   
   // With enhanced version
   import { useAuth } from '@/contexts/EnhancedAuthContext';
   ```

## 🚀 Deployment Process

### Option 1: Vercel (Recommended)

```bash
# Install dependencies
npm install

# Build with updated code
npm run build

# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
```

### Option 2: Netlify

```bash
# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist

# Configure environment variables in Netlify UI
```

### Option 3: Manual Server Deployment

```bash
# Build the project
npm run build

# Upload dist/ folder to your web server
# Configure nginx/apache to serve the files
# Set up SSL certificate
```

## 🧪 Testing Your Deployment

### Database Testing

```sql
-- Test profile creation
SELECT * FROM public.profiles LIMIT 5;

-- Test order relationships
SELECT o.title, o.description, p.first_name, p.last_name, s.name as subject
FROM public.orders o
LEFT JOIN public.profiles p ON o.writer_id = p.id
LEFT JOIN public.subjects s ON o.subject_id = s.id
LIMIT 5;

-- Test RLS policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Application Testing

1. **User Registration/Login Flow**
   - Test new user registration
   - Verify profile creation with `first_name`/`last_name`
   - Check login and profile display

2. **Order Management**
   - Create new orders with enhanced fields
   - Test file uploads
   - Verify order status updates

3. **Enhanced Features**
   - Test messaging system
   - Check notification system
   - Verify review functionality

## 🔐 Security Verification

### RLS Policy Testing

```sql
-- Test as different user roles
SET ROLE authenticated;
SET request.jwt.claims TO '{"sub": "user-id-here", "role": "authenticated"}';

-- Test profile access
SELECT * FROM public.profiles WHERE user_id = 'user-id-here';

-- Test order access
SELECT * FROM public.orders WHERE user_id = 'user-id-here';

-- Reset role
RESET ROLE;
```

### API Security Testing

```bash
# Test API endpoints with different authentication states
curl -X GET "https://your-project.supabase.co/rest/v1/profiles" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "apikey: your-anon-key"

# Test unauthorized access (should fail)
curl -X GET "https://your-project.supabase.co/rest/v1/profiles" \
  -H "apikey: your-anon-key"
```

## 📊 Performance Monitoring

### Database Performance

```sql
-- Check index usage
SELECT 
  schemaname, 
  tablename, 
  indexname, 
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Monitor query performance
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
WHERE query LIKE '%public.%'
ORDER BY mean_time DESC
LIMIT 10;
```

### Application Monitoring

```javascript
// Add performance monitoring (optional)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
  {
    db: {
      schema: 'public',
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

// Monitor database queries
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event, session);
});
```

## 🔄 Data Migration Guide

If you're upgrading from an existing system:

### Step 1: Backup Your Data

```bash
# Backup via Supabase CLI
supabase db dump --file backup.sql

# Or via pg_dump
pg_dump your-database-url > backup.sql
```

### Step 2: Run Migration Scripts

1. **Apply Enhanced Schema**
   ```sql
   -- Run database/enhanced_schema_v2.sql
   ```

2. **Run Migration Utilities**
   ```sql
   -- Run database/migration_utility.sql
   ```

3. **Verify Migration**
   ```sql
   -- Check data integrity
   SELECT COUNT(*) FROM public.profiles;
   SELECT COUNT(*) FROM public.orders;
   
   -- Verify relationships
   SELECT 
     COUNT(*) as orders_with_profiles
   FROM public.orders o
   INNER JOIN public.profiles p ON o.user_id = (
     SELECT user_id FROM public.profiles WHERE id = o.writer_id OR user_id = o.user_id
   );
   ```

### Step 3: Update Application Code

1. **Update imports**
   ```javascript
   // Update auth context import
   import { useAuth } from '@/contexts/EnhancedAuthContext';
   
   // Add profile utilities
   import { getFullName, getInitials } from '@/lib/profileUtils';
   ```

2. **Update component usage**
   ```javascript
   // Replace profile.full_name with getFullName(profile)
   const displayName = getFullName(profile) || 'Anonymous';
   const initials = getInitials(profile);
   ```

## 🚦 Go-Live Checklist

### Pre-Launch ✅

- [ ] Enhanced database schema deployed
- [ ] Migration scripts executed successfully
- [ ] Storage buckets configured
- [ ] Environment variables set
- [ ] Code updated to use new schema
- [ ] Enhanced authentication context implemented
- [ ] Profile utilities integrated
- [ ] File upload functionality tested
- [ ] RLS policies verified
- [ ] Performance indexes created

### Launch ✅

- [ ] Application deployed to production
- [ ] DNS configured (if applicable)
- [ ] SSL certificate installed
- [ ] Payment processing tested
- [ ] Email notifications working
- [ ] File uploads working
- [ ] User registration/login working
- [ ] Order creation/management working
- [ ] Admin dashboard functional

### Post-Launch ✅

- [ ] Monitor application performance
- [ ] Check error logs
- [ ] Verify user registrations
- [ ] Test order workflows
- [ ] Monitor database performance
- [ ] Verify backup processes
- [ ] Check analytics and metrics

## 🆘 Troubleshooting Common Issues

### Database Connection Issues

```bash
# Test Supabase connection
curl -I https://your-project-id.supabase.co/rest/v1/

# Check auth status
curl -X GET https://your-project-id.supabase.co/auth/v1/settings \
  -H "apikey: your-anon-key"
```

### Profile Creation Issues

```sql
-- Check if profiles are being created
SELECT COUNT(*) FROM public.profiles;
SELECT COUNT(*) FROM auth.users;

-- Manually create missing profiles
INSERT INTO public.profiles (user_id, email, first_name, is_writer, is_active)
SELECT 
  au.id, 
  au.email, 
  SPLIT_PART(COALESCE(au.user_metadata->>'full_name', au.email), ' ', 1),
  false,
  true
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL;
```

### Order Display Issues

```javascript
// Check for proper field mapping
console.log('Order fields:', Object.keys(order));

// Verify relationships
const orderWithProfile = await supabase
  .from('orders')
  .select(`
    *,
    client:profiles!orders_user_id_fkey(first_name, last_name, email),
    writer:profiles!orders_writer_id_fkey(first_name, last_name, email)
  `)
  .eq('id', orderId)
  .single();

console.log('Order with profile:', orderWithProfile);
```

## 🎉 Success!

Your enhanced Maestro Essays application is now ready with:

- ✨ **Improved Database Schema** - Better organized and more scalable
- 🔒 **Enhanced Security** - Comprehensive RLS policies and proper relationships
- 👤 **Better Profile Management** - Separate first/last names and enhanced utilities
- 📝 **Improved Order System** - Better field organization and relationships
- 🚀 **Production Ready** - Robust error handling and migration support

The improved database schema provides a solid foundation for future enhancements while maintaining backward compatibility through utility functions and migration scripts.

---

**Need Help?** 
- Check the browser console for detailed error messages
- Review Supabase dashboard logs
- Verify environment variables are set correctly
- Ensure all migration scripts have been run successfully