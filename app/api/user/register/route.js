import { registerUser } from '@/lib/user';
import { NextResponse } from 'next/server';
import { generateAccessToken, generateRefreshToken, saveRefreshToken } from '@/lib/auth.js';

export async function POST(req) {
  try {
    const formData = await req.formData();
    
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const avatarFile = formData.get('avatar');

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    let avatarBuffer = null;
    let avatarFileName = null;

    // Handle avatar file if provided
    if (avatarFile && avatarFile.size > 0) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (avatarFile.size > maxSize) {
        return NextResponse.json(
          { message: 'Avatar file size must be less than 5MB' },
          { status: 400 }
        );
      }

      avatarBuffer = Buffer.from(await avatarFile.arrayBuffer());
      avatarFileName = avatarFile.name;
    }

    const user = await registerUser({
      name,
      email,
      password,
      avatarBuffer,
      avatarFileName,
    });

    // Generate tokens
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());
    
    // Save refresh token to database
    await saveRefreshToken(user._id.toString(), refreshToken);

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          avatar: user.avatar?.url || user.avatar,
        },
        accessToken,
        refreshToken,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}