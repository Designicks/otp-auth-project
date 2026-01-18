'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Box, Typography, Button, Card, CircularProgress, Alert } from '@mui/material';

interface User {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('[Dashboard] useEffect triggered, checking auth...');
        console.log('[Dashboard] Current URL:', window.location.href);
        
        // Small delay to ensure cookie is available
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('[Dashboard] Making request to /api/auth/me');
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('[Dashboard] Response received, status:', response.status);
        
        if (response.status === 401) {
          console.log('[Dashboard] Got 401, user not authenticated');
          setIsLoading(false);
          router.push('/login');
          return;
        }
        
        if (!response.ok) {
          console.error('[Dashboard] Response not OK:', response.status);
          const errorData = await response.json();
          setError(`Error: ${response.status} - ${errorData.error}`);
          setIsLoading(false);
          return;
        }
        
        const data = await response.json();
        console.log('[Dashboard] Successfully got user data:', data.user);
        setUser(data.user);
        setIsLoading(false);
      } catch (err: any) {
        console.error('[Dashboard] Error during auth check:', err);
        setError(`Error: ${err.message}`);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    // Clear auth token and redirect to home
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/');
  };

  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: 2 }}>
        <CircularProgress />
        <Typography variant="body1" color="textSecondary">
          Loading your dashboard...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ marginTop: 4 }}>
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => router.push('/login')}>
          Back to Login
        </Button>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container sx={{ marginTop: 4 }}>
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          Failed to load user data. Please login again.
        </Alert>
        <Button variant="contained" onClick={() => router.push('/login')}>
          Back to Login
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ marginTop: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        User Dashboard
      </Typography>

      <Card sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>
          User Information
        </Typography>
        <Box sx={{ marginBottom: 2 }}>
          <Typography>
            <strong>Email:</strong> {user.email}
          </Typography>
          <Typography>
            <strong>Role:</strong> {user.role}
          </Typography>
          <Typography>
            <strong>Verified:</strong> {user.isVerified ? 'Yes' : 'No'}
          </Typography>
        </Box>
        <Button variant="contained" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Card>
    </Container>
  );
}
