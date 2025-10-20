import React from 'react';

const EnvTest = () => {
  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  
  console.log('=== Environment Variables Debug ===');
  console.log('VITE_PAYPAL_CLIENT_ID:', paypalClientId);
  console.log('VITE_SUPABASE_URL:', supabaseUrl);
  console.log('All env vars:', import.meta.env);

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '40px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ marginBottom: '30px', color: '#333' }}>Environment Variables Test</h1>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#666' }}>PayPal Configuration:</h3>
          <p><strong>VITE_PAYPAL_CLIENT_ID:</strong></p>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '10px', 
            borderRadius: '4px',
            fontFamily: 'monospace',
            wordBreak: 'break-all'
          }}>
            {paypalClientId ? paypalClientId : '❌ NOT FOUND'}
          </div>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
            Status: {paypalClientId ? '✅ Loaded' : '❌ Missing'}
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#666' }}>Supabase Configuration:</h3>
          <p><strong>VITE_SUPABASE_URL:</strong></p>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '10px', 
            borderRadius: '4px',
            fontFamily: 'monospace',
            wordBreak: 'break-all'
          }}>
            {supabaseUrl ? supabaseUrl : '❌ NOT FOUND'}
          </div>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
            Status: {supabaseUrl ? '✅ Loaded' : '❌ Missing'}
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#666' }}>Environment Info:</h3>
          <p><strong>Mode:</strong> {import.meta.env.MODE}</p>
          <p><strong>Base URL:</strong> {import.meta.env.BASE_URL}</p>
          <p><strong>Dev:</strong> {import.meta.env.DEV ? 'Yes' : 'No'}</p>
          <p><strong>Prod:</strong> {import.meta.env.PROD ? 'Yes' : 'No'}</p>
        </div>

        <div style={{ 
          backgroundColor: '#e3f2fd', 
          padding: '20px', 
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#1976d2', marginTop: '0' }}>Quick Navigation:</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <a href="/paypal-tutorial" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 'bold' }}>
              📚 PayPal Tutorial Test (Official Structure) ⭐ RECOMMENDED
            </a>
            <a href="/paypal-improved" style={{ color: '#1976d2', textDecoration: 'none' }}>
              🚀 PayPal Improved Test (Enhanced Features)
            </a>
            <a href="/paypal-standalone" style={{ color: '#1976d2', textDecoration: 'none' }}>
              🧪 PayPal Standalone Test (No Header/Footer)
            </a>
            <a href="/payment-simple" style={{ color: '#1976d2', textDecoration: 'none' }}>
              💳 Simple Payment Page
            </a>
            <a href="/paypal-test" style={{ color: '#1976d2', textDecoration: 'none' }}>
              🔧 PayPal Component Test
            </a>
            <a href="/" style={{ color: '#1976d2', textDecoration: 'none' }}>
              🏠 Home Page
            </a>
          </div>
        </div>

        <div style={{ 
          fontSize: '14px', 
          color: '#666',
          borderTop: '1px solid #eee',
          paddingTop: '20px'
        }}>
          <p><strong>Instructions:</strong></p>
          <ol>
            <li>Check that PayPal Client ID is loaded above</li>
            <li>Open browser Developer Tools (F12)</li>
            <li>Go to Console tab</li>
            <li>Click on PayPal Standalone Test link</li>
            <li>Watch console for debug messages</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default EnvTest;