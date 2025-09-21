import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken } from 'utils/auth';

export const RequireAuth = ({ children }) => {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

export const PublicRoute = ({ children }) => {
  const token = getToken();
  if (token) return <Navigate to="/home/dashboard" replace />;
  return children;
};

export default RequireAuth;
