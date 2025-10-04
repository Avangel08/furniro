import { NextRequest, NextResponse } from 'next/server';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Security middleware
export function securityMiddleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CORS headers for production
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    // Add your production domains here
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  return response;
}

// Rate limiting middleware
export function rateLimitMiddleware(
  request: NextRequest,
  options: {
    windowMs?: number;
    maxRequests?: number;
    keyGenerator?: (req: NextRequest) => string;
  } = {}
) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    keyGenerator = (req) => req.ip || 'unknown'
  } = options;
  
  const key = keyGenerator(request);
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Clean up expired entries
  for (const [k, v] of rateLimitStore.entries()) {
    if (v.resetTime < now) {
      rateLimitStore.delete(k);
    }
  }
  
  const current = rateLimitStore.get(key);
  
  if (!current) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return NextResponse.next();
  }
  
  if (current.resetTime < now) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return NextResponse.next();
  }
  
  if (current.count >= maxRequests) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }
  
  current.count++;
  return NextResponse.next();
}

// Input sanitization middleware
export function sanitizeInputMiddleware(request: NextRequest) {
  // This is a basic implementation
  // In production, use a proper sanitization library like DOMPurify
  
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  
  // Sanitize query parameters
  for (const [key, value] of searchParams.entries()) {
    if (value.includes('<script>') || value.includes('javascript:') || value.includes('onerror=')) {
      return new NextResponse('Invalid input detected', { status: 400 });
    }
  }
  
  return NextResponse.next();
}

// Authentication rate limiting (stricter for auth endpoints)
export function authRateLimitMiddleware(request: NextRequest) {
  return rateLimitMiddleware(request, {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    keyGenerator: (req) => {
      const ip = req.ip || 'unknown';
      const userAgent = req.headers.get('user-agent') || '';
      return `${ip}-${userAgent}`;
    }
  });
}

// Combined security middleware
export function applySecurityMiddleware(request: NextRequest) {
  // Apply all security middleware in sequence
  let response = securityMiddleware(request);
  
  // Apply rate limiting for auth endpoints
  if (request.nextUrl.pathname.startsWith('/api/auth/')) {
    const rateLimitResponse = authRateLimitMiddleware(request);
    if (rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }
  }
  
  // Apply general rate limiting
  const rateLimitResponse = rateLimitMiddleware(request);
  if (rateLimitResponse.status === 429) {
    return rateLimitResponse;
  }
  
  // Apply input sanitization
  const sanitizeResponse = sanitizeInputMiddleware(request);
  if (sanitizeResponse.status === 400) {
    return sanitizeResponse;
  }
  
  return response;
}
