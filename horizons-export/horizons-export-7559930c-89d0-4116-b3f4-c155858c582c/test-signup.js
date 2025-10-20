// Test sign-up with provided credentials
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iojsrywtrvemxlqvvgff.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvanNyeXd0cnZlbXhscXZ2Z2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODY4Njk5NzIsImV4cCI6MjAwMjQ0NTk3Mn0.OjKmdww8E9VWpxJtbJM8_2_C6tKhVKC_7Aj-_7q8RUM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignUp() {
  console.log('=== Sign-Up Test ===');
  
  const testEmail = 'standcody0@gmail.com';
  const testPassword = '170739dK*100';
  const testName = 'Stan Cody';
  
  console.log('Testing with:');
  console.log('Email:', testEmail);
  console.log('Password length:', testPassword.length);
  console.log('Name:', testName);
  console.log('');
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: { full_name: testName }
      }
    });
    
    console.log('Response:', { data, error });
    
    if (error) {
      console.error('❌ Sign-up failed:', error.message);
      console.error('Error code:', error.status);
      
      // Common error analysis
      if (error.message.includes('User already registered')) {
        console.log('💡 Solution: This email is already registered. Try logging in instead.');
      } else if (error.message.includes('password')) {
        console.log('💡 Solution: Check password requirements (min 6 chars, etc.)');
      } else if (error.message.includes('email')) {
        console.log('💡 Solution: Check email format or try different email');
      }
    } else {
      console.log('✅ Sign-up successful!');
      if (data.user) {
        console.log('User ID:', data.user.id);
        console.log('Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No - Check email for confirmation');
      }
    }
  } catch (err) {
    console.error('❌ Exception during sign-up:', err.message);
  }
}

testSignUp();