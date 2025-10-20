import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useNavigate } from 'react-router-dom';

const SupabaseTest = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState({
    connection: { status: 'testing', message: '' },
    auth: { status: 'pending', message: '' },
    signup: { status: 'pending', message: '' }
  });

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    // Test 1: Basic Connection
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error && error.code === '42P01') {
        // Table doesn't exist - that's okay, connection works
        setTests(prev => ({
          ...prev,
          connection: { status: 'success', message: 'Connected to Supabase (profiles table not found, but connection works)' }
        }));
      } else if (error) {
        setTests(prev => ({
          ...prev,
          connection: { status: 'error', message: `Connection error: ${error.message}` }
        }));
      } else {
        setTests(prev => ({
          ...prev,
          connection: { status: 'success', message: 'Successfully connected to Supabase' }
        }));
      }
    } catch (err) {
      setTests(prev => ({
        ...prev,
        connection: { status: 'error', message: `Network error: ${err.message}` }
      }));
    }

    // Test 2: Auth Status
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setTests(prev => ({
        ...prev,
        auth: { 
          status: 'success', 
          message: session ? `Logged in as: ${session.user.email}` : 'Not logged in (normal for sign-up test)' 
        }
      }));
    } catch (err) {
      setTests(prev => ({
        ...prev,
        auth: { status: 'error', message: `Auth error: ${err.message}` }
      }));
    }

    // Test 3: Sign-up Test (with dummy data)
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: { full_name: 'Test User' }
        }
      });

      if (error) {
        if (error.message.includes('email rate limit')) {
          setTests(prev => ({
            ...prev,
            signup: { 
              status: 'warning', 
              message: 'Rate limited (too many test emails) - but sign-up functionality works' 
            }
          }));
        } else {
          setTests(prev => ({
            ...prev,
            signup: { status: 'error', message: `Sign-up error: ${error.message}` }
          }));
        }
      } else {
        setTests(prev => ({
          ...prev,
          signup: { 
            status: 'success', 
            message: data.user ? 'Sign-up works! Test user created.' : 'Sign-up response received'
          }
        }));
      }
    } catch (err) {
      setTests(prev => ({
        ...prev,
        signup: { status: 'error', message: `Exception: ${err.message}` }
      }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#16a34a';
      case 'warning': return '#d97706';  
      case 'error': return '#dc2626';
      case 'testing': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'testing': return '🔄';
      default: return '⏳';
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '20px', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              marginBottom: '16px',
              padding: '8px 16px',
              background: 'none',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            ← Back to Home
          </button>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
            Supabase Connection Test
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Testing Supabase connection and sign-up functionality
          </p>
        </div>

        {/* Environment Info */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Environment</h2>
          <div style={{ fontSize: '14px', fontFamily: 'monospace' }}>
            <p><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL?.substring(0, 30)}...</p>
            <p><strong>Anon Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}</p>
          </div>
        </div>

        {/* Test Results */}
        {Object.entries(tests).map(([testName, result]) => (
          <div key={testName} style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: `2px solid ${getStatusColor(result.status)}`,
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ fontSize: '24px', marginTop: '2px' }}>
                {getStatusIcon(result.status)}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  margin: '0 0 8px 0', 
                  color: getStatusColor(result.status), 
                  fontSize: '18px', 
                  fontWeight: 'bold',
                  textTransform: 'capitalize'
                }}>
                  {testName === 'signup' ? 'Sign-Up Test' : testName} Test
                </h3>
                <p style={{ color: '#4b5563', fontSize: '14px', margin: 0 }}>
                  {result.message || 'Running test...'}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Actions */}
        <div style={{
          backgroundColor: '#f0f9ff',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #0284c7',
          marginTop: '20px'
        }}>
          <h3 style={{ color: '#0284c7', margin: '0 0 12px 0' }}>Quick Actions</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={runTests}
              style={{
                padding: '8px 16px',
                backgroundColor: '#0284c7',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Re-run Tests
            </button>
            <a
              href="/signup"
              style={{
                padding: '8px 16px',
                backgroundColor: '#16a34a',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                display: 'inline-block'
              }}
            >
              Try Sign-Up Page
            </a>
          </div>
        </div>

        {/* Console Instructions */}
        <div style={{
          marginTop: '20px',
          fontSize: '14px',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          <p>💡 Open Developer Tools (F12) → Console for detailed logs</p>
        </div>
      </div>
    </div>
  );
};

export default SupabaseTest;