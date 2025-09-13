# Enhanced Maestro Essays - Deployment Guide

This guide will help you deploy your enhanced academic writing service application with the new database schema, improved features, and comprehensive relationships.

## 📋 Prerequisites

Before deploying, ensure you have:

- **Supabase Project**: Set up and configured
- **Node.js**: Version 18.x or higher
- **Git**: For version control
- **Domain**: For production deployment (optional)
- **PayPal Business Account**: For payment processing

## 🗄️ Database Migration

### Step 1: Apply Enhanced Database Schema

1. **Access your Supabase Dashboard**
   ```bash
   # Visit: https://app.supabase.com
   # Navigate to: Your Project → SQL Editor
   ```

2. **Run the Migration Script**
   - Copy the contents of `database/enhanced_schema.sql`
   - Execute in Supabase SQL Editor
   - This will create all new tables, relationships, and functions

3. **Verify Migration**
   ```sql
   -- Check if all tables exist
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN (
     'subjects', 'writer_expertise', 'order_attachments', 
     'order_messages', 'payment_transactions', 'order_reviews',
     'notifications', 'order_revisions'
   );
   ```

### Step 2: Update Row Level Security (RLS)

Ensure RLS policies are properly applied:

```sql
-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

### Step 3: Create Storage Buckets

Set up file storage for order attachments:

```sql
-- Create storage bucket for order attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('order_attachments', 'order_attachments', false);

-- Set up storage policies
CREATE POLICY "Users can upload their order files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'order_attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their order files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'order_attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## 🔧 Environment Configuration

### Step 1: Update Environment Variables

Create or update your `.env` file:

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

# Feature Flags (optional)
VITE_ENABLE_MESSAGING=true
VITE_ENABLE_REVIEWS=true
VITE_ENABLE_NOTIFICATIONS=true
```

### Step 2: Update Supabase Client Configuration

Ensure your `src/lib/customSupabaseClient.js` is updated:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## 🚀 Deployment Options

### Option 1: Deploy to Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Build and Deploy**
   ```bash
   # Install dependencies
   npm install
   
   # Build the project
   npm run build
   
   # Deploy to Vercel
   vercel
   ```

3. **Configure Environment Variables in Vercel**
   - Visit your Vercel dashboard
   - Navigate to Project Settings → Environment Variables
   - Add all environment variables from your `.env` file

### Option 2: Deploy to Netlify

1. **Build the Project**
   ```bash
   npm install
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Deploy
   netlify deploy --prod --dir=dist
   ```

3. **Configure Build Settings**
   ```toml
   # netlify.toml
   [build]
     publish = "dist"
     command = "npm run build"
   
   [build.environment]
     NODE_VERSION = "18"
   ```

### Option 3: Deploy to AWS S3 + CloudFront

1. **Build the Project**
   ```bash
   npm run build
   ```

2. **Upload to S3**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. **Configure CloudFront Distribution**
   - Set up CloudFront distribution
   - Configure custom error pages for SPA routing

## 📱 Mobile Responsiveness

The enhanced application includes improved mobile responsiveness. Test on various devices:

```bash
# Test locally with different viewport sizes
npm run dev

# Use browser dev tools to simulate:
# - iPhone SE (375x667)
# - iPad (768x1024)
# - Desktop (1920x1080)
```

## 🔐 Security Considerations

### Database Security

1. **Review RLS Policies**
   ```sql
   -- Verify all tables have appropriate RLS policies
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
   FROM pg_policies 
   WHERE schemaname = 'public';
   ```

2. **API Rate Limiting**
   - Configure Supabase rate limiting
   - Set up proper authentication flows

3. **Environment Variables**
   - Never commit `.env` files to version control
   - Use secure environment variable management

### File Upload Security

1. **File Type Validation**
   ```javascript
   const allowedTypes = ['application/pdf', 'application/msword', 'text/plain'];
   const maxFileSize = 10 * 1024 * 1024; // 10MB
   ```

2. **Storage Policies**
   ```sql
   -- Restrict file uploads by size and type
   CREATE POLICY "Restrict file uploads" ON storage.objects
   FOR INSERT WITH CHECK (
     bucket_id = 'order_attachments' 
     AND octet_length(decode(encode(metadata, 'escape'), 'escape')) < 10485760
   );
   ```

## 📊 Monitoring and Analytics

### Performance Monitoring

1. **Set up Supabase Analytics**
   - Enable database analytics in Supabase dashboard
   - Monitor query performance and usage

2. **Application Monitoring**
   ```javascript
   // Add error tracking (optional)
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: "your-sentry-dsn",
     environment: process.env.NODE_ENV,
   });
   ```

### Database Monitoring

1. **Query Performance**
   ```sql
   -- Monitor slow queries
   SELECT query, calls, total_time, mean_time
   FROM pg_stat_statements
   ORDER BY mean_time DESC
   LIMIT 10;
   ```

2. **Index Optimization**
   ```sql
   -- Check index usage
   SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
   FROM pg_stat_user_indexes
   ORDER BY idx_scan DESC;
   ```

## 🧪 Testing Before Deployment

### Functional Testing Checklist

- [ ] User registration and login
- [ ] Order creation with file uploads
- [ ] Payment processing (test mode)
- [ ] Order status updates
- [ ] Writer assignment
- [ ] Message system
- [ ] Review system
- [ ] Admin dashboard functionality
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

### Database Testing

```bash
# Test database connections
npm run test:db

# Verify data integrity
npm run test:schema
```

## 🚦 Go-Live Checklist

### Pre-Launch

- [ ] Database schema migrated successfully
- [ ] All environment variables configured
- [ ] SSL certificate installed
- [ ] PayPal configured for production
- [ ] File upload storage configured
- [ ] Email notifications set up
- [ ] Admin users created
- [ ] Content management system ready

### Launch

- [ ] Deploy to production environment
- [ ] Update DNS settings (if applicable)
- [ ] Test payment processing in production
- [ ] Verify email deliverability
- [ ] Check file upload functionality
- [ ] Test admin dashboard access

### Post-Launch

- [ ] Monitor application performance
- [ ] Check error logs
- [ ] Verify database performance
- [ ] Test backup and recovery procedures
- [ ] Set up monitoring alerts

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## 📞 Support and Maintenance

### Regular Maintenance Tasks

1. **Database Maintenance**
   ```sql
   -- Run weekly
   VACUUM ANALYZE;
   REINDEX DATABASE your_database_name;
   ```

2. **Log Monitoring**
   - Check Supabase logs regularly
   - Monitor application error rates
   - Review performance metrics

3. **Backup Verification**
   - Test database backups monthly
   - Verify file storage backups
   - Document recovery procedures

### Troubleshooting Common Issues

1. **Database Connection Issues**
   ```bash
   # Check Supabase status
   curl -I https://your-project-id.supabase.co/rest/v1/
   ```

2. **File Upload Issues**
   ```javascript
   // Debug storage permissions
   const { error } = await supabase.storage
     .from('order_attachments')
     .list();
   console.log('Storage error:', error);
   ```

3. **Performance Issues**
   ```sql
   -- Identify slow queries
   SELECT query, calls, total_time, mean_time
   FROM pg_stat_statements
   WHERE mean_time > 1000
   ORDER BY mean_time DESC;
   ```

## 📋 Migration from Existing System

If migrating from your current system:

1. **Data Export**
   ```bash
   # Export existing orders
   npm run export:orders
   
   # Export user profiles
   npm run export:profiles
   ```

2. **Data Transformation**
   ```javascript
   // Transform data to new schema format
   const transformOrder = (oldOrder) => ({
     id: oldOrder.id,
     topic: oldOrder.topic,
     // ... map other fields
     paper_category: mapPaperType(oldOrder.work_type),
     word_count: oldOrder.word_count || 275,
     // ... additional mappings
   });
   ```

3. **Data Import**
   ```bash
   # Import to new database
   npm run import:data
   ```

## 🎯 Performance Optimization

### Frontend Optimizations

1. **Code Splitting**
   ```javascript
   // Lazy load components
   const AdminPage = lazy(() => import('./pages/AdminPage'));
   const OrderPage = lazy(() => import('./pages/OrderPage'));
   ```

2. **Image Optimization**
   ```javascript
   // Use WebP format for images
   // Implement lazy loading for images
   ```

### Database Optimizations

1. **Query Optimization**
   ```sql
   -- Add composite indexes for common queries
   CREATE INDEX idx_orders_user_status ON orders(user_id, status);
   CREATE INDEX idx_orders_deadline ON orders(deadline) WHERE status IN ('pending', 'assigned');
   ```

2. **Connection Pooling**
   - Configure appropriate connection pool size in Supabase
   - Monitor connection usage

## 📈 Scaling Considerations

### Horizontal Scaling

1. **Database Scaling**
   - Monitor database performance metrics
   - Consider read replicas for high-traffic scenarios
   - Implement connection pooling

2. **File Storage Scaling**
   - Set up CDN for file delivery
   - Implement file compression
   - Consider multiple storage regions

3. **Application Scaling**
   - Use serverless functions for heavy operations
   - Implement caching strategies
   - Consider microservices architecture for future growth

---

## 🆘 Getting Help

If you encounter issues during deployment:

1. **Check the logs**
   - Supabase dashboard logs
   - Browser developer console
   - Build/deployment logs

2. **Common Solutions**
   - Clear browser cache
   - Verify environment variables
   - Check network connectivity
   - Validate database permissions

3. **Contact Support**
   - Supabase community forums
   - Vercel/Netlify support (deployment platforms)
   - Project documentation and README files

---

**Good luck with your deployment!** 🚀

The enhanced Maestro Essays application now includes comprehensive order management, real-time messaging, review systems, payment tracking, and advanced admin capabilities. The improved database schema provides better relationships and scalability for future growth.