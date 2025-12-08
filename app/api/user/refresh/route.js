import { NextResponse } from 'next/server';
import { verifyAndGetUserFromRefreshToken, generateAccessToken, generateRefreshToken, saveRefreshToken, removeRefreshToken } from '@/lib/auth.js';

export async function POST(req) {
  try {
    const { refreshToken } = await req.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Verify refresh token and get user
    const user = await verifyAndGetUserFromRefreshToken(refreshToken);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id.toString());
    const newRefreshToken = generateRefreshToken(user._id.toString());

    // Update refresh token in database
    await saveRefreshToken(user._id.toString(), newRefreshToken);

    // Return user data without sensitive information
    const userData = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    };

    return NextResponse.json({
      user: userData,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}

