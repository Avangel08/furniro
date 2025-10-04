import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Customer from '@/models/Customer';
import { verifyAccessToken, extractTokenFromHeader } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [Customer Me] Getting customer info...');

    // Extract and verify token
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      console.log('❌ [Customer Me] No token provided');
      return NextResponse.json(
        { 
          success: false, 
          error: 'No authorization token provided' 
        },
        { status: 401 }
      );
    }

    console.log('🔍 [Customer Me] Verifying token...');
    const decoded = verifyAccessToken(token);

    if (!decoded || decoded.role !== 'customer') {
      console.log('❌ [Customer Me] Invalid token or not customer token');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid or expired token' 
        },
        { status: 401 }
      );
    }

    await connectDB();
    console.log('✅ [Customer Me] DB connected');

    // Find customer
    console.log('🔍 [Customer Me] Finding customer:', decoded.userId);
    const customer = await Customer.findById(decoded.userId).lean();

    if (!customer) {
      console.log('❌ [Customer Me] Customer not found');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Customer not found' 
        },
        { status: 404 }
      );
    }

    // Check if customer is still active
    if (!customer.isActive) {
      console.log('❌ [Customer Me] Customer inactive');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Account has been deactivated' 
        },
        { status: 401 }
      );
    }

    console.log('✅ [Customer Me] Customer info retrieved successfully');

    return NextResponse.json({
      success: true,
      data: {
        customer: {
          ...customer,
          fullName: `${customer.firstName} ${customer.lastName}`,
          defaultShippingAddress: customer.addresses?.find(
            addr => addr.isDefault && addr.type === 'shipping'
          ),
          defaultBillingAddress: customer.addresses?.find(
            addr => addr.isDefault && addr.type === 'billing'
          )
        }
      }
    });

  } catch (error) {
    console.error('❌ [Customer Me] Error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid or expired token' 
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get customer information' 
      },
      { status: 500 }
    );
  }
}
