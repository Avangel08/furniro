import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Customer from '@/models/Customer';
import { generateTokenPair } from '@/lib/jwt';
import { createCookieString, getCookieOptions } from '@/lib/auth';

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3003'];
  
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [Customer Login] Starting login...');
    
    await connectDB();
    console.log('✅ [Customer Login] DB connected');

    const body = await request.json();
    const { email, password, rememberMe = false } = body;

    console.log('🔍 [Customer Login] Login attempt:', { email, rememberMe });

    // Validation
    if (!email || !password) {
      console.log('❌ [Customer Login] Missing credentials');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email and password are required' 
        },
        { status: 400 }
      );
    }

    // Find customer with password field
    console.log('🔍 [Customer Login] Finding customer...');
    const customer = await Customer.findOne({ 
      email: email.toLowerCase().trim() 
    }).select('+password');

    if (!customer) {
      console.log('❌ [Customer Login] Customer not found');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email or password' 
        },
        { status: 401 }
      );
    }

    // Check if customer is active
    if (!customer.isActive) {
      console.log('❌ [Customer Login] Customer account inactive');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Your account has been deactivated. Please contact support.' 
        },
        { status: 401 }
      );
    }

    // Verify password
    console.log('🔍 [Customer Login] Verifying password...');
    const isPasswordValid = await customer.comparePassword(password);

    if (!isPasswordValid) {
      console.log('❌ [Customer Login] Invalid password');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email or password' 
        },
        { status: 401 }
      );
    }

    // Update last login
    customer.lastLogin = new Date();
    await customer.save();

    console.log('✅ [Customer Login] Password verified, updating last login');

    // Generate JWT tokens
    console.log('🔍 [Customer Login] Generating tokens...');
    const tokenUser = {
      _id: customer._id.toString(),
      email: customer.email,
      name: `${customer.firstName} ${customer.lastName}`,
      role: 'customer'
    };

    const { accessToken, refreshToken } = generateTokenPair(tokenUser);

    // Set refresh token cookie (longer expiry if remember me)
    const refreshTokenExpiry = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // 30 days or 7 days
    const cookieOptions = getCookieOptions(refreshTokenExpiry);
    const refreshCookie = createCookieString('customerRefreshToken', refreshToken, cookieOptions);

    // Prepare customer data for response (exclude password)
    const customerData = customer.toObject();
    delete customerData.password;

    console.log('✅ [Customer Login] Login successful');

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        customer: {
          ...customerData,
          fullName: `${customerData.firstName} ${customerData.lastName}`
        },
        accessToken,
        expiresIn: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
      }
    });

    // Add CORS headers
    const origin = request.headers.get('origin');
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3003'];
    response.headers.set('Access-Control-Allow-Origin', allowedOrigins.includes(origin) ? origin : 'http://localhost:3000');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    // Set refresh token cookie
    response.headers.set('Set-Cookie', refreshCookie);

    return response;

  } catch (error) {
    console.error('❌ [Customer Login] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Login failed. Please try again.' 
      },
      { status: 500 }
    );
  }
}
