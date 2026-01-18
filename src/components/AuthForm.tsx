'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  CircularProgress,
} from '@mui/material';

interface AuthFormProps {
  type: 'register' | 'login' | 'otp';
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export const AuthForm: React.FC<AuthFormProps> = ({ type, onSubmit, isLoading = false, error }) => {
  const [formData, setFormData] = useState({ email: '', password: '', otp: '' });
  const [validationError, setValidationError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (type === 'register' || type === 'login') {
      if (!formData.email || !formData.password) {
        setValidationError('All fields are required');
        return;
      }
    } else if (type === 'otp') {
      if (!formData.email || !formData.otp) {
        setValidationError('Email and OTP are required');
        return;
      }
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setValidationError(err.message || 'An error occurred');
    }
  };

  const title =
    type === 'register' ? 'Register' : type === 'login' ? 'Login' : 'Verify OTP';

  return (
    <Container maxWidth="sm" sx={{ marginTop: 8 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 3,
          border: '1px solid #ccc',
          borderRadius: 2,
        }}
      >
        <Typography component="h1" variant="h4" sx={{ marginBottom: 3 }}>
          {title}
        </Typography>

        {error && <Alert severity="error" sx={{ marginBottom: 2, width: '100%' }}>{error}</Alert>}
        {validationError && (
          <Alert severity="error" sx={{ marginBottom: 2, width: '100%' }}>
            {validationError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />

          {(type === 'register' || type === 'login') && (
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
          )}

          {type === 'otp' && (
            <TextField
              margin="normal"
              required
              fullWidth
              name="otp"
              label="OTP"
              type="text"
              id="otp"
              value={formData.otp}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="000000"
            />
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ marginTop: 3 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : title}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default AuthForm;
