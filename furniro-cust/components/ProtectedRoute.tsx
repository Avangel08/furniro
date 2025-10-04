"use client";

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/', 
  requireAuth = true 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        // Redirect to home page if not authenticated
        router.push(redirectTo);
      } else if (!requireAuth && isAuthenticated) {
        // Redirect authenticated users away from auth pages
        router.push('/profile');
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if auth requirements not met
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
