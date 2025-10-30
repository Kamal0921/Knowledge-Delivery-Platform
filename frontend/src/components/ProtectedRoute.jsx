// frontend/src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location
    return <Navigate to="/login" replace />;
  }

  return <Outlet />; // Render the child route (e.g., Dashboard)
};

export default ProtectedRoute;