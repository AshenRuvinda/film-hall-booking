// frontend/src/components/common/ProtectedRoute.js - NEW COMPONENT
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole, redirectTo = '/login' }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const dashboardMap = {
      'user': '/user/dashboard',
      'admin': '/admin/dashboard', 
      'operator': '/operator/dashboard'
    };
    return <Navigate to={dashboardMap[user.role] || '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;