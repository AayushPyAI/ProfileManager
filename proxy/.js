import { NextResponse } from 'next/server';
import { verifyAccessToken } from './lib/auth.js';

// Routes that don't require authentication
const publicRoutes = ['/'];
// Routes that require authentication
const protectedRoutes = ['/dashboard'];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow public profile viewing (portfolio pages) - routes like /[profileId]
  if (pathname.match(/^\/[a-f0-9]{24}$/i)) {
    return NextResponse.next();
  }

  // Check for protected frontend routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // Try to get token from cookies or Authorization header
    const token = request.cookies.get('accessToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      // Redirect to home if not authenticated
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    // Verify token
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      // Token invalid, redirect to home
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // API routes handle their own authentication via authenticateRequest helper
  // This middleware focuses on frontend route protection
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

