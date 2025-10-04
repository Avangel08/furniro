import { NextRequest } from 'next/server';
import { verifyAccessToken, extractTokenFromHeader, JWTPayload } from './jwt';
import connectDB from './mongodb';
import User, { IUser } from '@/models/User';

export interface AuthenticatedUser {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'staff';
  isActive: boolean;
  lastLogin?: Date;
}

export interface AuthResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
}

/**
 * Authenticate user from JWT token
 */
export async function authenticateUser(request: NextRequest): Promise<AuthResult> {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return {
        success: false,
        error: 'No authorization token provided'
      };
    }

    // Verify JWT token
    const payload = verifyAccessToken(token);
    if (!payload) {
      return {
        success: false,
        error: 'Invalid or expired token'
      };
    }

    // Connect to database
    await connectDB();

    // Find user in database
    const user = await User.findById(payload.userId).select('+password');
    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Check if user is active
    if (!user.isActive) {
      return {
        success: false,
        error: 'Account is deactivated'
      };
    }

    // Return authenticated user (without password)
    const authenticatedUser: AuthenticatedUser = {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin
    };

    return {
      success: true,
      user: authenticatedUser
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: 'Authentication failed'
    };
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthenticatedUser, requiredRoles: string[]): boolean {
  return requiredRoles.includes(user.role);
}

/**
 * Check if user is admin
 */
export function isAdmin(user: AuthenticatedUser): boolean {
  return user.role === 'admin';
}

/**
 * Check if user is admin or manager
 */
export function isAdminOrManager(user: AuthenticatedUser): boolean {
  return ['admin', 'manager'].includes(user.role);
}

/**
 * Middleware wrapper for protected routes
 */
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: AuthenticatedUser) => Promise<Response>,
  options?: {
    requiredRoles?: string[];
    adminOnly?: boolean;
  }
): Promise<Response> {
  // Authenticate user
  const authResult = await authenticateUser(request);
  
  if (!authResult.success || !authResult.user) {
    return new Response(
      JSON.stringify({
        success: false,
        error: authResult.error || 'Authentication required'
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Check role permissions
  if (options?.adminOnly && !isAdmin(authResult.user)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Admin access required'
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  if (options?.requiredRoles && !hasRole(authResult.user, options.requiredRoles)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Insufficient permissions'
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Call the protected handler
  return handler(request, authResult.user);
}

/**
 * Create HTTP-only cookie options
 */
export function getCookieOptions(maxAge?: number) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const,
    maxAge: maxAge || 7 * 24 * 60 * 60, // 7 days
    path: '/'
  };
}

/**
 * Create cookie string for Set-Cookie header
 */
export function createCookieString(name: string, value: string, options: ReturnType<typeof getCookieOptions>): string {
  let cookie = `${name}=${value}`;
  
  if (options.httpOnly) cookie += '; HttpOnly';
  if (options.secure) cookie += '; Secure';
  if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;
  if (options.maxAge) cookie += `; Max-Age=${options.maxAge}`;
  if (options.path) cookie += `; Path=${options.path}`;
  
  return cookie;
}

/**
 * Auth middleware for API routes
 */
export async function authMiddleware(
  request: NextRequest,
  requiredRoles?: string[]
): Promise<{ success: boolean; user?: AuthenticatedUser; error?: string; status?: number }> {
  try {
    console.log('🔍 [authMiddleware] Starting authentication...');
    
    // Authenticate user
    const authResult = await authenticateUser(request);
    console.log('🔍 [authMiddleware] Auth result:', { success: authResult.success, hasUser: !!authResult.user });
    
    if (!authResult.success || !authResult.user) {
      console.log('❌ [authMiddleware] Authentication failed:', authResult.error);
      return {
        success: false,
        error: authResult.error || 'Authentication required',
        status: 401
      };
    }

    // Check role permissions if required
    if (requiredRoles && requiredRoles.length > 0) {
      console.log('🔍 [authMiddleware] Checking roles:', { userRole: authResult.user.role, requiredRoles });
      
      if (!hasRole(authResult.user, requiredRoles)) {
        console.log('❌ [authMiddleware] Insufficient permissions');
        return {
          success: false,
          error: 'Insufficient permissions',
          status: 403
        };
      }
    }

    console.log('✅ [authMiddleware] Authentication successful');
    return {
      success: true,
      user: authResult.user
    };

  } catch (error) {
    console.error('❌ [authMiddleware] Error:', error);
    return {
      success: false,
      error: 'Authentication failed',
      status: 500
    };
  }
}
