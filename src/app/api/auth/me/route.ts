import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongo';
import { verifyToken } from '@/lib/auth';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get token from cookie
    const token = request.cookies.get('authToken')?.value;
    console.log('[/api/auth/me] Received request');
    console.log('[/api/auth/me] Token from cookie:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
    // console.log('[/api/auth/me] All cookies:', request.cookies.getSetCookie());

    if (!token) {
      console.log('[/api/auth/me] No token found, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const payload = await verifyToken(token);
    console.log('[/api/auth/me] Token verification result:', payload);
    
    if (!payload) {
      console.log('[/api/auth/me] Invalid token, returning 401');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user
    const user = await User.findById(payload.userId);
    if (!user) {
      console.log('[/api/auth/me] User not found for id:', payload.userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('[/api/auth/me] User found, returning user data:', user.email);
    return NextResponse.json(
      {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
