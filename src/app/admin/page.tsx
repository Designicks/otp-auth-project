'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Box, Typography, Card, CircularProgress, Alert, Button } from '@mui/material';

interface User {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log('[Admin] Fetching user data...');
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          cache: 'no-store',
        });
        
        console.log('[Admin] Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('[Admin] User data:', data);
          
          if (data.user.role !== 'admin') {
            console.log('[Admin] User is not admin, redirecting to dashboard');
            router.push('/dashboard');
            return;
          }
          
          setUser(data.user);
          setIsLoading(false);
        } else {
          console.log('[Admin] Not authenticated, redirecting to login');
          router.push('/login');
        }
      } catch (err) {
        console.error('[Admin] Error:', err);
        router.push('/login');
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    // Clear auth token and redirect to home
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/');
  };

  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container sx={{ marginTop: 4 }}>
        <Alert severity="error">Failed to load admin data. Please login again.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ marginTop: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
        Admin Dashboard
      </Typography>

      {error && <Alert severity="error" sx={{ marginBottom: 2 }}>{error}</Alert>}

      <>
        <Card sx={{ padding: 3, marginBottom: 3, backgroundColor: '#fff3e0' }}>
          <Typography variant="h6" gutterBottom>
            Administrator Information
          </Typography>
          <Box sx={{ marginBottom: 2 }}>
            <Typography>
              <strong>Email:</strong> {user.email}
            </Typography>
            <Typography>
              <strong>Role:</strong> <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>{user.role}</span>
            </Typography>
            <Typography>
              <strong>Verified:</strong> {user.isVerified ? 'Yes' : 'No'}
            </Typography>
          </Box>
        </Card>

        <Card sx={{ padding: 3, marginBottom: 3 }}>
          <Typography variant="h6" gutterBottom>
            Admin Actions
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 2 }}>
            TODO: Add admin functionality such as:
          </Typography>
          <ul>
            <li>User management</li>
            <li>Role assignments</li>
            <li>System logs</li>
            <li>Settings</li>
          </ul>
          <Button variant="contained" color="error" onClick={handleLogout} sx={{ marginTop: 2 }}>
            Logout
          </Button>
        </Card>
      </>
    </Container>
  );
}
