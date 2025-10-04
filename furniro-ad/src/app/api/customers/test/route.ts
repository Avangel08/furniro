import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Customer from '@/models/Customer';

// Simple test endpoint without auth
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 [TEST] Starting customer creation test...');
    
    await connectDB();
    console.log('✅ [TEST] DB connected');
    
    console.log('🔍 [TEST] Customer model:', !!Customer);
    
    const body = await request.json();
    console.log('🔍 [TEST] Request body:', { ...body, password: '[REDACTED]' });
    
    const {
      email,
      password,
      firstName,
      lastName,
      phone
    } = body;

    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      console.log('❌ [TEST] Validation failed');
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    console.log('✅ [TEST] Validation passed');

    // Check existing customer
    console.log('🔍 [TEST] Checking existing customer...');
    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });
    if (existingCustomer) {
      console.log('❌ [TEST] Customer exists');
      return NextResponse.json(
        { success: false, error: 'Customer already exists' },
        { status: 409 }
      );
    }
    
    console.log('✅ [TEST] No existing customer');

    // Create customer
    console.log('🔍 [TEST] Creating customer...');
    const customer = new Customer({
      email: email.toLowerCase(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone?.trim(),
      isActive: true,
      isEmailVerified: false
    });

    console.log('🔍 [TEST] Saving customer...');
    await customer.save();
    console.log('✅ [TEST] Customer saved successfully!');

    // Return success
    const customerData = customer.toObject();
    delete customerData.password;

    return NextResponse.json({
      success: true,
      message: 'Customer created successfully',
      data: {
        ...customerData,
        fullName: `${customerData.firstName} ${customerData.lastName}`
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ [TEST] Error details:', error);
    console.error('❌ [TEST] Error message:', error.message);
    console.error('❌ [TEST] Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test creation failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
