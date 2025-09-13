// Test script to check if the enhanced database schema is working
import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  console.log('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseSchema() {
  console.log('🧪 Testing Enhanced Database Schema...');
  console.log('=====================================');
  
  try {
    // Test 1: Check if orders table exists with new schema
    console.log('\n1. Testing orders table structure...');
    const { data: ordersTest, error: ordersError } = await supabase
      .from('orders')
      .select('id, title, description, paper_category, word_count, pages, price, status')
      .limit(1);
    
    if (ordersError) {
      console.log('❌ Orders table test failed:', ordersError.message);
      if (ordersError.message.includes('relation "orders" does not exist')) {
        console.log('💡 Solution: Run the enhanced_schema_v2.sql in Supabase SQL Editor');
        return;
      }
    } else {
      console.log('✅ Orders table structure is correct');
    }

    // Test 2: Check if subjects table exists
    console.log('\n2. Testing subjects table...');
    const { data: subjectsTest, error: subjectsError } = await supabase
      .from('subjects')
      .select('id, name, is_active')
      .limit(1);
    
    if (subjectsError) {
      console.log('❌ Subjects table test failed:', subjectsError.message);
    } else {
      console.log('✅ Subjects table exists');
      console.log(`📊 Found ${subjectsTest?.length || 0} subjects`);
    }

    // Test 3: Check if order_attachments table exists
    console.log('\n3. Testing order_attachments table...');
    const { data: attachmentsTest, error: attachmentsError } = await supabase
      .from('order_attachments')
      .select('id, order_id, filename, file_path')
      .limit(1);
    
    if (attachmentsError) {
      console.log('❌ Order attachments table test failed:', attachmentsError.message);
    } else {
      console.log('✅ Order attachments table exists');
    }

    // Test 4: Check if payment_transactions table exists
    console.log('\n4. Testing payment_transactions table...');
    const { data: paymentsTest, error: paymentsError } = await supabase
      .from('payment_transactions')
      .select('id, order_id, transaction_id, amount, status')
      .limit(1);
    
    if (paymentsError) {
      console.log('❌ Payment transactions table test failed:', paymentsError.message);
    } else {
      console.log('✅ Payment transactions table exists');
    }

    // Test 5: Check storage bucket
    console.log('\n5. Testing storage bucket...');
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    
    if (storageError) {
      console.log('❌ Storage test failed:', storageError.message);
    } else {
      const orderAttachmentsBucket = buckets.find(b => b.name === 'order_attachments');
      if (orderAttachmentsBucket) {
        console.log('✅ Order attachments storage bucket exists');
      } else {
        console.log('⚠️  Order attachments storage bucket not found');
        console.log('💡 Create it in Supabase Dashboard > Storage');
      }
    }

    console.log('\n🎉 Database schema test completed!');
    console.log('\n📝 Next steps:');
    console.log('1. If any tables are missing, run enhanced_schema_v2.sql in Supabase');
    console.log('2. Create the order_attachments storage bucket if needed');
    console.log('3. Test order placement at http://localhost:5173/order');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDatabaseSchema();