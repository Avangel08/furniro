import { NextRequest, NextResponse } from 'next/server';
import { applySecurityMiddleware } from './src/middleware/security';

export function middleware(request: NextRequest) {
  // Apply security middleware to all requests
  return applySecurityMiddleware(request);
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
