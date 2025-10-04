import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Customer from '@/models/Customer';
import { authMiddleware } from '@/lib/auth';

export async function POST(request: NextRequest) {
  console.log('🚀 [CREATE-WITH-AUTH] Starting...');
  
  try {
    // Step 1: Test auth middleware
    console.log('🔍 [CREATE-WITH-AUTH] Step 1: Testing auth middleware...');
    
    let authResult;
    try {
      authResult = await authMiddleware(request, ['admin', 'manager']);
      console.log('✅ [CREATE-WITH-AUTH] Auth middleware completed:', {
        success: authResult.success,
        hasUser: !!authResult.user,
        error: authResult.error,
        status: authResult.status
      });
    } catch (authError) {
      console.error('❌ [CREATE-WITH-AUTH] Auth middleware threw exception:', authError);
      console.error('❌ [CREATE-WITH-AUTH] Auth error stack:', authError.stack);
      return NextResponse.json({ 
        success: false, 
        error: 'Auth middleware exception',
        details: authError.message 
      }, { status: 500 });
    }
    
    if (!authResult.success) {
      console.log('❌ [CREATE-WITH-AUTH] Auth failed');
      return NextResponse.json({ 
        success: false, 
        error: authResult.error 
      }, { status: authResult.status || 401 });
    }
    
    console.log('✅ [CREATE-WITH-AUTH] Auth successful, user:', authResult.user?.email);

    // Step 2: Connect to DB
    console.log('🔍 [CREATE-WITH-AUTH] Step 2: Connecting to DB...');
    await connectDB();
    console.log('✅ [CREATE-WITH-AUTH] DB connected');

    // Step 3: Parse request
    console.log('🔍 [CREATE-WITH-AUTH] Step 3: Parsing request...');
    const body = await request.json();
    console.log('✅ [CREATE-WITH-AUTH] Request parsed:', { 
      email: body.email, 
      firstName: body.firstName, 
      lastName: body.lastName 
    });

    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      addresses,
      isActive = true,
      isEmailVerified = false
    } = body;

    // Step 4: Validation
    console.log('🔍 [CREATE-WITH-AUTH] Step 4: Validating...');
    if (!email || !password || !firstName || !lastName) {
      console.log('❌ [CREATE-WITH-AUTH] Validation failed');
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    console.log('✅ [CREATE-WITH-AUTH] Validation passed');

    // Step 5: Check existing
    console.log('🔍 [CREATE-WITH-AUTH] Step 5: Checking existing customer...');
    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });
    if (existingCustomer) {
      console.log('❌ [CREATE-WITH-AUTH] Customer already exists');
      return NextResponse.json(
        { success: false, error: 'Customer already exists' },
        { status: 409 }
      );
    }
    console.log('✅ [CREATE-WITH-AUTH] No existing customer');

    // Step 6: Create customer
    console.log('🔍 [CREATE-WITH-AUTH] Step 6: Creating customer...');
    const customer = new Customer({
      email: email.toLowerCase(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone?.trim(),
      addresses: addresses || [],
      isActive,
      isEmailVerified
    });

    console.log('🔍 [CREATE-WITH-AUTH] Step 7: Saving customer...');
    await customer.save();
    console.log('✅ [CREATE-WITH-AUTH] Customer saved!');

    // Step 8: Return response
    const customerData = customer.toObject();
    delete customerData.password;

    console.log('✅ [CREATE-WITH-AUTH] Success! Returning response...');
    return NextResponse.json({
      success: true,
      message: 'Customer created with auth successfully',
      data: {
        ...customerData,
        fullName: `${customerData.firstName} ${customerData.lastName}`
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ [CREATE-WITH-AUTH] Unexpected error:', error);
    console.error('❌ [CREATE-WITH-AUTH] Error message:', error.message);
    console.error('❌ [CREATE-WITH-AUTH] Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Unexpected error in create-with-auth',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
