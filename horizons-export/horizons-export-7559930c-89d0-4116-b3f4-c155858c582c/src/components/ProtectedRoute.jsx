import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
        <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
            <p className="text-lg font-semibold text-sky-600">Loading...</p>
        </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user.email !== 'admin@maestroessays.com') {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default ProtectedRoute;