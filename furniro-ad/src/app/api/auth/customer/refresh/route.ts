import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Customer from '@/models/Customer';
import { verifyRefreshToken, generateTokenPair } from '@/lib/jwt';
import { createCookieString, getCookieOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [Customer Refresh] Processing token refresh...');

    // Get refresh token from cookie
    const cookieHeader = request.headers.get('Cookie');
    let refreshToken = '';

    if (cookieHeader) {
      const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
      const refreshCookie = cookies.find(cookie => cookie.startsWith('customerRefreshToken='));
      if (refreshCookie) {
        refreshToken = refreshCookie.split('=')[1];
      }
    }

    if (!refreshToken) {
      console.log('❌ [Customer Refresh] No refresh token provided');
      return NextResponse.json(
        { 
          success: false, 
          error: 'No refresh token provided' 
        },
        { status: 401 }
      );
    }

    console.log('🔍 [Customer Refresh] Verifying refresh token...');
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded || decoded.type !== 'refresh' || !decoded.userId) {
      console.log('❌ [Customer Refresh] Invalid refresh token');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid refresh token' 
        },
        { status: 401 }
      );
    }

    await connectDB();
    console.log('✅ [Customer Refresh] DB connected');

    // Find customer
    console.log('🔍 [Customer Refresh] Finding customer:', decoded.userId);
    const customer = await Customer.findById(decoded.userId).lean();

    if (!customer || !customer.isActive) {
      console.log('❌ [Customer Refresh] Customer not found or inactive');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Customer not found or inactive' 
        },
        { status: 401 }
      );
    }

    // Generate new tokens
    console.log('🔍 [Customer Refresh] Generating new tokens...');
    const tokenUser = {
      _id: customer._id.toString(),
      email: customer.email,
      name: `${customer.firstName} ${customer.lastName}`,
      role: 'customer'
    };

    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(tokenUser);

    // Set new refresh token cookie
    const cookieOptions = getCookieOptions(7 * 24 * 60 * 60); // 7 days
    const refreshCookie = createCookieString('customerRefreshToken', newRefreshToken, cookieOptions);

    console.log('✅ [Customer Refresh] Token refresh successful');

    const response = NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        expiresIn: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes
        customer: {
          _id: customer._id,
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
          fullName: `${customer.firstName} ${customer.lastName}`,
          isEmailVerified: customer.isEmailVerified
        }
      }
    });

    // Set new refresh token cookie
    response.headers.set('Set-Cookie', refreshCookie);

    return response;

  } catch (error) {
    console.error('❌ [Customer Refresh] Error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid or expired refresh token' 
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Token refresh failed' 
      },
      { status: 500 }
    );
  }
}
