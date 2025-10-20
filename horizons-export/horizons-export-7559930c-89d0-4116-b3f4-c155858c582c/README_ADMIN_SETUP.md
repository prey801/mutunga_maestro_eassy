# Admin Dashboard Database Setup

## 📋 Quick Setup Instructions

### 1. Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the sidebar
3. Create a new query

### 2. Run the Setup Script
1. Copy the contents of `admin_database_setup.sql`
2. Paste it into the SQL Editor
3. Click **"Run"** to execute all commands

### 3. Verify Setup
Run this query to check if everything was created:
```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'orders', 'order_files', 'payment_transactions', 'order_status_history', 'order_communications', 'writer_applications');

-- Check admin users
SELECT email, is_admin, is_writer FROM profiles WHERE is_admin = TRUE;
```

## 🗄️ Database Structure

### Core Tables Created:

1. **`profiles`** - User management (customers, writers, admins)
2. **`orders`** - Main orders with all details
3. **`order_files`** - File uploads for orders
4. **`payment_transactions`** - PayPal/payment tracking
5. **`order_status_history`** - Track status changes
6. **`order_communications`** - Internal notes and messages
7. **`writer_applications`** - Writer signup management

### Key Features:

✅ **Row Level Security (RLS)** - Secure data access  
✅ **Automatic Timestamps** - Track created/updated dates  
✅ **Status History Tracking** - Audit trail for changes  
✅ **File Upload Support** - Storage bucket integration  
✅ **Admin Access Control** - Proper permission system  

## 🔧 Quick Admin Actions

### Make Someone Admin:
```sql
UPDATE profiles 
SET is_admin = TRUE 
WHERE email = 'admin@example.com';
```

### Check Order Status:
```sql
SELECT id, topic, status, payment_status, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;
```

### Update Order Status:
```sql
UPDATE orders 
SET status = 'completed' 
WHERE id = 'order-uuid-here';
```

### Update Payment Status:
```sql
UPDATE orders 
SET payment_status = 'paid', paid_at = NOW() 
WHERE id = 'order-uuid-here';
```

## 📊 Admin Dashboard Queries

### Get Dashboard Stats:
```sql
SELECT * FROM admin_dashboard_stats;
```

### Recent Orders:
```sql
SELECT 
    id,
    topic,
    customer_email,
    price,
    status,
    payment_status,
    created_at
FROM orders 
ORDER BY created_at DESC 
LIMIT 20;
```

### Orders by Status:
```sql
SELECT 
    status,
    COUNT(*) as count,
    SUM(price) as total_value
FROM orders 
GROUP BY status;
```

## 🔒 Security Notes

- **RLS Enabled**: All tables have Row Level Security
- **Admin Only**: Admin functions require `is_admin = TRUE`
- **User Data Protected**: Users can only see their own data
- **File Security**: Upload permissions properly configured

## 🚀 Next Steps

1. **Run the SQL setup** - Execute `admin_database_setup.sql`
2. **Verify admin access** - Check if your email is set as admin
3. **Test order creation** - Create a test order to verify functionality
4. **Configure file uploads** - Ensure storage bucket is working
5. **Update admin panel** - Connect the quick actions to database updates

## 🆘 Troubleshooting

### If tables don't exist:
- Check if the SQL ran without errors
- Verify you have proper permissions in Supabase

### If admin access doesn't work:
- Run: `SELECT * FROM profiles WHERE email = 'your-email@domain.com'`
- If missing, the user might not have signed up yet

### If file uploads fail:
- Check storage bucket exists in Supabase Storage
- Verify storage policies are applied

## 📝 Important Notes

- Replace `musyokibrian@gmail.com` with your actual admin email in the SQL
- The script sets up your specified emails as admin users automatically
- All sensitive operations require confirmation dialogs
- Database updates are tracked in the `order_status_history` table