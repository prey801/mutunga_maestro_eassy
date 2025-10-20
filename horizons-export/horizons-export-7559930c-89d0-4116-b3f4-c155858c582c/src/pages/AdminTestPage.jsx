import React from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const AdminTestPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">🔧 Admin Test Page</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current User Info</h2>
          <div className="space-y-2">
            <p><strong>Logged in:</strong> {user ? '✅ Yes' : '❌ No'}</p>
            {user && (
              <>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Email Confirmed:</strong> {user.email_confirmed_at ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Created At:</strong> {user.created_at}</p>
                <p><strong>Admin Check:</strong> {(user.email === 'musyokibrian@gmail.com' || user.email === 'musyokibrian047@gmail.com') ? '✅ Is Admin' : '❌ Not Admin'}</p>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Links</h2>
          <div className="space-y-2">
            <a href="/admin" className="block text-blue-600 hover:text-blue-800">→ Go to Admin Dashboard (/admin)</a>
            <a href="/admin/users" className="block text-blue-600 hover:text-blue-800">→ Go to Admin Users (/admin/users)</a>
            <a href="/profile" className="block text-blue-600 hover:text-blue-800">→ Go to Profile</a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Instructions</h2>
          <div className="space-y-2 text-sm">
            <p>1. Open your browser console (F12)</p>
            <p>2. Look for admin check messages</p>
            <p>3. Try clicking the admin links above</p>
            <p>4. Check if you see admin navigation in the header</p>
            <p>5. If you can't access admin, sign in as: <strong>musyokibrian@gmail.com</strong></p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-100 rounded-lg">
          <p className="text-yellow-800">
            🎯 <strong>Quick Test:</strong> If you can see this page, the app is working. 
            Check your browser console for admin detection logs when you navigate to admin pages.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminTestPage;