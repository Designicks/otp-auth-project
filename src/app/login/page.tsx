'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/AuthForm';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [userEmail, setUserEmail] = useState('');

  const handleLogin = async (formData: { email: string; password: string }) => {
    setIsLoading(true);
    setError('');

    try {
      // TODO: Implement actual login with password verification
      // For now, we'll proceed to OTP step
      setUserEmail(formData.email);

      // Send OTP
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send OTP');
      }

      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (formData: { otp: string }) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, otp: formData.otp }),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'OTP verification failed');
      }

      const data = await response.json();
      console.log('[Login] OTP verified successfully:', data);

      // Wait for cookie to be set
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('[Login] Checking if cookie was set...');
      console.log('[Login] Document cookies:', document.cookie);
      
      if (document.cookie.includes('authToken')) {
        console.log('[Login] authToken cookie found! Redirecting to dashboard...');
      } else {
        console.log('[Login] authToken cookie NOT found, but continuing anyway...');
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('[Login] OTP verification error:', err);
      setError(err.message || 'An error occurred');
      setIsLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <AuthForm
        type="otp"
        onSubmit={async (data) => handleVerifyOTP(data)}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  return (
    <AuthForm type="login" onSubmit={handleLogin} isLoading={isLoading} error={error} />
  );
}
