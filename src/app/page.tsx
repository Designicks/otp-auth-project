'use client';

import { Container, Box, Typography, Button, Stack } from '@mui/material';
import Link from 'next/link';

export default function Home() {
  return (
    <Container maxWidth="md" sx={{ marginTop: 8 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome to OTP Auth App
        </Typography>
        <Typography variant="h6" color="textSecondary" sx={{ marginBottom: 4 }}>
          Secure authentication with One-Time Password verification
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Link href="/register">
            <Button variant="contained" size="large">
              Register
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outlined" size="large">
              Login
            </Button>
          </Link>
        </Stack>

        <Box sx={{ marginTop: 6, padding: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
          <Typography variant="body1" sx={{ marginBottom: 2 }}>
            <strong>Features:</strong>
          </Typography>
          <ul style={{ textAlign: 'left', display: 'inline-block' }}>
            <li>User registration with email</li>
            <li>OTP-based authentication</li>
            <li>JWT token management</li>
            <li>Role-based access control</li>
            <li>Admin dashboard</li>
            <li>User dashboard</li>
          </ul>
        </Box>
      </Box>
    </Container>
  );
}
