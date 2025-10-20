// Test script to verify Supabase connection and data fetching
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Testing Supabase Connection...\n');
console.log('URL:', supabaseUrl ? '✅ Found' : '❌ Missing');
console.log('Anon Key:', supabaseAnonKey ? '✅ Found' : '❌ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\n❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('\n📊 Testing Database Connection...');
  
  try {
    // Test 1: Check if we can query profiles table
    console.log('\n1️⃣ Testing profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, is_admin')
      .limit(5);
    
    if (profilesError) {
      console.error('❌ Profiles error:', profilesError.message);
    } else {
      console.log(`✅ Profiles: Found ${profiles?.length || 0} profiles`);
      if (profiles?.length > 0) {
        console.log('Sample profile:', profiles[0]);
      }
    }
    
    // Test 2: Check if we can query orders table
    console.log('\n2️⃣ Testing orders table...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, status, created_at')
      .limit(5);
    
    if (ordersError) {
      console.error('❌ Orders error:', ordersError.message);
      console.error('Error details:', ordersError);
    } else {
      console.log(`✅ Orders: Found ${orders?.length || 0} orders`);
      if (orders?.length > 0) {
        console.log('Sample order:', orders[0]);
      }
    }
    
    // Test 3: Check table structure
    console.log('\n3️⃣ Checking orders table structure...');
    const { data: oneOrder, error: structureError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (!structureError && oneOrder?.length > 0) {
      console.log('✅ Orders table columns:', Object.keys(oneOrder[0]));
    } else if (structureError) {
      console.error('❌ Structure check error:', structureError.message);
    } else {
      console.log('⚠️ No orders found to check structure');
    }
    
    // Test 4: Check RLS policies
    console.log('\n4️⃣ Checking RLS status...');
    const { data: rlsCheck, error: rlsError } = await supabase
      .rpc('check_rls_status')
      .single();
    
    if (rlsError) {
      console.log('ℹ️ RLS check function not available (this is normal)');
    } else {
      console.log('RLS Status:', rlsCheck);
    }
    
  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
  }
}

// Run the test
testConnection().then(() => {
  console.log('\n✅ Test complete!');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});