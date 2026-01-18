'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CircularProgress, Container } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole = 'user' }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('[ProtectedRoute] Checking auth...');
        
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          cache: 'no-store',
        });
        
        console.log('[ProtectedRoute] Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('[ProtectedRoute] User data:', data);
          if (requiredRole === 'admin' && data.user.role !== 'admin') {
            console.log('[ProtectedRoute] User is not admin, redirecting to dashboard');
            router.push('/dashboard');
          } else {
            console.log('[ProtectedRoute] User authorized!');
            setIsAuthorized(true);
          }
        } else {
          console.log('[ProtectedRoute] Auth check failed, redirecting to login');
          router.push('/login');
        }
      } catch (error) {
        console.error('[ProtectedRoute] Auth check error:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []); // Empty array - run only once on mount

  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return isAuthorized ? <>{children}</> : null;
};

export default ProtectedRoute;
