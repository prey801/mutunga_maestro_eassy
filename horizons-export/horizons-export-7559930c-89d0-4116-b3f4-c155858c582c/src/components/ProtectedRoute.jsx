import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(adminOnly);

  useEffect(() => {
    if (adminOnly && user) {
      checkAdminStatus();
    } else if (!adminOnly) {
      setAdminLoading(false);
    }
  }, [user, adminOnly]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      setAdminLoading(false);
      return;
    }
    
    // Multiple hardcoded admin checks
    if (user.email === 'musyokibrian@gmail.com' || 
        user.email === 'musyokibrian047@gmail.com') {
      setIsAdmin(true);
      setAdminLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data?.is_admin || false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setAdminLoading(false);
    }
  };

  if (loading || adminLoading) {
    return (
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
            <p className="text-lg font-semibold text-sky-600">Loading...</p>
        </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default ProtectedRoute;