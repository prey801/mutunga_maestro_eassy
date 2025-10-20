import React from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const SimpleAdminDebug = () => {
  const { user } = useAuth();
  
  console.log('SimpleAdminDebug component loaded');
  console.log('Current user:', user);
  
  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      backgroundColor: '#f3f4f6'
    }}>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold', 
        marginBottom: '1rem',
        color: '#111827'
      }}>
        🔧 Simple Admin Debug
      </h1>
      
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '1rem'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Status Check</h2>
        <p><strong>Component loaded:</strong> ✅ Yes</p>
        <p><strong>User logged in:</strong> {user ? '✅ Yes' : '❌ No'}</p>
        {user && (
          <div>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Admin check:</strong> {(user.email === 'musyokibrian@gmail.com' || user.email === 'musyokibrian047@gmail.com') ? '✅ Is Admin' : '❌ Not Admin'}</p>
          </div>
        )}
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '1rem'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Test Navigation</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="/admin" style={{ color: '#2563eb', textDecoration: 'underline' }}>
            → Try /admin
          </a>
          <a href="/admin-test" style={{ color: '#2563eb', textDecoration: 'underline' }}>
            → Try /admin-test  
          </a>
          <a href="/profile" style={{ color: '#2563eb', textDecoration: 'underline' }}>
            → Try /profile
          </a>
        </div>
      </div>

      <div style={{
        backgroundColor: '#fef3c7',
        padding: '1rem',
        borderRadius: '0.5rem',
        border: '1px solid #f59e0b'
      }}>
        <p style={{ color: '#92400e', margin: 0 }}>
          <strong>Debug Info:</strong> If you can see this page, React routing is working. 
          Check browser console for any errors.
        </p>
      </div>
    </div>
  );
};

export default SimpleAdminDebug;