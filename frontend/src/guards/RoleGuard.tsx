import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRole } from '../hooks/useRole';
import type { UserRole } from '../types';
import { Alert } from '../components/common';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
  showAccessDenied?: boolean;
}

const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallbackPath = '/dashboard',
  showAccessDenied = false,
}) => {
  const { role, canAccess } = useRole();

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  const hasAccess = canAccess(allowedRoles);

  if (!hasAccess) {
    if (showAccessDenied) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            <Alert variant="error" title="Access Denied">
              You don't have permission to access this page. Please contact your
              administrator if you believe this is an error.
            </Alert>
          </div>
        </div>
      );
    }
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

// Higher-order component version
// eslint-disable-next-line react-refresh/only-export-components
export function withRoleGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles: UserRole[]
) {
  return function WithRoleGuardComponent(props: P) {
    return (
      <RoleGuard allowedRoles={allowedRoles}>
        <WrappedComponent {...props} />
      </RoleGuard>
    );
  };
}

export default RoleGuard;
