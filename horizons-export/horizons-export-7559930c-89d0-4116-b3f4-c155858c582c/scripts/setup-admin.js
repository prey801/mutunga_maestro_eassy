#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env.local');

try {
  const envContent = readFileSync(envPath, 'utf-8');
  const envLines = envContent.split('\n');
  
  envLines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    }
  });
} catch (error) {
  console.error('Error loading .env.local file:', error.message);
  process.exit(1);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  console.log('Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupAdmin() {
  console.log('🚀 Admin Setup Script for Maestro Essays');
  console.log('========================================');
  
  // Get email from command line argument or prompt
  const email = process.argv[2];
  
  if (!email) {
    console.log('Usage: node setup-admin.js <admin-email>');
    console.log('Example: node setup-admin.js admin@maestroessays.com');
    process.exit(1);
  }
  
  console.log(`Setting up admin privileges for: ${email}`);
  
  try {
    // First, check if the user exists
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('❌ Error fetching users:', userError.message);
      console.log('\n💡 Note: This script needs admin privileges. You may need to:');
      console.log('   1. Run the SQL migration first: database/add_admin_role.sql');
      console.log('   2. Use Supabase dashboard to grant admin role manually');
      process.exit(1);
    }
    
    const user = userData.users?.find(u => u.email === email);
    
    if (!user) {
      console.error(`❌ User with email ${email} not found!`);
      console.log('\n💡 Please make sure the user has signed up first.');
      process.exit(1);
    }
    
    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);
    
    // Try to update the profile to set admin status
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({ is_admin: true, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select();
    
    if (profileError) {
      console.error('❌ Error updating profile:', profileError.message);
      console.log('\n💡 Fallback: Run this SQL command in your Supabase SQL editor:');
      console.log(`UPDATE public.profiles SET is_admin = true WHERE user_id = '${user.id}';`);
      process.exit(1);
    }
    
    if (profileData && profileData.length > 0) {
      console.log('✅ Successfully granted admin privileges!');
      console.log(`🎉 ${email} is now an admin user.`);
      
      // Verify the update
      const { data: verifyData, error: verifyError } = await supabase
        .from('profiles')
        .select('is_admin, full_name, email')
        .eq('user_id', user.id)
        .single();
      
      if (!verifyError && verifyData?.is_admin) {
        console.log('✅ Admin status verified in database');
        console.log('\n🔐 You can now access the admin panel at:');
        console.log('   http://localhost:5174/admin');
      }
    } else {
      console.log('⚠️  No profile found for this user.');
      console.log('💡 The user may need to complete their profile setup first.');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.log('\n💡 Manual setup instructions:');
    console.log('   1. Go to your Supabase dashboard');
    console.log('   2. Open the SQL editor');
    console.log('   3. Run: SELECT make_admin(\'' + email + '\');');
  }
}

setupAdmin();