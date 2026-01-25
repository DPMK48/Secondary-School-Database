import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PageLoader } from '../components/common/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user, token } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader message="Verifying authentication..." />;
  }

  // Check for valid authentication (must have user, token, and isAuthenticated flag)
  if (!isAuthenticated || !user || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
