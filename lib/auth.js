import jwt from 'jsonwebtoken';
import { connectToDatabase } from './Database.js';
import User from '@/modals/user.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

// Generate access token
export function generateAccessToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

// Generate refresh token
export function generateRefreshToken(userId) {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

// Verify access token
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Verify refresh token
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
}

// Get user from token (for API routes)
export async function getUserFromToken(token) {
  try {
    const decoded = verifyAccessToken(token);
    if (!decoded || !decoded.userId) {
      return null;
    }

    await connectToDatabase();
    const user = await User.findById(decoded.userId).select('-password -refreshToken');
    return user;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}

// Save refresh token to database
export async function saveRefreshToken(userId, refreshToken) {
  try {
    await connectToDatabase();
    await User.findByIdAndUpdate(userId, { refreshToken });
  } catch (error) {
    console.error('Error saving refresh token:', error);
    throw error;
  }
}

// Remove refresh token from database
export async function removeRefreshToken(userId) {
  try {
    await connectToDatabase();
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  } catch (error) {
    console.error('Error removing refresh token:', error);
    throw error;
  }
}

// Verify refresh token and get user
export async function verifyAndGetUserFromRefreshToken(refreshToken) {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded || !decoded.userId) {
      return null;
    }

    await connectToDatabase();
    const user = await User.findById(decoded.userId);
    
    // Verify the refresh token matches the one stored in database
    if (!user || user.refreshToken !== refreshToken) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error verifying refresh token:', error);
    return null;
  }
}

