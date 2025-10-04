import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateTokenPair } from '@/lib/jwt';
import { createCookieString, getCookieOptions } from '@/lib/auth';

// Force import the User model to ensure it's registered
console.log('🔧 User model loaded:', !!User);

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email and password are required' 
        },
        { status: 400 }
      );
    }

    // Find user by email (include password for comparison)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    console.log('🔍 Login Debug:', {
      email: email.toLowerCase(),
      userFound: !!user,
      userEmail: user?.email,
      userActive: user?.isActive
    });
    
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email or password' 
        },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Account is deactivated. Please contact administrator.' 
        },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email or password' 
        },
        { status: 401 }
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT tokens
    const tokens = generateTokenPair({
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role
    });

    // Prepare user data (without password)
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
        message: 'Login successful',
        data: {
          user: userData,
          accessToken: tokens.accessToken,
          expiresIn: tokens.expiresIn
        }
      },
      { status: 200 }
    );

    // Set HTTP-only cookie for refresh token
    const cookieOptions = getCookieOptions(30 * 24 * 60 * 60); // 30 days
    const refreshCookie = createCookieString('refreshToken', tokens.refreshToken, cookieOptions);
    response.headers.set('Set-Cookie', refreshCookie);

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
