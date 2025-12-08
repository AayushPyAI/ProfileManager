import { NextResponse } from 'next/server';
import { loginUser } from '@/lib/user.js';
import { generateAccessToken, generateRefreshToken, saveRefreshToken } from '@/lib/auth.js';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await loginUser(email, password);
    
    // Generate tokens
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());
    
    // Save refresh token to database
    await saveRefreshToken(user._id.toString(), refreshToken);

    // Return user data without sensitive information
    const userData = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    };

    return NextResponse.json({ 
      user: userData,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error }, { status: 401 });
  }
}