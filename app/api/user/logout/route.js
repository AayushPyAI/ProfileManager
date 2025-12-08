import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/apiAuth.js';
import { removeRefreshToken } from '@/lib/auth.js';

export async function POST(req) {
  try {
    // Authenticate the request
    const { error, user } = await authenticateRequest(req);
    
    if (error) {
      return error;
    }

    // Remove refresh token from database
    await removeRefreshToken(user._id.toString());

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}

