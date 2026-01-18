import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongo';
import { generateOTP, getOTPExpiryTime } from '@/lib/auth';
import Otp from '@/models/Otp';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email } = await request.json();

    // Validation
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete existing OTP
    await Otp.deleteOne({ email: normalizedEmail });

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiryTime(10); // 10 minutes

    const otpRecord = new Otp({
      email: normalizedEmail,
      otp,
      expiresAt,
      attempts: 0,
    });

    await otpRecord.save();

    // TODO: Send OTP via email using Nodemailer or similar service
    console.log(`OTP for ${normalizedEmail}: ${otp}`);

    return NextResponse.json(
      { 
        message: 'OTP sent successfully', 
        expiresIn: '10 minutes',
        // In development, return the OTP for testing
        ...(process.env.NODE_ENV === 'development' && { otp })
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
