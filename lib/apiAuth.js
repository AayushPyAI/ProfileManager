import { NextResponse } from 'next/server';
import { getUserFromToken } from './auth.js';

/**
 * Middleware to protect API routes
 * Extracts token from Authorization header and verifies it
 * Adds user to request object
 */
export async function authenticateRequest(req) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        error: NextResponse.json(
          { error: 'Unauthorized - No token provided' },
          { status: 401 }
        ),
        user: null,
      };
    }

    const token = authHeader.substring(7);
    const user = await getUserFromToken(token);

    if (!user) {
      return {
        error: NextResponse.json(
          { error: 'Unauthorized - Invalid or expired token' },
          { status: 401 }
        ),
        user: null,
      };
    }

    return {
      error: null,
      user,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      error: NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      ),
      user: null,
    };
  }
}

