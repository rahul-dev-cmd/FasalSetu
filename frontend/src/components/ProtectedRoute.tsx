import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user.isLoggedIn) {
    const roleParam = allowedRoles.length > 0 ? allowedRoles[0] : 'farmer';
    return <Navigate to={`/login?role=${roleParam}`} state={{ from: location }} replace />;
  }

  if (user.role && !allowedRoles.includes(user.role)) {
    // Redirect to the user's authorized role home dashboard
    if (user.role === 'farmer') {
      return <Navigate to="/farmer/dashboard" replace />;
    } else if (user.role === 'buyer') {
      return <Navigate to="/buyer/dashboard" replace />;
    } else if (user.role === 'government') {
      return <Navigate to="/government/risk-map" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};
