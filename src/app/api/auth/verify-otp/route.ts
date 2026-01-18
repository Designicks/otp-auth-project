import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongo';
import { generateToken } from '@/lib/auth';
import Otp from '@/models/Otp';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email, otp } = await request.json();

    // Validation
    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    // Normalize email (lowercase and trim)
    const normalizedEmail = email.toLowerCase().trim();

    // Find OTP record
    const otpRecord = await Otp.findOne({ email: normalizedEmail });
    if (!otpRecord) {
      console.log(`OTP not found for email: ${normalizedEmail}`);
      return NextResponse.json({ error: 'OTP not found or expired' }, { status: 404 });
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteOne({ email: normalizedEmail });
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    // Check if OTP matches (both should be strings)
    if (otpRecord.otp !== otp.trim()) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // OTP verified, update user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.isVerified = true;
    await user.save();

    // Delete OTP record
    await Otp.deleteOne({ email: normalizedEmail });

    // Generate JWT token
    const token = await generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    console.log('[verify-otp] Token generated:', token.substring(0, 20) + '...');

    const response = NextResponse.json(
      { message: 'OTP verified successfully', token },
      { status: 200 }
    );

    // Set the cookie with proper options for development
    response.cookies.set('authToken', token, {
      httpOnly: process.env.NODE_ENV === 'production', // Only httpOnly in production
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    console.log('[verify-otp] authToken cookie set, NODE_ENV:', process.env.NODE_ENV);
    return response;
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
