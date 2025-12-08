import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public profile viewing (portfolio pages) - routes like /[profileId]
  // These are public and don't need authentication
  if (pathname.match(/^\/[a-f0-9]{24}$/i)) {
    return NextResponse.next();
  }

  // All other routes are handled by:
  // 1. ProtectedRoute component for frontend routes (checks localStorage)
  // 2. authenticateRequest helper for API routes (checks Authorization header)
  // This middleware just allows the request to proceed
  
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

