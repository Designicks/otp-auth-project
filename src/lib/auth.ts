import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-jwt-key');
const JWT_EXPIRE = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export async function generateToken(payload: JWTPayload): Promise<string> {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(JWT_SECRET);
    
    console.log('[auth.ts] Token generated successfully');
    return token;
  } catch (error: any) {
    console.error('[auth.ts] Token generation failed:', error.message);
    throw error;
  }
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    console.log('[auth.ts] Verifying token...');
    console.log('[auth.ts] Token to verify:', token.substring(0, 30) + '...');
    
    const verified = await jwtVerify(token, JWT_SECRET);
    console.log('[auth.ts] Token verified successfully:', verified.payload);
    return verified.payload as unknown as JWTPayload;
  } catch (error: any) {
    console.error('[auth.ts] Token verification failed:', error.message);
    return null;
  }
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOTPExpiryTime(minutes: number = 10): Date {
  const now = new Date();
  return new Date(now.getTime() + minutes * 60 * 1000);
}
