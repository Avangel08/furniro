import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateTokenPair } from '@/lib/jwt';
import { createCookieString, getCookieOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Refresh token not found' 
        },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid or expired refresh token' 
        },
        { status: 401 }
      );
    }

    // Connect to database and find user
    await connectDB();
    const user = await User.findById(payload.userId);
    
    if (!user || !user.isActive) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found or deactivated' 
        },
        { status: 401 }
      );
    }

    // Generate new token pair
    const tokens = generateTokenPair({
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role
    });

    // Prepare user data
    const userData = {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      isActive: user.isActive,
      lastLogin: user.lastLogin
    };

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          user: userData,
          accessToken: tokens.accessToken,
          expiresIn: tokens.expiresIn
        }
      },
      { status: 200 }
    );

    // Update refresh token cookie
    const cookieOptions = getCookieOptions(30 * 24 * 60 * 60); // 30 days
    const refreshCookie = createCookieString('refreshToken', tokens.refreshToken, cookieOptions);
    response.headers.set('Set-Cookie', refreshCookie);

    return response;

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
