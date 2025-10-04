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
    console.log('🔍 [Customer Register] Starting registration...');
    
    await connectDB();
    console.log('✅ [Customer Register] DB connected');

    const body = await request.json();
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      acceptsMarketing = false
    } = body;

    console.log('🔍 [Customer Register] Registration data:', { 
      email, 
      firstName, 
      lastName, 
      phone,
      acceptsMarketing 
    });

    // Validation
    if (!email || !password || !firstName || !lastName) {
      console.log('❌ [Customer Register] Missing required fields');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email, password, first name, and last name are required' 
        },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 6) {
      console.log('❌ [Customer Register] Password too short');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Password must be at least 6 characters long' 
        },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ [Customer Register] Invalid email format');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Please provide a valid email address' 
        },
        { status: 400 }
      );
    }

    // Check if customer already exists
    console.log('🔍 [Customer Register] Checking existing customer...');
    const existingCustomer = await Customer.findOne({ 
      email: email.toLowerCase() 
    });

    if (existingCustomer) {
      console.log('❌ [Customer Register] Customer already exists');
      const response = NextResponse.json(
        { 
          success: false, 
          error: 'An account with this email already exists' 
        },
        { status: 409 }
      );
      
      // Add CORS headers
      const origin = request.headers.get('origin');
      const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3003'];
      response.headers.set('Access-Control-Allow-Origin', allowedOrigins.includes(origin) ? origin : 'http://localhost:3000');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      
      return response;
    }

    // Create new customer
    console.log('🔍 [Customer Register] Creating customer...');
    const customer = new Customer({
      email: email.toLowerCase().trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone?.trim(),
      isActive: true,
      isEmailVerified: false, // Will need email verification later
      acceptsMarketing,
      addresses: []
    });

    await customer.save();
    console.log('✅ [Customer Register] Customer created successfully');

    // Generate JWT tokens
    console.log('🔍 [Customer Register] Generating tokens...');
    const tokenUser = {
      _id: customer._id.toString(),
      email: customer.email,
      name: `${customer.firstName} ${customer.lastName}`,
      role: 'customer'
    };

    const { accessToken, refreshToken } = generateTokenPair(tokenUser);

    // Set refresh token as HTTP-only cookie
    const cookieOptions = getCookieOptions(30 * 24 * 60 * 60); // 30 days
    const refreshCookie = createCookieString('customerRefreshToken', refreshToken, cookieOptions);

    // Prepare customer data for response (exclude password)
    const customerData = customer.toObject();
    delete customerData.password;

    console.log('✅ [Customer Register] Registration successful');

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully',
      data: {
        customer: {
          ...customerData,
          fullName: `${customerData.firstName} ${customerData.lastName}`
        },
        accessToken,
        expiresIn: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
      }
    }, { status: 201 });

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
    console.error('❌ [Customer Register] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Registration failed. Please try again.' 
      },
      { status: 500 }
    );
  }
}
