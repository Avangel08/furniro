import jwt from 'jsonwebtoken';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  type: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(payload: Omit<JWTPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'access' },
    JWT_SECRET,
    { 
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'furniro-admin',
      audience: 'furniro-admin-users'
    }
  );
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(payload: Omit<JWTPayload, 'type'>): string {
  return jwt.sign(
    { ...payload, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { 
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'furniro-admin',
      audience: 'furniro-admin-users'
    }
  );
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(user: {
  _id: string;
  email: string;
  name: string;
  role: string;
}): TokenPair {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Calculate expiration time (7 days from now)
  const expiresIn = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);

  return {
    accessToken,
    refreshToken,
    expiresIn
  };
}

/**
 * Verify JWT access token
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'furniro-admin',
      audience: 'furniro-admin-users'
    }) as JWTPayload;

    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Verify JWT refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'furniro-admin',
      audience: 'furniro-admin-users'
    }) as JWTPayload;

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    console.error('JWT refresh verification failed:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token: string): number | null {
  try {
    const decoded = jwt.decode(token) as any;
    return decoded?.exp || null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const exp = getTokenExpiration(token);
  if (!exp) return true;
  
  return Date.now() >= exp * 1000;
}
